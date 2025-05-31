import type { FormField, PrefillConfig } from "./form-types"

// Cache for prefill results
const prefillCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Internal context data (would be populated from actual app context)
const getInternalContext = () => ({
  user: {
    id: "user-123",
    email: "appraiser@example.com",
    name: "John Appraiser",
    organization_id: "org-456",
  },
  form: {
    subject_id: "property-789",
    property_id: "prop-101",
    borrower_id: "borrower-202",
    appraiser_id: "appraiser-303",
  },
})

// Lookup tables
const lookupTables = {
  user_roles: ["Appraiser", "Reviewer", "Admin", "Trainee"],
  property_types: ["Single Family", "Condo", "Townhouse", "Multi-Family", "Commercial"],
  states: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA"],
  appraisal_purposes: ["Purchase", "Refinance", "Home Equity", "PMI Removal"],
}

export interface PrefillResult {
  success: boolean
  value?: any
  source: string
  cached: boolean
  error?: string
}

export class PrefillService {
  // Generate cache key
  private getCacheKey(config: PrefillConfig, contextKey?: string): string {
    return `${config.source}_${config.key || ""}_${config.endpoint || ""}_${contextKey || ""}`
  }

  // Check if cache is valid
  private isCacheValid(cacheKey: string): boolean {
    const cached = prefillCache.get(cacheKey)
    if (!cached) return false

    const now = Date.now()
    return now - cached.timestamp < cached.ttl * 1000
  }

  // Get from cache
  private getFromCache(cacheKey: string): any {
    const cached = prefillCache.get(cacheKey)
    return cached?.data
  }

  // Set cache
  private setCache(cacheKey: string, data: any, ttl: number): void {
    prefillCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  // Clear cache
  public clearCache(pattern?: string): void {
    if (!pattern) {
      prefillCache.clear()
      return
    }

    for (const key of prefillCache.keys()) {
      if (key.includes(pattern)) {
        prefillCache.delete(key)
      }
    }
  }

  // Get value from nested object using dot notation
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }

  // Prefill from internal context
  private async prefillFromInternal(config: PrefillConfig): Promise<PrefillResult> {
    try {
      const context = getInternalContext()
      const value = this.getNestedValue(context, config.key || "")

      if (value === undefined || value === null) {
        return {
          success: false,
          source: "internal",
          cached: false,
          error: `No value found for key: ${config.key}`,
        }
      }

      return {
        success: true,
        value,
        source: "internal",
        cached: false,
      }
    } catch (error) {
      return {
        success: false,
        source: "internal",
        cached: false,
        error: error instanceof Error ? error.message : "Internal prefill failed",
      }
    }
  }

  // Prefill from API
  private async prefillFromAPI(config: PrefillConfig, contextKey?: string): Promise<PrefillResult> {
    if (!config.endpoint) {
      return {
        success: false,
        source: "api",
        cached: false,
        error: "No endpoint specified",
      }
    }

    // Replace dynamic parameters in endpoint
    let endpoint = config.endpoint
    if (contextKey && endpoint.includes(":id")) {
      endpoint = endpoint.replace(":id", contextKey)
    }

    const cacheKey = this.getCacheKey(config, contextKey)

    // Check cache first
    if (config.cacheTimeout && config.cacheTimeout > 0 && this.isCacheValid(cacheKey)) {
      return {
        success: true,
        value: this.getFromCache(cacheKey),
        source: "api",
        cached: true,
      }
    }

    // Make API call with retry logic
    let lastError: Error | null = null
    const maxRetries = config.retryAttempts || 3

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        let value = data

        // Apply field mapping if provided
        if (config.fieldMap && Object.keys(config.fieldMap).length > 0) {
          value = {}
          for (const [sourceField, targetField] of Object.entries(config.fieldMap)) {
            const sourceValue = this.getNestedValue(data, sourceField)
            if (sourceValue !== undefined) {
              value[targetField] = sourceValue
            }
          }
        }

        // Cache the result
        if (config.cacheTimeout && config.cacheTimeout > 0) {
          this.setCache(cacheKey, value, config.cacheTimeout)
        }

        return {
          success: true,
          value,
          source: "api",
          cached: false,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown API error")

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    return {
      success: false,
      source: "api",
      cached: false,
      error: lastError?.message || "API prefill failed after retries",
    }
  }

  // Prefill from lookup table
  private async prefillFromLookup(config: PrefillConfig): Promise<PrefillResult> {
    try {
      const tableName = config.key as keyof typeof lookupTables
      const data = lookupTables[tableName]

      if (!data) {
        return {
          success: false,
          source: "lookup",
          cached: false,
          error: `Lookup table not found: ${config.key}`,
        }
      }

      return {
        success: true,
        value: data,
        source: "lookup",
        cached: false,
      }
    } catch (error) {
      return {
        success: false,
        source: "lookup",
        cached: false,
        error: error instanceof Error ? error.message : "Lookup prefill failed",
      }
    }
  }

  // Main prefill method
  public async prefillField(field: FormField, contextKey?: string): Promise<PrefillResult> {
    const config = field.prefill_config

    if (!config || !config.enabled) {
      return {
        success: false,
        source: "none",
        cached: false,
        error: "Prefill not enabled for this field",
      }
    }

    let result: PrefillResult

    switch (config.source) {
      case "internal":
        result = await this.prefillFromInternal(config)
        break
      case "api":
        result = await this.prefillFromAPI(config, contextKey)
        break
      case "lookup":
        result = await this.prefillFromLookup(config)
        break
      default:
        result = {
          success: false,
          source: config.source,
          cached: false,
          error: `Unknown prefill source: ${config.source}`,
        }
    }

    // Apply fallback value if prefill failed
    if (!result.success && config.fallbackValue !== undefined) {
      result = {
        success: true,
        value: config.fallbackValue,
        source: `${config.source}_fallback`,
        cached: false,
      }
    }

    return result
  }

  // Prefill multiple fields
  public async prefillFields(fields: FormField[], contextKey?: string): Promise<Record<string, PrefillResult>> {
    const results: Record<string, PrefillResult> = {}

    const prefillPromises = fields
      .filter((field) => field.prefill_config?.enabled)
      .map(async (field) => {
        const result = await this.prefillField(field, contextKey)
        results[field.id] = result
        return { fieldId: field.id, result }
      })

    await Promise.all(prefillPromises)
    return results
  }

  // Get cache statistics
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: prefillCache.size,
      keys: Array.from(prefillCache.keys()),
    }
  }
}

// Export singleton instance
export const prefillService = new PrefillService()

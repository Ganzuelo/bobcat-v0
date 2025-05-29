"use client"

/**
 * Development warnings system for Project Bobcat
 * Provides detailed warnings for common development issues
 */

// Warning levels
export enum WarningLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  CRITICAL = "critical",
}

// Warning categories
export enum WarningCategory {
  PERFORMANCE = "performance",
  ACCESSIBILITY = "accessibility",
  DATA_INTEGRITY = "data-integrity",
  VALIDATION = "validation",
  SECURITY = "security",
  BEST_PRACTICES = "best-practices",
  DEPRECATION = "deprecation",
  CONFIGURATION = "configuration",
}

interface DevWarning {
  id: string
  level: WarningLevel
  category: WarningCategory
  message: string
  details?: unknown
  suggestion?: string
  documentation?: string
  timestamp: number
  component?: string
  stack?: string
}

interface WarningConfig {
  enabled: boolean
  level: WarningLevel
  categories: WarningCategory[]
  suppressedWarnings: string[]
  maxWarnings: number
}

// Client-safe check for development environment
const isDevelopment =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    : false

// Default configuration
const DEFAULT_CONFIG: WarningConfig = {
  enabled: isDevelopment,
  level: WarningLevel.INFO,
  categories: Object.values(WarningCategory),
  suppressedWarnings: [],
  maxWarnings: 100,
}

class DevWarningsManager {
  private config: WarningConfig = DEFAULT_CONFIG
  private warnings: DevWarning[] = []
  private warningCounts = new Map<string, number>()

  configure(config: Partial<WarningConfig>) {
    this.config = { ...this.config, ...config }
  }

  private shouldShowWarning(level: WarningLevel, category: WarningCategory, id: string): boolean {
    if (!this.config.enabled) return false
    if (this.config.suppressedWarnings.includes(id)) return false
    if (!this.config.categories.includes(category)) return false

    const levelPriority = {
      [WarningLevel.INFO]: 0,
      [WarningLevel.WARN]: 1,
      [WarningLevel.ERROR]: 2,
      [WarningLevel.CRITICAL]: 3,
    }

    return levelPriority[level] >= levelPriority[this.config.level]
  }

  private logWarning(warning: DevWarning) {
    const prefix = `🔧 [${warning.category.toUpperCase()}]`
    const component = warning.component ? ` [${warning.component}]` : ""
    const message = `${prefix}${component} ${warning.message}`

    switch (warning.level) {
      case WarningLevel.INFO:
        console.info(message, warning.details)
        break
      case WarningLevel.WARN:
        console.warn(message, warning.details)
        break
      case WarningLevel.ERROR:
        console.error(message, warning.details)
        break
      case WarningLevel.CRITICAL:
        console.error(`🚨 CRITICAL: ${message}`, warning.details)
        break
    }

    if (warning.suggestion) {
      console.info(`💡 Suggestion: ${warning.suggestion}`)
    }

    if (warning.documentation) {
      console.info(`📚 Documentation: ${warning.documentation}`)
    }

    if (warning.stack && warning.level !== WarningLevel.INFO) {
      console.groupCollapsed("Stack trace")
      console.log(warning.stack)
      console.groupEnd()
    }
  }

  warn(
    id: string,
    level: WarningLevel,
    category: WarningCategory,
    message: string,
    options: {
      details?: unknown
      suggestion?: string
      documentation?: string
      component?: string
      maxOccurrences?: number
    } = {},
  ) {
    if (!this.shouldShowWarning(level, category, id)) return

    // Prevent spam by limiting occurrences
    const count = this.warningCounts.get(id) || 0
    const maxOccurrences = options.maxOccurrences || 5

    if (count >= maxOccurrences) {
      if (count === maxOccurrences) {
        console.warn(`⚠️ Warning "${id}" suppressed after ${maxOccurrences} occurrences`)
      }
      return
    }

    this.warningCounts.set(id, count + 1)

    const warning: DevWarning = {
      id,
      level,
      category,
      message,
      details: options.details,
      suggestion: options.suggestion,
      documentation: options.documentation,
      component: options.component,
      timestamp: Date.now(),
      stack: new Error().stack,
    }

    this.warnings.push(warning)

    // Limit total warnings
    if (this.warnings.length > this.config.maxWarnings) {
      this.warnings = this.warnings.slice(-this.config.maxWarnings)
    }

    this.logWarning(warning)
  }

  getWarnings(): DevWarning[] {
    return [...this.warnings]
  }

  getWarningsByCategory(category: WarningCategory): DevWarning[] {
    return this.warnings.filter((w) => w.category === category)
  }

  clearWarnings() {
    this.warnings = []
    this.warningCounts.clear()
  }

  suppressWarning(id: string) {
    this.config.suppressedWarnings.push(id)
  }
}

// Global instance
const devWarnings = new DevWarningsManager()

// Convenience functions
export function warnPerformance(
  id: string,
  message: string,
  options?: {
    details?: unknown
    suggestion?: string
    component?: string
    level?: WarningLevel
  },
) {
  devWarnings.warn(id, options?.level || WarningLevel.WARN, WarningCategory.PERFORMANCE, message, options)
}

export function warnAccessibility(
  id: string,
  message: string,
  options?: {
    details?: unknown
    suggestion?: string
    component?: string
    level?: WarningLevel
  },
) {
  devWarnings.warn(id, options?.level || WarningLevel.WARN, WarningCategory.ACCESSIBILITY, message, options)
}

export function warnDataIntegrity(
  id: string,
  message: string,
  options?: {
    details?: unknown
    suggestion?: string
    component?: string
    level?: WarningLevel
  },
) {
  devWarnings.warn(id, options?.level || WarningLevel.ERROR, WarningCategory.DATA_INTEGRITY, message, options)
}

export function warnValidation(
  id: string,
  message: string,
  options?: {
    details?: unknown
    suggestion?: string
    component?: string
    level?: WarningLevel
  },
) {
  devWarnings.warn(id, options?.level || WarningLevel.WARN, WarningCategory.VALIDATION, message, options)
}

export function warnSecurity(
  id: string,
  message: string,
  options?: {
    details?: unknown
    suggestion?: string
    component?: string
    level?: WarningLevel
  },
) {
  devWarnings.warn(id, options?.level || WarningLevel.ERROR, WarningCategory.SECURITY, message, options)
}

export function warnBestPractices(
  id: string,
  message: string,
  options?: {
    details?: unknown
    suggestion?: string
    component?: string
    level?: WarningLevel
  },
) {
  devWarnings.warn(id, options?.level || WarningLevel.INFO, WarningCategory.BEST_PRACTICES, message, options)
}

export function warnDeprecation(
  id: string,
  message: string,
  options?: {
    details?: unknown
    suggestion?: string
    component?: string
    level?: WarningLevel
  },
) {
  devWarnings.warn(id, options?.level || WarningLevel.WARN, WarningCategory.DEPRECATION, message, options)
}

export function warnConfiguration(
  id: string,
  message: string,
  options?: {
    details?: unknown
    suggestion?: string
    component?: string
    level?: WarningLevel
  },
) {
  devWarnings.warn(id, options?.level || WarningLevel.WARN, WarningCategory.CONFIGURATION, message, options)
}

// Performance monitoring utilities
export function measurePerformance<T>(
  operation: () => T,
  operationName: string,
  warningThreshold = 100,
  component?: string,
): T {
  if (!isDevelopment) {
    return operation()
  }

  const start = performance.now()
  const result = operation()
  const duration = performance.now() - start

  if (duration > warningThreshold) {
    warnPerformance(
      `slow-operation-${operationName}`,
      `Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`,
      {
        details: { duration, threshold: warningThreshold },
        suggestion: `Consider optimizing ${operationName} or increasing the warning threshold`,
        component,
      },
    )
  }

  return result
}

export async function measureAsyncPerformance<T>(
  operation: () => Promise<T>,
  operationName: string,
  warningThreshold = 1000,
  component?: string,
): Promise<T> {
  if (!isDevelopment) {
    return operation()
  }

  const start = performance.now()
  const result = await operation()
  const duration = performance.now() - start

  if (duration > warningThreshold) {
    warnPerformance(
      `slow-async-operation-${operationName}`,
      `Slow async operation detected: ${operationName} took ${duration.toFixed(2)}ms`,
      {
        details: { duration, threshold: warningThreshold },
        suggestion: `Consider optimizing ${operationName} or adding loading states`,
        component,
      },
    )
  }

  return result
}

// Data validation warnings
export function checkDataStructure(data: unknown, expectedStructure: string, component?: string) {
  if (!isDevelopment) return

  if (data === null || data === undefined) {
    warnDataIntegrity("null-data", `Received null/undefined data where ${expectedStructure} was expected`, {
      details: { data, expectedStructure },
      suggestion: "Add null checks and provide fallback values",
      component,
    })
    return
  }

  if (Array.isArray(data) && data.length === 0) {
    warnDataIntegrity("empty-array", `Received empty array where ${expectedStructure} was expected`, {
      details: { expectedStructure },
      suggestion: "Consider providing default data or showing empty state UI",
      component,
      level: WarningLevel.INFO,
    })
  }
}

// Accessibility warnings
export function checkAccessibility(element: HTMLElement | null, requirements: string[], component?: string) {
  if (!isDevelopment || !element) return

  requirements.forEach((requirement) => {
    switch (requirement) {
      case "aria-label":
        if (!element.getAttribute("aria-label") && !element.getAttribute("aria-labelledby")) {
          warnAccessibility("missing-aria-label", "Element missing aria-label or aria-labelledby", {
            details: { element: element.tagName, id: element.id },
            suggestion: "Add aria-label or aria-labelledby attribute",
            documentation: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label",
            component,
          })
        }
        break

      case "keyboard-navigation":
        if (element.tabIndex < 0 && !element.getAttribute("tabindex")) {
          warnAccessibility("keyboard-navigation", "Interactive element may not be keyboard accessible", {
            details: { element: element.tagName, id: element.id },
            suggestion: "Ensure element is focusable with keyboard navigation",
            component,
          })
        }
        break

      case "color-contrast":
        // This would require more complex color analysis
        // For now, just warn about potential issues
        const style = window.getComputedStyle(element)
        if (style.color === style.backgroundColor) {
          warnAccessibility("color-contrast", "Potential color contrast issue detected", {
            details: { color: style.color, backgroundColor: style.backgroundColor },
            suggestion: "Ensure sufficient color contrast for accessibility",
            component,
          })
        }
        break
    }
  })
}

// Export the manager for advanced usage
export { devWarnings }
export type { DevWarning, WarningConfig }

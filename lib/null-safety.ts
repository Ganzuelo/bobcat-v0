/**
 * Comprehensive null safety utilities for Project Bobcat
 * Provides safe data access with fallbacks and development warnings
 */

// Type guards
export function isNull(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

export function isString(value: unknown): value is string {
  return typeof value === "string"
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean"
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

// Safe type conversions
export function safeString(value: unknown, fallback = ""): string {
  if (isString(value)) return value
  if (isNumber(value)) return value.toString()
  if (isBoolean(value)) return value.toString()

  if (process.env.NODE_ENV === "development" && !isNull(value)) {
    console.warn(`safeString: Converting ${typeof value} to string, using fallback: "${fallback}"`)
  }

  return fallback
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (isNumber(value)) return value
  if (isString(value)) {
    const parsed = Number.parseFloat(value)
    if (!isNaN(parsed)) return parsed
  }

  if (process.env.NODE_ENV === "development" && !isNull(value)) {
    console.warn(`safeNumber: Converting ${typeof value} to number, using fallback: ${fallback}`)
  }

  return fallback
}

export function safeBoolean(value: unknown, fallback = false): boolean {
  if (isBoolean(value)) return value
  if (isString(value)) return value.toLowerCase() === "true"
  if (isNumber(value)) return value !== 0

  if (process.env.NODE_ENV === "development" && !isNull(value)) {
    console.warn(`safeBoolean: Converting ${typeof value} to boolean, using fallback: ${fallback}`)
  }

  return fallback
}

// Safe array operations
export function safeArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (isArray(value)) return value as T[]

  if (process.env.NODE_ENV === "development" && !isNull(value)) {
    console.warn(`safeArray: Value is not an array (${typeof value}), using fallback`)
  }

  return fallback
}

export function safeArrayIndex<T>(array: T[], index: number, fallback?: T): T | undefined {
  if (!isArray(array) || index < 0 || index >= array.length) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`safeArrayIndex: Invalid array access at index ${index}`)
    }
    return fallback
  }
  return array[index]
}

// Safe object operations
export function safeObject(value: unknown, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  if (isObject(value)) return value

  if (process.env.NODE_ENV === "development" && !isNull(value)) {
    console.warn(`safeObject: Value is not an object (${typeof value}), using fallback`)
  }

  return fallback
}

export function safeProp<T>(obj: unknown, key: string, fallback: T): T {
  if (isObject(obj) && key in obj) {
    return obj[key] as T
  }

  if (process.env.NODE_ENV === "development" && !isNull(obj)) {
    console.warn(`safeProp: Property "${key}" not found in object, using fallback`)
  }

  return fallback
}

// Safe function calls
export function safeCall<T extends unknown[], R>(
  fn: ((...args: T) => R) | null | undefined,
  args: T,
  fallback?: R,
): R | undefined {
  if (typeof fn === "function") {
    try {
      return fn(...args)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("safeCall: Function execution failed:", error)
      }
      return fallback
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.warn("safeCall: Function is null or undefined")
  }

  return fallback
}

// Safe event handlers
export function safeEventHandler<T extends Event>(
  handler: ((event: T) => void) | null | undefined,
  debugName = "Unknown handler",
): (event: T) => void {
  return (event: T) => {
    if (typeof handler === "function") {
      try {
        handler(event)
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error(`safeEventHandler (${debugName}): Handler execution failed:`, error)
        }
      }
    } else if (process.env.NODE_ENV === "development") {
      console.warn(`safeEventHandler (${debugName}): Handler is null or undefined`)
    }
  }
}

// Safe ID validation
export function safeId(value: unknown, prefix = "id"): string {
  const id = safeString(value)
  if (id && id.length > 0) return id

  const fallbackId = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  if (process.env.NODE_ENV === "development") {
    console.warn(`safeId: Invalid ID provided, generated fallback: ${fallbackId}`)
  }

  return fallbackId
}

// Development assertions
export function devAssert(condition: boolean, message: string): void {
  if (process.env.NODE_ENV === "development" && !condition) {
    console.error(`Assertion failed: ${message}`)
  }
}

export function devWarn(condition: boolean, message: string): void {
  if (process.env.NODE_ENV === "development" && !condition) {
    console.warn(`Warning: ${message}`)
  }
}

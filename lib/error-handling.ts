"use client"

/**
 * Comprehensive error handling utilities for Project Bobcat
 * Provides error boundaries, retry mechanisms, and error state management
 */

// Error types
export interface AppError {
  code: string
  message: string
  details?: unknown
  timestamp: number
  stack?: string
}

export interface ErrorState {
  hasError: boolean
  error: AppError | null
  retryCount: number
  isRetrying: boolean
}

export interface RetryOptions {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
  shouldRetry?: (error: unknown) => boolean
}

// Error codes
export const ERROR_CODES = {
  // Form Builder Errors
  FORM_DATA_INVALID: "FORM_DATA_INVALID",
  FORM_SAVE_FAILED: "FORM_SAVE_FAILED",
  FORM_LOAD_FAILED: "FORM_LOAD_FAILED",
  FORM_VALIDATION_FAILED: "FORM_VALIDATION_FAILED",

  // Field Errors
  FIELD_CREATE_FAILED: "FIELD_CREATE_FAILED",
  FIELD_UPDATE_FAILED: "FIELD_UPDATE_FAILED",
  FIELD_DELETE_FAILED: "FIELD_DELETE_FAILED",
  FIELD_VALIDATION_FAILED: "FIELD_VALIDATION_FAILED",

  // Section Errors
  SECTION_CREATE_FAILED: "SECTION_CREATE_FAILED",
  SECTION_UPDATE_FAILED: "SECTION_UPDATE_FAILED",
  SECTION_DELETE_FAILED: "SECTION_DELETE_FAILED",

  // Page Errors
  PAGE_CREATE_FAILED: "PAGE_CREATE_FAILED",
  PAGE_UPDATE_FAILED: "PAGE_UPDATE_FAILED",
  PAGE_DELETE_FAILED: "PAGE_DELETE_FAILED",
  PAGE_REORDER_FAILED: "PAGE_REORDER_FAILED",

  // Network Errors
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",

  // Generic Errors
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  PERMISSION_ERROR: "PERMISSION_ERROR",
} as const

// Error creation utilities
export function createAppError(code: string, message: string, details?: unknown, originalError?: unknown): AppError {
  const error: AppError = {
    code,
    message,
    details,
    timestamp: Date.now(),
  }

  if (originalError instanceof Error) {
    error.stack = originalError.stack
  }

  return error
}

export function createFormError(message: string, details?: unknown): AppError {
  return createAppError(ERROR_CODES.FORM_DATA_INVALID, message, details)
}

export function createFieldError(message: string, details?: unknown): AppError {
  return createAppError(ERROR_CODES.FIELD_VALIDATION_FAILED, message, details)
}

export function createNetworkError(message: string, details?: unknown): AppError {
  return createAppError(ERROR_CODES.NETWORK_ERROR, message, details)
}

// Error classification
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("fetch") || error.message.includes("network") || error.message.includes("timeout")
  }
  return false
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("validation") || error.message.includes("invalid") || error.message.includes("required")
    )
  }
  return false
}

export function isRetryableError(error: unknown): boolean {
  return isNetworkError(error) || (error instanceof Error && error.message.includes("temporary"))
}

// Retry utilities
export async function withRetry<T>(operation: () => Promise<T>, options: Partial<RetryOptions> = {}): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, backoffMultiplier = 2, shouldRetry = isRetryableError } = options

  let lastError: unknown
  let delay = retryDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }

      if (process.env.NODE_ENV === "development") {
        console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, error)
      }

      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= backoffMultiplier
    }
  }

  throw lastError
}

// Error logging
export function logError(error: AppError | unknown, context?: string): void {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` [${context}]` : ""

  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 Error${contextStr} - ${timestamp}`)

    if (isAppError(error)) {
      console.error(`Code: ${error.code}`)
      console.error(`Message: ${error.message}`)
      if (error.details) {
        console.error("Details:", error.details)
      }
      if (error.stack) {
        console.error("Stack:", error.stack)
      }
    } else {
      console.error("Error:", error)
    }

    console.groupEnd()
  }

  // In production, you might want to send errors to a logging service
  // Example: sendToLoggingService(error, context)
}

// Error type guards
export function isAppError(error: unknown): error is AppError {
  return typeof error === "object" && error !== null && "code" in error && "message" in error && "timestamp" in error
}

// Error recovery utilities
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "An unknown error occurred"
}

export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code
  }

  return ERROR_CODES.UNKNOWN_ERROR
}

// Error boundary utilities
export function createErrorBoundaryFallback(componentName: string) {
  return function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong in {componentName}</h2>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button onClick={resetError} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Try again
        </button>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary className="cursor-pointer text-red-700">Error Details</summary>
            <pre className="mt-2 text-xs text-red-600 overflow-auto">{error.stack}</pre>
          </details>
        )}
      </div>
    )
  }
}

// Async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorContext?: string,
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    const appError = isAppError(error)
      ? error
      : createAppError(ERROR_CODES.UNKNOWN_ERROR, getErrorMessage(error), error)

    logError(appError, errorContext)
    return { data: null, error: appError }
  }
}

// Validation utilities
export function validateRequired(value: unknown, fieldName: string): void {
  if (value === null || value === undefined || value === "") {
    throw createAppError(ERROR_CODES.VALIDATION_ERROR, `${fieldName} is required`, { field: fieldName, value })
  }
}

export function validateArray(value: unknown, fieldName: string): void {
  if (!Array.isArray(value)) {
    throw createAppError(ERROR_CODES.VALIDATION_ERROR, `${fieldName} must be an array`, {
      field: fieldName,
      value,
      type: typeof value,
    })
  }
}

export function validateObject(value: unknown, fieldName: string): void {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw createAppError(ERROR_CODES.VALIDATION_ERROR, `${fieldName} must be an object`, {
      field: fieldName,
      value,
      type: typeof value,
    })
  }
}

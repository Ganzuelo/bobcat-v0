"use client"

import { useState, useCallback, useRef } from "react"
import type { AppError, ErrorState, RetryOptions } from "@/lib/error-handling"
import {
  createAppError,
  logError,
  getErrorMessage,
  getErrorCode,
  withRetry,
  ERROR_CODES,
  isRetryableError,
} from "@/lib/error-handling"

interface UseErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  logErrors?: boolean
  onError?: (error: AppError) => void
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { maxRetries = 3, retryDelay = 1000, logErrors = true, onError } = options

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0,
    isRetrying: false,
  })

  const retryTimeoutRef = useRef<NodeJS.Timeout>()

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = undefined
    }
  }, [])

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const appError =
        error instanceof Error && "code" in error
          ? (error as AppError)
          : createAppError(getErrorCode(error), getErrorMessage(error), error)

      if (logErrors) {
        logError(appError, context)
      }

      setErrorState((prev) => ({
        hasError: true,
        error: appError,
        retryCount: prev.retryCount,
        isRetrying: false,
      }))

      onError?.(appError)
    },
    [logErrors, onError],
  )

  const clearError = useCallback(() => {
    clearRetryTimeout()
    setErrorState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
    })
  }, [clearRetryTimeout])

  const retry = useCallback(
    async (operation: () => Promise<void> | void) => {
      if (errorState.retryCount >= maxRetries) {
        handleError(
          createAppError(ERROR_CODES.UNKNOWN_ERROR, `Maximum retry attempts (${maxRetries}) exceeded`),
          "retry",
        )
        return
      }

      setErrorState((prev) => ({
        ...prev,
        isRetrying: true,
        retryCount: prev.retryCount + 1,
      }))

      try {
        await operation()
        clearError()
      } catch (error) {
        handleError(error, "retry")
      }
    },
    [errorState.retryCount, maxRetries, handleError, clearError],
  )

  const autoRetry = useCallback(
    (operation: () => Promise<void> | void) => {
      if (!isRetryableError(errorState.error) || errorState.retryCount >= maxRetries) {
        return
      }

      const delay = retryDelay * Math.pow(2, errorState.retryCount)

      retryTimeoutRef.current = setTimeout(() => {
        retry(operation)
      }, delay)
    },
    [errorState.error, errorState.retryCount, maxRetries, retryDelay, retry],
  )

  const safeAsync = useCallback(\
    async <T>(operation: () => Promise<T>, context?: string): Promise<T | null> => {
  try {
    clearError()
    return await operation()
  } catch (error) {
    handleError(error, context)
    return null
  }
}
,
    [handleError, clearError]
  )

const safeAsyncWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      retryOptions?: Partial<RetryOptions>,
      context?: string
    ): Promise<T | null> => {
try {
  clearError()
  return await withRetry(operation, {
          maxRetries,
          retryDelay,
          shouldRetry: isRetryableError,
          ...retryOptions,
        })
} catch (error) {
  handleError(error, context)
  return null
}
},
    [handleError, clearError, maxRetries, retryDelay]
  )

const safeSync = useCallback(
    <T>(operation: () => T, context?: string): T | null => {
      try {
        clearError()
        return operation()
      } catch (error) {
        handleError(error, context)
        return null
      }
    },
    [handleError, clearError]
  )

  const canRetry = errorState.error ? isRetryableError(errorState.error) : false
  const hasMaxRetries = errorState.retryCount >= maxRetries

  return {
    ...errorState,
    handleError,
    clearError,
    retry,
    autoRetry,
    safeAsync,
    safeAsyncWithRetry,
    safeSync,
    canRetry,
    hasMaxRetries,
  }
}

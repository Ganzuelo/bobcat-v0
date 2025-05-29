"use client"

import { useState, useCallback, useRef } from "react"

export interface AppError {
  code: string
  message: string
  details?: unknown
  timestamp: number
}

export interface ErrorState {
  hasError: boolean
  error: AppError | null
  retryCount: number
  isRetrying: boolean
}

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

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const appError: AppError = {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : String(error),
        details: error,
        timestamp: Date.now(),
      }

      if (logErrors) {
        console.error(`Error in ${context}:`, appError)
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
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = undefined
    }
    setErrorState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
    })
  }, [])

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

  return {
    ...errorState,
    handleError,
    clearError,
    safeAsync,
    safeSync,
    canRetry: errorState.retryCount < maxRetries,
  }
}

"use client"

import { useState, useCallback, useRef } from "react"
import type { AppError } from "@/lib/error-handling"
import { getErrorMessage, getErrorCode } from "@/lib/error-handling"

export interface ToastNotification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface UseToastNotificationsOptions {
  maxToasts?: number
  defaultDuration?: number
}

export function useToastNotifications(options: UseToastNotificationsOptions = {}) {
  const { maxToasts = 5, defaultDuration = 5000 } = options

  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Clear timeout for a toast
  const clearToastTimeout = useCallback((id: string) => {
    const timeout = timeoutsRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutsRef.current.delete(id)
    }
  }, [])

  // Remove toast
  const removeToast = useCallback(
    (id: string) => {
      clearToastTimeout(id)
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    },
    [clearToastTimeout],
  )

  // Add toast
  const addToast = useCallback(
    (toast: Omit<ToastNotification, "id">) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const duration = toast.duration ?? defaultDuration

      const newToast: ToastNotification = {
        ...toast,
        id,
      }

      setToasts((prev) => {
        const newToasts = [newToast, ...prev]
        return newToasts.slice(0, maxToasts)
      })

      // Auto-remove toast after duration
      if (duration > 0) {
        const timeout = setTimeout(() => {
          removeToast(id)
        }, duration)

        timeoutsRef.current.set(id, timeout)
      }

      return id
    },
    [defaultDuration, maxToasts, removeToast],
  )

  // Toast type helpers
  const showSuccess = useCallback(
    (title: string, message?: string, options?: Partial<ToastNotification>) => {
      return addToast({
        type: "success",
        title,
        message: message || "",
        ...options,
      })
    },
    [addToast],
  )

  const showError = useCallback(
    (title: string, message?: string, options?: Partial<ToastNotification>) => {
      return addToast({
        type: "error",
        title,
        message: message || "",
        duration: 0, // Errors don't auto-dismiss
        ...options,
      })
    },
    [addToast],
  )

  const showWarning = useCallback(
    (title: string, message?: string, options?: Partial<ToastNotification>) => {
      return addToast({
        type: "warning",
        title,
        message: message || "",
        ...options,
      })
    },
    [addToast],
  )

  const showInfo = useCallback(
    (title: string, message?: string, options?: Partial<ToastNotification>) => {
      return addToast({
        type: "info",
        title,
        message: message || "",
        ...options,
      })
    },
    [addToast],
  )

  // Error-specific helpers
  const showErrorFromException = useCallback(
    (error: unknown, context?: string) => {
      const message = getErrorMessage(error)
      const code = getErrorCode(error)
      const title = context ? `${context} failed` : "Operation failed"

      return showError(title, `${message} (${code})`)
    },
    [showError],
  )

  const showAppError = useCallback(
    (error: AppError, context?: string) => {
      const title = context ? `${context} failed` : "Operation failed"

      return showError(title, `${error.message} (${error.code})`, {
        action: error.code.includes("NETWORK")
          ? {
              label: "Retry",
              onClick: () => {
                // This would trigger a retry mechanism
                console.log("Retry requested for error:", error.code)
              },
            }
          : undefined,
      })
    },
    [showError],
  )

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutsRef.current.clear()

    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showErrorFromException,
    showAppError,
  }
}

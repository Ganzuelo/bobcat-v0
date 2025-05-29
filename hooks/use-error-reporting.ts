"use client"

import { useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface ErrorContext {
  component: string
  action?: string
  userId?: string
  formId?: string
  fieldId?: string
  additionalData?: Record<string, any>
}

export function useErrorReporting() {
  const { toast } = useToast()

  const reportError = useCallback(
    (error: Error, context: ErrorContext) => {
      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.group(`🚨 Error in ${context.component}`)
        console.error("Error:", error)
        console.error("Context:", context)
        console.error("Stack:", error.stack)
        console.groupEnd()
      }

      // Show user-friendly toast
      toast({
        title: "Something went wrong",
        description: `Error in ${context.component}. Please try again.`,
        variant: "destructive",
      })

      // In production, send to error reporting service
      if (process.env.NODE_ENV === "production") {
        // Example: Send to Sentry, LogRocket, etc.
        try {
          // Sentry.captureException(error, {
          //   tags: {
          //     component: context.component,
          //     action: context.action,
          //   },
          //   user: {
          //     id: context.userId,
          //   },
          //   extra: {
          //     formId: context.formId,
          //     fieldId: context.fieldId,
          //     ...context.additionalData,
          //   },
          // })

          // Or send to your own logging endpoint
          fetch("/api/errors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: error.message,
              stack: error.stack,
              context,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              url: window.location.href,
            }),
          }).catch(() => {
            // Silently fail if error reporting fails
          })
        } catch (reportingError) {
          console.error("Failed to report error:", reportingError)
        }
      }
    },
    [toast],
  )

  const reportWarning = useCallback((message: string, context: ErrorContext) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️ Warning in ${context.component}: ${message}`, context)
    }
  }, [])

  return {
    reportError,
    reportWarning,
  }
}

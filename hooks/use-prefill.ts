"use client"

import { useState, useEffect, useCallback } from "react"
import type { FormField } from "@/lib/form-types"
import { prefillService, type PrefillResult } from "@/lib/prefill-service"

interface UsePrefillOptions {
  context?: Record<string, any>
  autoTrigger?: boolean
  onPrefillComplete?: (fieldId: string, result: PrefillResult) => void
  onPrefillError?: (fieldId: string, error: string) => void
}

interface PrefillState {
  [fieldId: string]: {
    isPrefilling: boolean
    isPrefilled: boolean
    result?: PrefillResult
    error?: string
  }
}

export function usePrefill(fields: FormField[], options: UsePrefillOptions = {}) {
  const { context, autoTrigger = true, onPrefillComplete, onPrefillError } = options

  const [prefillState, setPrefillState] = useState<PrefillState>({})
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [userEditedFields, setUserEditedFields] = useState<Set<string>>(new Set())

  // Initialize prefill state for all fields
  useEffect(() => {
    const initialState: PrefillState = {}
    fields.forEach((field) => {
      if (field.prefill_config?.enabled) {
        initialState[field.id] = {
          isPrefilling: false,
          isPrefilled: false,
        }
      }
    })
    setPrefillState(initialState)
  }, [fields])

  // Prefill a single field
  const prefillField = useCallback(
    async (fieldId: string, contextKey?: string, force = false) => {
      const field = fields.find((f) => f.id === fieldId)
      if (!field || !field.prefill_config?.enabled) {
        return
      }

      // Don't override user-edited fields unless forced
      if (userEditedFields.has(fieldId) && !force) {
        return
      }

      // Set loading state
      setPrefillState((prev) => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          isPrefilling: true,
          error: undefined,
        },
      }))

      try {
        const result = await prefillService.prefillField(field, contextKey)

        if (result.success) {
          // Update form value
          setFormValues((prev) => ({
            ...prev,
            [fieldId]: result.value,
          }))

          // Update prefill state
          setPrefillState((prev) => ({
            ...prev,
            [fieldId]: {
              isPrefilling: false,
              isPrefilled: true,
              result,
            },
          }))

          onPrefillComplete?.(fieldId, result)
        } else {
          // Handle prefill error
          setPrefillState((prev) => ({
            ...prev,
            [fieldId]: {
              isPrefilling: false,
              isPrefilled: false,
              error: result.error,
            },
          }))

          onPrefillError?.(fieldId, result.error || "Prefill failed")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        setPrefillState((prev) => ({
          ...prev,
          [fieldId]: {
            isPrefilling: false,
            isPrefilled: false,
            error: errorMessage,
          },
        }))

        onPrefillError?.(fieldId, errorMessage)
      }
    },
    [fields, userEditedFields, onPrefillComplete, onPrefillError],
  )

  // Prefill all eligible fields
  const prefillAllFields = useCallback(
    async (contextKey?: string) => {
      const eligibleFields = fields.filter((field) => field.prefill_config?.enabled && !userEditedFields.has(field.id))

      const prefillPromises = eligibleFields.map((field) => prefillField(field.id, contextKey))

      await Promise.all(prefillPromises)
    },
    [fields, userEditedFields, prefillField],
  )

  // Update form value (called by form inputs)
  const updateFormValue = useCallback((fieldId: string, value: any, markAsEdited = true) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))

    if (markAsEdited) {
      setUserEditedFields((prev) => new Set(prev).add(fieldId))
    }
  }, [])

  // Mark field as user-edited
  const markFieldAsEdited = useCallback((fieldId: string) => {
    setUserEditedFields((prev) => new Set(prev).add(fieldId))
  }, [])

  // Check if field is prefilled
  const isFieldPrefilled = useCallback(
    (fieldId: string) => {
      return prefillState[fieldId]?.isPrefilled || false
    },
    [prefillState],
  )

  // Check if field is currently prefilling
  const isFieldPrefilling = useCallback(
    (fieldId: string) => {
      return prefillState[fieldId]?.isPrefilling || false
    },
    [prefillState],
  )

  // Get prefill result for field
  const getPrefillResult = useCallback(
    (fieldId: string) => {
      return prefillState[fieldId]?.result
    },
    [prefillState],
  )

  // Clear prefill cache
  const clearPrefillCache = useCallback((pattern?: string) => {
    prefillService.clearCache(pattern)
  }, [])

  // Auto-trigger prefill on mount
  useEffect(() => {
    if (autoTrigger) {
      const contextKey = context?.form?.subject_id || context?.user?.id
      prefillAllFields(contextKey)
    }
  }, [autoTrigger, context, prefillAllFields])

  return {
    prefillState,
    formValues,
    prefillField,
    prefillAllFields,
    updateFormValue,
    markFieldAsEdited,
    isFieldPrefilled,
    isFieldPrefilling,
    getPrefillResult,
    clearPrefillCache,
    userEditedFields,
  }
}

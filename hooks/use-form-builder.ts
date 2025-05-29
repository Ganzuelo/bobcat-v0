"use client"

import { useState, useCallback, useEffect } from "react"
import type { FormData, FormField, FormPage, FormSection } from "@/lib/types"
import { useErrorHandler } from "./use-error-handler"
import { safeArray, safeObject, safeNumber, safeString, safeId, devWarn } from "@/lib/null-safety"
import {
  createFormError,
  createFieldError,
  validateRequired,
  validateArray,
  validateObject,
} from "@/lib/error-handling"

interface UseFormBuilderOptions {
  autoSave?: boolean
  autoSaveDelay?: number
  maxRetries?: number
  onSave?: (formData: FormData) => Promise<void>
  onLoad?: () => Promise<FormData>
  onError?: (error: unknown) => void
}

export function useFormBuilder(initialFormData?: FormData | null, options: UseFormBuilderOptions = {}) {
  const { autoSave = false, autoSaveDelay = 2000, maxRetries = 3, onSave, onLoad, onError } = options

  // Error handling
  const {
    hasError,
    error,
    isRetrying,
    retryCount,
    handleError,
    clearError,
    safeAsync,
    safeAsyncWithRetry,
    safeSync,
    canRetry,
  } = useErrorHandler({
    maxRetries,
    onError,
  })

  // Form state
  const [formData, setFormData] = useState<FormData>(() => {
    return (
      safeSync(() => {
        validateFormData(initialFormData)
        return initializeFormData(initialFormData)
      }, "form-initialization") || getDefaultFormData()
    )
  })

  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Validation functions
  function validateFormData(data: unknown): void {
    if (!data) return // Allow null/undefined for initial state

    validateObject(data, "formData")
    const formObj = data as Record<string, unknown>

    validateRequired(formObj.id, "formData.id")
    validateRequired(formObj.title, "formData.title")
    validateArray(formObj.pages, "formData.pages")

    const pages = formObj.pages as unknown[]
    if (pages.length === 0) {
      throw createFormError("Form must have at least one page")
    }

    pages.forEach((page, index) => {
      validateObject(page, `formData.pages[${index}]`)
      const pageObj = page as Record<string, unknown>
      validateRequired(pageObj.id, `formData.pages[${index}].id`)
      validateRequired(pageObj.title, `formData.pages[${index}].title`)
      validateArray(pageObj.sections, `formData.pages[${index}].sections`)
    })
  }

  function validatePageIndex(pageIndex: number): void {
    if (pageIndex < 0 || pageIndex >= formData.pages.length) {
      throw createFormError(`Invalid page index: ${pageIndex}. Must be between 0 and ${formData.pages.length - 1}`, {
        pageIndex,
        totalPages: formData.pages.length,
      })
    }
  }

  function validateSectionIndex(pageIndex: number, sectionIndex: number): void {
    validatePageIndex(pageIndex)
    const page = formData.pages[pageIndex]
    if (sectionIndex < 0 || sectionIndex >= page.sections.length) {
      throw createFormError(
        `Invalid section index: ${sectionIndex}. Must be between 0 and ${page.sections.length - 1}`,
        { pageIndex, sectionIndex, totalSections: page.sections.length },
      )
    }
  }

  function validateField(field: unknown): void {
    validateObject(field, "field")
    const fieldObj = field as Record<string, unknown>
    validateRequired(fieldObj.id, "field.id")
    validateRequired(fieldObj.field_type, "field.field_type")
    validateRequired(fieldObj.label, "field.label")
  }

  // Initialization functions
  function getDefaultFormData(): FormData {
    return {
      id: `form_${Date.now()}`,
      title: "Untitled Form",
      description: "",
      pages: [
        {
          id: `page_${Date.now()}`,
          title: "Page 1",
          description: "",
          sections: [],
        },
      ],
    }
  }

  function initializeFormData(data?: FormData | null): FormData {
    if (!data) return getDefaultFormData()

    const safeData = safeObject(data) as FormData
    const initialPages = safeArray<FormPage>(safeData.pages, [])

    return {
      id: safeString(safeData.id, `form_${Date.now()}`),
      title: safeString(safeData.title, "Untitled Form"),
      description: safeString(safeData.description, ""),
      pages:
        initialPages.length > 0
          ? initialPages
          : [
              {
                id: `page_${Date.now()}`,
                title: "Page 1",
                description: "",
                sections: [],
              },
            ],
    }
  }

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSave || !hasUnsavedChanges) return

    const timeoutId = setTimeout(() => {
      saveForm()
    }, autoSaveDelay)

    return () => clearTimeout(timeoutId)
  }, [formData, autoSave, autoSaveDelay, hasUnsavedChanges])

  // Mark form as changed
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  // Load form data
  const loadForm = useCallback(async (): Promise<boolean> => {
    if (!onLoad) {
      handleError(createFormError("No load function provided"))
      return false
    }

    setIsLoading(true)

    const result = await safeAsyncWithRetry(
      async () => {
        const data = await onLoad()
        validateFormData(data)
        return data
      },
      { maxRetries: 2 },
      "load-form",
    )

    setIsLoading(false)

    if (result) {
      setFormData(result)
      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      return true
    }

    return false
  }, [onLoad, safeAsyncWithRetry, handleError])

  // Save form data
  const saveForm = useCallback(async (): Promise<boolean> => {
    if (!onSave) {
      handleError(createFormError("No save function provided"))
      return false
    }

    const isValid = safeSync(() => {
      validateFormData(formData)
      return true
    }, "validate-before-save")

    if (!isValid) return false

    setIsSaving(true)

    const result = await safeAsyncWithRetry(
      async () => {
        await onSave(formData)
      },
      { maxRetries: 2 },
      "save-form",
    )

    setIsSaving(false)

    if (result !== null) {
      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      return true
    }

    return false
  }, [formData, onSave, safeAsyncWithRetry, safeSync, handleError])

  // Page operations
  const handlePageChange = useCallback(
    (pageIndex: number) => {
      const result = safeSync(() => {
        const safePageIndex = safeNumber(pageIndex, 0)
        validatePageIndex(safePageIndex)

        const maxIndex = Math.max(0, formData.pages.length - 1)
        const clampedIndex = Math.min(Math.max(0, safePageIndex), maxIndex)

        setCurrentPageIndex(clampedIndex)
        return true
      }, "page-change")

      return !!result
    },
    [formData.pages.length, safeSync],
  )

  const handleReorderPages = useCallback(
    (fromIndex: number, toIndex: number) => {
      const result = safeSync(() => {
        const safeFromIndex = safeNumber(fromIndex, 0)
        const safeToIndex = safeNumber(toIndex, 0)

        validatePageIndex(safeFromIndex)
        validatePageIndex(safeToIndex)

        if (safeFromIndex === safeToIndex) return false

        setFormData((prevData) => {
          const newPages = [...safeArray(prevData.pages, [])]
          const [movedPage] = newPages.splice(safeFromIndex, 1)

          if (!movedPage) {
            throw createFormError("Failed to extract page for reordering")
          }

          newPages.splice(safeToIndex, 0, movedPage)

          return {
            ...prevData,
            pages: newPages,
          }
        })

        // Update current page index if necessary
        if (currentPageIndex === safeFromIndex) {
          setCurrentPageIndex(safeToIndex)
        } else if (currentPageIndex > safeFromIndex && currentPageIndex <= safeToIndex) {
          setCurrentPageIndex(currentPageIndex - 1)
        } else if (currentPageIndex < safeFromIndex && currentPageIndex >= safeToIndex) {
          setCurrentPageIndex(currentPageIndex + 1)
        }

        markAsChanged()
        return true
      }, "reorder-pages")

      return !!result
    },
    [formData.pages.length, currentPageIndex, safeSync, markAsChanged],
  )

  // Section operations
  const handleSectionAdd = useCallback(
    (pageIndex: number) => {
      const result = safeSync(() => {
        const safePageIndex = safeNumber(pageIndex, 0)
        validatePageIndex(safePageIndex)

        setFormData((prevData) => {
          const newPages = [...safeArray(prevData.pages, [])]
          const targetPage = safeObject(newPages[safePageIndex]) as FormPage

          if (!targetPage) {
            throw createFormError(`Page at index ${safePageIndex} is null`)
          }

          const newSection: FormSection = {
            id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `Section ${safeArray(targetPage.sections, []).length + 1}`,
            description: "",
            fields: [],
          }

          newPages[safePageIndex] = {
            ...targetPage,
            sections: [...safeArray(targetPage.sections, []), newSection],
          }

          return {
            ...prevData,
            pages: newPages,
          }
        })

        markAsChanged()
        return true
      }, "add-section")

      return !!result
    },
    [safeSync, markAsChanged],
  )

  const handleSectionDelete = useCallback(
    (pageIndex: number, sectionIndex: number) => {
      const result = safeSync(() => {
        const safePageIndex = safeNumber(pageIndex, 0)
        const safeSectionIndex = safeNumber(sectionIndex, 0)

        validateSectionIndex(safePageIndex, safeSectionIndex)

        setFormData((prevData) => {
          const newPages = [...safeArray(prevData.pages, [])]
          const targetPage = safeObject(newPages[safePageIndex]) as FormPage

          if (!targetPage) {
            throw createFormError(`Page at index ${safePageIndex} is null`)
          }

          const sections = safeArray(targetPage.sections, [])
          const newSections = sections.filter((_, index) => index !== safeSectionIndex)

          newPages[safePageIndex] = {
            ...targetPage,
            sections: newSections,
          }

          return {
            ...prevData,
            pages: newPages,
          }
        })

        markAsChanged()
        return true
      }, "delete-section")

      return !!result
    },
    [safeSync, markAsChanged],
  )

  // Field operations
  const handleFieldAdd = useCallback(
    (pageIndex: number, sectionIndex: number) => {
      const result = safeSync(() => {
        const safePageIndex = safeNumber(pageIndex, 0)
        const safeSectionIndex = safeNumber(sectionIndex, 0)

        validateSectionIndex(safePageIndex, safeSectionIndex)

        setFormData((prevData) => {
          const newPages = [...safeArray(prevData.pages, [])]
          const targetPage = safeObject(newPages[safePageIndex]) as FormPage

          if (!targetPage) {
            throw createFormError(`Page at index ${safePageIndex} is null`)
          }

          const sections = safeArray(targetPage.sections, [])
          const targetSection = safeObject(sections[safeSectionIndex]) as FormSection

          if (!targetSection) {
            throw createFormError(`Section at index ${safeSectionIndex} is null`)
          }

          const newField: FormField = {
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            field_type: "text",
            label: `Field ${safeArray(targetSection.fields, []).length + 1}`,
            placeholder: "",
            help_text: "",
            required: false,
            readonly: false,
            default_value: "",
            uad_field_id: "",
          }

          const newSections = [...sections]
          newSections[safeSectionIndex] = {
            ...targetSection,
            fields: [...safeArray(targetSection.fields, []), newField],
          }

          newPages[safePageIndex] = {
            ...targetPage,
            sections: newSections,
          }

          return {
            ...prevData,
            pages: newPages,
          }
        })

        markAsChanged()
        return true
      }, "add-field")

      return !!result
    },
    [safeSync, markAsChanged],
  )

  const handleFieldEdit = useCallback(
    (field: FormField) => {
      const result = safeSync(() => {
        validateField(field)
        const safeField = safeObject(field) as FormField
        const fieldId = safeId(safeField.id, "unknown")

        devWarn(!!safeField.id, "useFormBuilder.handleFieldEdit: Field missing ID")

        // TODO: Implement field editing modal/panel
        console.log("Edit field:", fieldId, safeField)
        return true
      }, "edit-field")

      return !!result
    },
    [safeSync],
  )

  const handleFieldDelete = useCallback(
    (fieldId: string) => {
      const result = safeSync(() => {
        const safeFieldId = safeString(fieldId, "")

        if (!safeFieldId) {
          throw createFieldError("Invalid field ID provided for deletion")
        }

        setFormData((prevData) => {
          const newPages = safeArray(prevData.pages, []).map((page) => {
            const pageObj = safeObject(page) as FormPage
            const sections = safeArray(pageObj.sections, []).map((section) => {
              const sectionObj = safeObject(section) as FormSection
              const fields = safeArray(sectionObj.fields, []).filter((field) => {
                const fieldObj = safeObject(field) as FormField
                return safeString(fieldObj.id, "") !== safeFieldId
              })

              return {
                ...sectionObj,
                fields,
              }
            })

            return {
              ...pageObj,
              sections,
            }
          })

          return {
            ...prevData,
            pages: newPages,
          }
        })

        markAsChanged()
        return true
      }, "delete-field")

      return !!result
    },
    [safeSync, markAsChanged],
  )

  // Retry failed operations
  const retryLastOperation = useCallback(() => {
    if (!canRetry) return false

    // This would need to be implemented based on what operation failed
    // For now, we'll just clear the error
    clearError()
    return true
  }, [canRetry, clearError])

  return {
    // Form data
    formData,
    currentPageIndex,
    setFormData,

    // Loading states
    isLoading,
    isSaving,
    hasUnsavedChanges,
    lastSaved,

    // Error states
    hasError,
    error,
    isRetrying,
    retryCount,
    canRetry,

    // Operations
    loadForm,
    saveForm,
    handlePageChange,
    handleReorderPages,
    handleSectionAdd,
    handleSectionDelete,
    handleFieldAdd,
    handleFieldEdit,
    handleFieldDelete,

    // Error handling
    clearError,
    retryLastOperation,
  }
}

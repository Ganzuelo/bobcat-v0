"use client"

import { useState, useCallback } from "react"
import type { FormData, FormField, FormPage, FormSection } from "@/lib/types"
import { validateRequired, validateArray, ERROR_CODES } from "@/lib/error-handling"
import { safeString, safeArray, safeObject } from "@/lib/null-safety"

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

interface UseValidationOptions {
  validateOnChange?: boolean
  debounceMs?: number
}

export function useValidation(options: UseValidationOptions = {}) {
  const { validateOnChange = false, debounceMs = 300 } = options

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isValidating, setIsValidating] = useState(false)

  // Clear validation errors
  const clearValidationErrors = useCallback(() => {
    setValidationErrors([])
  }, [])

  // Add validation error
  const addValidationError = useCallback((field: string, message: string, code: string) => {
    setValidationErrors((prev) => [...prev.filter((error) => error.field !== field), { field, message, code }])
  }, [])

  // Remove validation error for specific field
  const removeValidationError = useCallback((field: string) => {
    setValidationErrors((prev) => prev.filter((error) => error.field !== field))
  }, [])

  // Validate field type
  const validateFieldType = useCallback((fieldType: string): ValidationResult => {
    const validTypes = [
      "text",
      "email",
      "tel",
      "url",
      "number",
      "password",
      "textarea",
      "checkbox",
      "radio",
      "select",
      "file",
      "date",
      "time",
      "datetime-local",
    ]

    if (!validTypes.includes(fieldType)) {
      return {
        isValid: false,
        errors: [
          {
            field: "field_type",
            message: `Invalid field type: ${fieldType}`,
            code: ERROR_CODES.FIELD_VALIDATION_FAILED,
          },
        ],
      }
    }

    return { isValid: true, errors: [] }
  }, [])

  // Validate field options
  const validateFieldOptions = useCallback((field: FormField): ValidationResult => {
    const errors: ValidationError[] = []
    const fieldType = safeString(field.field_type, "")
    const options = safeArray(field.options, [])

    if (["radio", "select"].includes(fieldType)) {
      if (options.length === 0) {
        errors.push({
          field: "options",
          message: `${fieldType} field must have at least one option`,
          code: ERROR_CODES.FIELD_VALIDATION_FAILED,
        })
      } else {
        options.forEach((option, index) => {
          const optionObj = safeObject(option)
          const value = safeString(optionObj.value, "")
          const label = safeString(optionObj.label, "")

          if (!value) {
            errors.push({
              field: `options[${index}].value`,
              message: `Option ${index + 1} must have a value`,
              code: ERROR_CODES.FIELD_VALIDATION_FAILED,
            })
          }

          if (!label) {
            errors.push({
              field: `options[${index}].label`,
              message: `Option ${index + 1} must have a label`,
              code: ERROR_CODES.FIELD_VALIDATION_FAILED,
            })
          }
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [])

  // Validate single field
  const validateField = useCallback(
    (field: FormField): ValidationResult => {
      const errors: ValidationError[] = []

      try {
        // Validate required properties
        validateRequired(field.id, "field.id")
        validateRequired(field.field_type, "field.field_type")
        validateRequired(field.label, "field.label")

        // Validate field type
        const typeValidation = validateFieldType(field.field_type)
        if (!typeValidation.isValid) {
          errors.push(...typeValidation.errors)
        }

        // Validate field options
        const optionsValidation = validateFieldOptions(field)
        if (!optionsValidation.isValid) {
          errors.push(...optionsValidation.errors)
        }

        // Validate UAD field ID format if provided
        const uadFieldId = safeString(field.uad_field_id, "")
        if (uadFieldId && !/^[A-Z0-9_]+$/.test(uadFieldId)) {
          errors.push({
            field: "uad_field_id",
            message: "UAD Field ID must contain only uppercase letters, numbers, and underscores",
            code: ERROR_CODES.FIELD_VALIDATION_FAILED,
          })
        }
      } catch (error) {
        if (error instanceof Error) {
          errors.push({
            field: "general",
            message: error.message,
            code: ERROR_CODES.FIELD_VALIDATION_FAILED,
          })
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      }
    },
    [validateFieldType, validateFieldOptions],
  )

  // Validate section
  const validateSection = useCallback(
    (section: FormSection, sectionIndex: number): ValidationResult => {
      const errors: ValidationError[] = []

      try {
        validateRequired(section.id, `section[${sectionIndex}].id`)
        validateRequired(section.title, `section[${sectionIndex}].title`)
        validateArray(section.fields, `section[${sectionIndex}].fields`)

        // Validate each field in the section
        const fields = safeArray(section.fields, [])
        fields.forEach((field, fieldIndex) => {
          const fieldValidation = validateField(field as FormField)
          if (!fieldValidation.isValid) {
            fieldValidation.errors.forEach((error) => {
              errors.push({
                ...error,
                field: `section[${sectionIndex}].fields[${fieldIndex}].${error.field}`,
              })
            })
          }
        })
      } catch (error) {
        if (error instanceof Error) {
          errors.push({
            field: `section[${sectionIndex}]`,
            message: error.message,
            code: ERROR_CODES.VALIDATION_ERROR,
          })
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      }
    },
    [validateField],
  )

  // Validate page
  const validatePage = useCallback(
    (page: FormPage, pageIndex: number): ValidationResult => {
      const errors: ValidationError[] = []

      try {
        validateRequired(page.id, `page[${pageIndex}].id`)
        validateRequired(page.title, `page[${pageIndex}].title`)
        validateArray(page.sections, `page[${pageIndex}].sections`)

        // Validate each section in the page
        const sections = safeArray(page.sections, [])
        sections.forEach((section, sectionIndex) => {
          const sectionValidation = validateSection(section as FormSection, sectionIndex)
          if (!sectionValidation.isValid) {
            sectionValidation.errors.forEach((error) => {
              errors.push({
                ...error,
                field: `page[${pageIndex}].${error.field}`,
              })
            })
          }
        })
      } catch (error) {
        if (error instanceof Error) {
          errors.push({
            field: `page[${pageIndex}]`,
            message: error.message,
            code: ERROR_CODES.VALIDATION_ERROR,
          })
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      }
    },
    [validateSection],
  )

  // Validate entire form
  const validateForm = useCallback(
    (formData: FormData): ValidationResult => {
      setIsValidating(true)
      const errors: ValidationError[] = []

      try {
        validateRequired(formData.id, "form.id")
        validateRequired(formData.title, "form.title")
        validateArray(formData.pages, "form.pages")

        const pages = safeArray(formData.pages, [])

        if (pages.length === 0) {
          errors.push({
            field: "pages",
            message: "Form must have at least one page",
            code: ERROR_CODES.FORM_VALIDATION_FAILED,
          })
        }

        // Validate each page
        pages.forEach((page, pageIndex) => {
          const pageValidation = validatePage(page as FormPage, pageIndex)
          if (!pageValidation.isValid) {
            errors.push(...pageValidation.errors)
          }
        })

        // Check for duplicate IDs
        const allIds = new Set<string>()
        const duplicateIds = new Set<string>()

        const checkId = (id: string, context: string) => {
          if (allIds.has(id)) {
            duplicateIds.add(id)
            errors.push({
              field: context,
              message: `Duplicate ID found: ${id}`,
              code: ERROR_CODES.FORM_VALIDATION_FAILED,
            })
          } else {
            allIds.add(id)
          }
        }

        // Check form ID
        checkId(formData.id, "form.id")

        // Check page, section, and field IDs
        pages.forEach((page, pageIndex) => {
          const pageObj = page as FormPage
          checkId(pageObj.id, `page[${pageIndex}].id`)

          const sections = safeArray(pageObj.sections, [])
          sections.forEach((section, sectionIndex) => {
            const sectionObj = section as FormSection
            checkId(sectionObj.id, `page[${pageIndex}].section[${sectionIndex}].id`)

            const fields = safeArray(sectionObj.fields, [])
            fields.forEach((field, fieldIndex) => {
              const fieldObj = field as FormField
              checkId(fieldObj.id, `page[${pageIndex}].section[${sectionIndex}].field[${fieldIndex}].id`)
            })
          })
        })
      } catch (error) {
        if (error instanceof Error) {
          errors.push({
            field: "form",
            message: error.message,
            code: ERROR_CODES.FORM_VALIDATION_FAILED,
          })
        }
      }

      setValidationErrors(errors)
      setIsValidating(false)

      return {
        isValid: errors.length === 0,
        errors,
      }
    },
    [validatePage],
  )

  // Get errors for specific field
  const getFieldErrors = useCallback(
    (fieldPath: string): ValidationError[] => {
      return validationErrors.filter((error) => error.field.includes(fieldPath))
    },
    [validationErrors],
  )

  // Check if specific field has errors
  const hasFieldError = useCallback(
    (fieldPath: string): boolean => {
      return getFieldErrors(fieldPath).length > 0
    },
    [getFieldErrors],
  )

  return {
    // Validation state
    validationErrors,
    isValidating,
    isValid: validationErrors.length === 0,

    // Validation functions
    validateForm,
    validatePage,
    validateSection,
    validateField,
    validateFieldType,
    validateFieldOptions,

    // Error management
    clearValidationErrors,
    addValidationError,
    removeValidationError,
    getFieldErrors,
    hasFieldError,
  }
}

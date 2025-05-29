"use client"

import type { FormData, FormField, FormPage, FormSection } from "@/lib/types"
import {
  warnDataIntegrity,
  warnValidation,
  warnPerformance,
  warnAccessibility,
  warnBestPractices,
  warnSecurity,
  WarningLevel,
  checkDataStructure,
} from "./dev-warnings"
import { safeArray, safeString, safeObject } from "./null-safety"

/**
 * Form Builder specific development warnings
 */

// Form data warnings
export function validateFormDataStructure(formData: unknown, component?: string) {
  if (process.env.NODE_ENV !== "development") return

  checkDataStructure(formData, "FormData object", component)

  if (!formData || typeof formData !== "object") return

  const form = formData as Record<string, unknown>

  // Check required properties
  if (!form.id) {
    warnDataIntegrity("missing-form-id", "Form missing required 'id' property", {
      suggestion: "Ensure all forms have unique IDs",
      component,
    })
  }

  if (!form.title) {
    warnDataIntegrity("missing-form-title", "Form missing required 'title' property", {
      suggestion: "Provide a descriptive title for the form",
      component,
    })
  }

  if (!Array.isArray(form.pages)) {
    warnDataIntegrity("invalid-pages-structure", "Form 'pages' property should be an array", {
      details: { pagesType: typeof form.pages },
      suggestion: "Initialize pages as an empty array if no pages exist",
      component,
    })
  } else if (form.pages.length === 0) {
    warnValidation("empty-form-pages", "Form has no pages", {
      suggestion: "Forms should have at least one page",
      component,
      level: WarningLevel.WARN,
    })
  }
}

// Page warnings
export function validatePageStructure(page: unknown, pageIndex: number, component?: string) {
  if (process.env.NODE_ENV !== "development") return

  checkDataStructure(page, `FormPage object at index ${pageIndex}`, component)

  if (!page || typeof page !== "object") return

  const pageObj = page as Record<string, unknown>

  if (!pageObj.id) {
    warnDataIntegrity("missing-page-id", `Page at index ${pageIndex} missing required 'id' property`, {
      details: { pageIndex },
      suggestion: "Ensure all pages have unique IDs",
      component,
    })
  }

  if (!pageObj.title) {
    warnValidation("missing-page-title", `Page at index ${pageIndex} missing title`, {
      details: { pageIndex },
      suggestion: "Provide descriptive titles for all pages",
      component,
    })
  }

  if (!Array.isArray(pageObj.sections)) {
    warnDataIntegrity("invalid-sections-structure", `Page ${pageIndex} 'sections' should be an array`, {
      details: { pageIndex, sectionsType: typeof pageObj.sections },
      component,
    })
  }
}

// Section warnings
export function validateSectionStructure(
  section: unknown,
  sectionIndex: number,
  pageIndex: number,
  component?: string,
) {
  if (process.env.NODE_ENV !== "development") return

  checkDataStructure(section, `FormSection object at page ${pageIndex}, section ${sectionIndex}`, component)

  if (!section || typeof section !== "object") return

  const sectionObj = section as Record<string, unknown>

  if (!sectionObj.id) {
    warnDataIntegrity(
      "missing-section-id",
      `Section at page ${pageIndex}, section ${sectionIndex} missing 'id' property`,
      {
        details: { pageIndex, sectionIndex },
        suggestion: "Ensure all sections have unique IDs",
        component,
      },
    )
  }

  if (!sectionObj.title) {
    warnValidation("missing-section-title", `Section at page ${pageIndex}, section ${sectionIndex} missing title`, {
      details: { pageIndex, sectionIndex },
      suggestion: "Provide descriptive titles for all sections",
      component,
    })
  }

  if (!Array.isArray(sectionObj.fields)) {
    warnDataIntegrity(
      "invalid-fields-structure",
      `Section at page ${pageIndex}, section ${sectionIndex} 'fields' should be an array`,
      {
        details: { pageIndex, sectionIndex, fieldsType: typeof sectionObj.fields },
        component,
      },
    )
  }
}

// Field warnings
export function validateFieldStructure(
  field: unknown,
  fieldIndex: number,
  sectionIndex: number,
  pageIndex: number,
  component?: string,
) {
  if (process.env.NODE_ENV !== "development") return

  checkDataStructure(
    field,
    `FormField object at page ${pageIndex}, section ${sectionIndex}, field ${fieldIndex}`,
    component,
  )

  if (!field || typeof field !== "object") return

  const fieldObj = field as Record<string, unknown>
  const fieldPath = `page ${pageIndex}, section ${sectionIndex}, field ${fieldIndex}`

  // Required properties
  if (!fieldObj.id) {
    warnDataIntegrity("missing-field-id", `Field at ${fieldPath} missing 'id' property`, {
      details: { pageIndex, sectionIndex, fieldIndex },
      suggestion: "Ensure all fields have unique IDs",
      component,
    })
  }

  if (!fieldObj.field_type) {
    warnDataIntegrity("missing-field-type", `Field at ${fieldPath} missing 'field_type' property`, {
      details: { pageIndex, sectionIndex, fieldIndex },
      suggestion: "Specify a valid field type (text, email, select, etc.)",
      component,
    })
  }

  if (!fieldObj.label) {
    warnValidation("missing-field-label", `Field at ${fieldPath} missing label`, {
      details: { pageIndex, sectionIndex, fieldIndex },
      suggestion: "Provide descriptive labels for all fields",
      component,
    })
  }

  // Field type validation
  const validFieldTypes = [
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

  const fieldType = safeString(fieldObj.field_type, "")
  if (fieldType && !validFieldTypes.includes(fieldType)) {
    warnValidation("invalid-field-type", `Invalid field type '${fieldType}' at ${fieldPath}`, {
      details: { fieldType, validTypes: validFieldTypes, pageIndex, sectionIndex, fieldIndex },
      suggestion: `Use one of the valid field types: ${validFieldTypes.join(", ")}`,
      component,
    })
  }

  // Options validation for select/radio fields
  if (["select", "radio"].includes(fieldType)) {
    if (!Array.isArray(fieldObj.options) || fieldObj.options.length === 0) {
      warnValidation("missing-field-options", `${fieldType} field at ${fieldPath} missing options`, {
        details: { fieldType, pageIndex, sectionIndex, fieldIndex },
        suggestion: `${fieldType} fields require at least one option`,
        component,
      })
    }
  }

  // UAD field ID validation
  const uadFieldId = safeString(fieldObj.uad_field_id, "")
  if (uadFieldId && !/^[A-Z0-9_]+$/.test(uadFieldId)) {
    warnValidation("invalid-uad-field-id", `Invalid UAD field ID format '${uadFieldId}' at ${fieldPath}`, {
      details: { uadFieldId, pageIndex, sectionIndex, fieldIndex },
      suggestion: "UAD field IDs should contain only uppercase letters, numbers, and underscores",
      component,
    })
  }
}

// Performance warnings
export function warnLargeFormData(formData: FormData, component?: string) {
  if (process.env.NODE_ENV !== "development") return

  const pages = safeArray(formData.pages, [])
  const totalSections = pages.reduce((total, page) => total + safeArray(page.sections, []).length, 0)
  const totalFields = pages.reduce((total, page) => {
    return (
      total +
      safeArray(page.sections, []).reduce((sectionTotal, section) => {
        return sectionTotal + safeArray(section.fields, []).length
      }, 0)
    )
  }, 0)

  if (pages.length > 10) {
    warnPerformance("large-page-count", `Form has ${pages.length} pages, which may impact performance`, {
      details: { pageCount: pages.length },
      suggestion: "Consider breaking large forms into multiple smaller forms or implementing pagination",
      component,
    })
  }

  if (totalSections > 50) {
    warnPerformance("large-section-count", `Form has ${totalSections} sections, which may impact performance`, {
      details: { sectionCount: totalSections },
      suggestion: "Consider reducing the number of sections or implementing lazy loading",
      component,
    })
  }

  if (totalFields > 100) {
    warnPerformance("large-field-count", `Form has ${totalFields} fields, which may impact performance`, {
      details: { fieldCount: totalFields },
      suggestion: "Consider breaking the form into multiple pages or implementing virtual scrolling",
      component,
    })
  }
}

// Accessibility warnings
export function warnAccessibilityIssues(formData: FormData, component?: string) {
  if (process.env.NODE_ENV !== "development") return

  const pages = safeArray(formData.pages, [])

  pages.forEach((page, pageIndex) => {
    const pageObj = safeObject(page) as FormPage
    const sections = safeArray(pageObj.sections, [])

    sections.forEach((section, sectionIndex) => {
      const sectionObj = safeObject(section) as FormSection
      const fields = safeArray(sectionObj.fields, [])

      fields.forEach((field, fieldIndex) => {
        const fieldObj = safeObject(field) as FormField
        const fieldPath = `page ${pageIndex}, section ${sectionIndex}, field ${fieldIndex}`

        // Check for missing labels
        if (!safeString(fieldObj.label, "")) {
          warnAccessibility("missing-field-label", `Field at ${fieldPath} missing label (accessibility issue)`, {
            details: { pageIndex, sectionIndex, fieldIndex },
            suggestion: "All form fields should have descriptive labels for screen readers",
            documentation: "https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html",
            component,
          })
        }

        // Check for missing help text on complex fields
        if (["select", "radio", "checkbox"].includes(fieldObj.field_type) && !safeString(fieldObj.help_text, "")) {
          warnAccessibility("missing-help-text", `Complex field at ${fieldPath} missing help text`, {
            details: { fieldType: fieldObj.field_type, pageIndex, sectionIndex, fieldIndex },
            suggestion: "Consider adding help text to explain complex form fields",
            component,
            level: WarningLevel.INFO,
          })
        }

        // Check for required field indicators
        if (fieldObj.required && !safeString(fieldObj.label, "").includes("*")) {
          warnAccessibility("missing-required-indicator", `Required field at ${fieldPath} missing visual indicator`, {
            details: { pageIndex, sectionIndex, fieldIndex },
            suggestion: "Add visual indicators (like *) for required fields",
            component,
            level: WarningLevel.INFO,
          })
        }
      })
    })
  })
}

// Security warnings
export function warnSecurityIssues(formData: FormData, component?: string) {
  if (process.env.NODE_ENV !== "development") return

  const pages = safeArray(formData.pages, [])

  pages.forEach((page, pageIndex) => {
    const pageObj = safeObject(page) as FormPage
    const sections = safeArray(pageObj.sections, [])

    sections.forEach((section, sectionIndex) => {
      const sectionObj = safeObject(section) as FormSection
      const fields = safeArray(sectionObj.fields, [])

      fields.forEach((field, fieldIndex) => {
        const fieldObj = safeObject(field) as FormField
        const fieldPath = `page ${pageIndex}, section ${sectionIndex}, field ${fieldIndex}`

        // Check for password fields without proper configuration
        if (fieldObj.field_type === "password") {
          warnSecurity("password-field-security", `Password field at ${fieldPath} detected`, {
            details: { pageIndex, sectionIndex, fieldIndex },
            suggestion: "Ensure password fields are properly secured and not logged",
            component,
            level: WarningLevel.INFO,
          })
        }

        // Check for file upload fields
        if (fieldObj.field_type === "file") {
          warnSecurity("file-upload-security", `File upload field at ${fieldPath} detected`, {
            details: { pageIndex, sectionIndex, fieldIndex },
            suggestion: "Implement proper file validation and security measures for file uploads",
            component,
            level: WarningLevel.WARN,
          })
        }

        // Check for potentially sensitive field names
        const sensitivePatterns = /password|ssn|social|credit|card|bank|account/i
        const label = safeString(fieldObj.label, "")
        if (sensitivePatterns.test(label)) {
          warnSecurity("sensitive-field-detected", `Potentially sensitive field '${label}' at ${fieldPath}`, {
            details: { label, pageIndex, sectionIndex, fieldIndex },
            suggestion: "Ensure sensitive data is properly encrypted and handled securely",
            component,
          })
        }
      })
    })
  })
}

// Best practices warnings
export function warnBestPracticeViolations(formData: FormData, component?: string) {
  if (process.env.NODE_ENV !== "development") return

  const pages = safeArray(formData.pages, [])

  // Check for single-page forms with many fields
  if (pages.length === 1) {
    const totalFields = safeArray(pages[0]?.sections, []).reduce((total, section) => {
      return total + safeArray(section.fields, []).length
    }, 0)

    if (totalFields > 20) {
      warnBestPractices("single-page-too-many-fields", `Single page form has ${totalFields} fields`, {
        details: { fieldCount: totalFields },
        suggestion: "Consider breaking large forms into multiple pages for better user experience",
        component,
      })
    }
  }

  // Check for missing form description
  if (!safeString(formData.description, "")) {
    warnBestPractices("missing-form-description", "Form missing description", {
      suggestion: "Add a description to help users understand the form's purpose",
      component,
      level: WarningLevel.INFO,
    })
  }

  // Check for inconsistent field naming
  const allFieldLabels: string[] = []
  pages.forEach((page) => {
    const pageObj = safeObject(page) as FormPage
    const sections = safeArray(pageObj.sections, [])
    sections.forEach((section) => {
      const sectionObj = safeObject(section) as FormSection
      const fields = safeArray(sectionObj.fields, [])
      fields.forEach((field) => {
        const fieldObj = safeObject(field) as FormField
        const label = safeString(fieldObj.label, "")
        if (label) allFieldLabels.push(label)
      })
    })
  })

  const duplicateLabels = allFieldLabels.filter((label, index) => allFieldLabels.indexOf(label) !== index)
  if (duplicateLabels.length > 0) {
    warnBestPractices("duplicate-field-labels", "Form has duplicate field labels", {
      details: { duplicateLabels: [...new Set(duplicateLabels)] },
      suggestion: "Use unique, descriptive labels for all fields",
      component,
    })
  }
}

// Comprehensive form validation
export function validateCompleteForm(formData: FormData, component?: string) {
  if (process.env.NODE_ENV !== "development") return

  validateFormDataStructure(formData, component)
  warnLargeFormData(formData, component)
  warnAccessibilityIssues(formData, component)
  warnSecurityIssues(formData, component)
  warnBestPracticeViolations(formData, component)

  const pages = safeArray(formData.pages, [])
  pages.forEach((page, pageIndex) => {
    validatePageStructure(page, pageIndex, component)

    const pageObj = safeObject(page) as FormPage
    const sections = safeArray(pageObj.sections, [])
    sections.forEach((section, sectionIndex) => {
      validateSectionStructure(section, sectionIndex, pageIndex, component)

      const sectionObj = safeObject(section) as FormSection
      const fields = safeArray(sectionObj.fields, [])
      fields.forEach((field, fieldIndex) => {
        validateFieldStructure(field, fieldIndex, sectionIndex, pageIndex, component)
      })
    })
  })
}

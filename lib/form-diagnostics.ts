import { type FormField, type FormSection, type FormPage, FIELD_TYPE_CONFIG } from "./form-types"
import { validateFormSchema } from "./form-schema-validator"

export interface DiagnosticError {
  type: "SchemaError" | "RenderError" | "ConfigError" | "FatalError"
  fieldId?: string
  fieldLabel?: string
  sectionId?: string
  sectionTitle?: string
  pageId?: string
  pageTitle?: string
  message: string
  severity: "error" | "warning"
}

export interface DiagnosticReport {
  status: "passed" | "failed" | "crashed"
  errors: DiagnosticError[]
  warnings: DiagnosticError[]
  fieldCount: number
  sectionCount: number
  pageCount: number
  executionTime: number
}

export interface FormStructure {
  pages: FormPage[]
}

// Helper function to get all fields from form structure
function getAllFieldsFromForm(formStructure: FormStructure): FormField[] {
  const allFields: FormField[] = []

  formStructure.pages.forEach((page) => {
    if (page.sections) {
      page.sections.forEach((section) => {
        if (section.fields) {
          allFields.push(...section.fields)
        }
      })
    }
  })

  return allFields
}

// Helper function to get all sections from form structure
function getAllSectionsFromForm(formStructure: FormStructure): FormSection[] {
  const allSections: FormSection[] = []

  formStructure.pages.forEach((page) => {
    if (page.sections) {
      allSections.push(...page.sections)
    }
  })

  return allSections
}

// Simulate field rendering to catch configuration errors
function simulateRender(field: FormField): void {
  const config = FIELD_TYPE_CONFIG[field.field_type]

  if (!config) {
    throw new Error(`Unknown field type: ${field.field_type}`)
  }

  // Check if field type requires options
  if (config.supportsOptions && ["select", "multiselect", "radio", "checkbox"].includes(field.field_type)) {
    if (!field.options || field.options.length === 0) {
      throw new Error(`Field type '${field.field_type}' requires options`)
    }

    // Check for duplicate option values
    const values = field.options.map((opt) => opt.value)
    const duplicates = values.filter((value, index) => values.indexOf(value) !== index)
    if (duplicates.length > 0) {
      throw new Error(`Duplicate option values found: ${duplicates.join(", ")}`)
    }

    // Check for empty option labels or values
    field.options.forEach((option, index) => {
      if (!option.label || option.label.trim() === "") {
        throw new Error(`Option ${index + 1} has empty label`)
      }
      if (!option.value || option.value.trim() === "") {
        throw new Error(`Option ${index + 1} has empty value`)
      }
    })
  }

  // Check calculated field configuration
  if (field.calculated_config?.enabled) {
    if (!field.calculated_config.formula) {
      throw new Error("Calculated field requires a formula")
    }

    if (field.calculated_config.dependencies && field.calculated_config.dependencies.length === 0) {
      throw new Error("Calculated field should specify dependencies")
    }
  }

  // Check conditional visibility configuration
  if (field.conditional_visibility?.enabled) {
    if (!field.conditional_visibility.conditions || field.conditional_visibility.conditions.length === 0) {
      throw new Error("Conditional visibility requires at least one condition")
    }

    field.conditional_visibility.conditions.forEach((condition, index) => {
      if (!condition.fieldId) {
        throw new Error(`Condition ${index + 1} missing field ID`)
      }
      if (!condition.operator) {
        throw new Error(`Condition ${index + 1} missing operator`)
      }
      if (condition.value === undefined && !["is_empty", "is_not_empty"].includes(condition.operator)) {
        throw new Error(`Condition ${index + 1} missing value`)
      }
    })
  }

  // Check prefill configuration
  if (field.prefill_config?.enabled) {
    if (!field.prefill_config.source) {
      throw new Error("Prefill configuration requires a source")
    }

    if (field.prefill_config.source === "api" && !field.prefill_config.endpoint) {
      throw new Error("API prefill requires an endpoint")
    }

    if (field.prefill_config.source === "lookup" && !field.prefill_config.key) {
      throw new Error("Lookup prefill requires a key")
    }
  }

  // Check validation rules
  if (field.validation && field.validation.length > 0) {
    field.validation.forEach((rule, index) => {
      if (!rule.type) {
        throw new Error(`Validation rule ${index + 1} missing type`)
      }

      if (["min", "max", "minLength", "maxLength"].includes(rule.type) && rule.value === undefined) {
        throw new Error(`Validation rule ${index + 1} of type '${rule.type}' requires a value`)
      }

      if (rule.type === "pattern" && !rule.pattern) {
        throw new Error(`Validation rule ${index + 1} of type 'pattern' requires a pattern`)
      }

      if (rule.type === "custom" && !rule.customFunction) {
        throw new Error(`Validation rule ${index + 1} of type 'custom' requires a custom function`)
      }
    })
  }
}

// Check for circular dependencies in conditional logic
function checkCircularDependencies(fields: FormField[]): DiagnosticError[] {
  const errors: DiagnosticError[] = []
  const fieldMap = new Map(fields.map((f) => [f.id, f]))

  function hasCycle(fieldId: string, visited: Set<string>, path: Set<string>): boolean {
    if (path.has(fieldId)) return true
    if (visited.has(fieldId)) return false

    visited.add(fieldId)
    path.add(fieldId)

    const field = fieldMap.get(fieldId)
    if (field?.conditional_visibility?.enabled && field.conditional_visibility.conditions) {
      for (const condition of field.conditional_visibility.conditions) {
        if (hasCycle(condition.fieldId, visited, path)) {
          return true
        }
      }
    }

    if (field?.calculated_config?.enabled && field.calculated_config.dependencies) {
      for (const depId of field.calculated_config.dependencies) {
        if (hasCycle(depId, visited, path)) {
          return true
        }
      }
    }

    path.delete(fieldId)
    return false
  }

  const visited = new Set<string>()

  for (const field of fields) {
    if (!visited.has(field.id)) {
      if (hasCycle(field.id, visited, new Set())) {
        errors.push({
          type: "ConfigError",
          fieldId: field.id,
          fieldLabel: field.label,
          message: "Circular dependency detected in conditional logic or calculations",
          severity: "error",
        })
      }
    }
  }

  return errors
}

// Main diagnostic function
export const runFormDiagnostics = (formStructure: FormStructure): DiagnosticReport => {
  const startTime = Date.now()
  const report: DiagnosticReport = {
    status: "passed",
    errors: [],
    warnings: [],
    fieldCount: 0,
    sectionCount: 0,
    pageCount: 0,
    executionTime: 0,
  }

  try {
    // Count elements
    report.pageCount = formStructure.pages.length
    report.sectionCount = getAllSectionsFromForm(formStructure).length
    report.fieldCount = getAllFieldsFromForm(formStructure).length

    // Validate form schema
    try {
      const result = validateFormSchema(formStructure)
      if (!result.valid) {
        report.errors.push(
          ...result.errors.map((msg) => ({
            type: "SchemaError" as const,
            message: msg,
            severity: "error" as const,
          })),
        )
      }
    } catch (schemaError) {
      report.errors.push({
        type: "SchemaError",
        message: `Schema validation failed: ${schemaError instanceof Error ? schemaError.message : "Unknown error"}`,
        severity: "error",
      })
    }

    // Get all fields and validate each one
    const allFields = getAllFieldsFromForm(formStructure)
    const allSections = getAllSectionsFromForm(formStructure)

    // Check for circular dependencies
    const circularErrors = checkCircularDependencies(allFields)
    report.errors.push(...circularErrors)

    // Validate each field
    for (const field of allFields) {
      try {
        simulateRender(field)
      } catch (err) {
        report.errors.push({
          type: "RenderError",
          fieldId: field.id,
          fieldLabel: field.label,
          message: err instanceof Error ? err.message : "Unknown render error",
          severity: "error",
        })
      }
    }

    // Check for warnings
    for (const section of allSections) {
      if (!section.title || section.title.trim() === "") {
        report.warnings.push({
          type: "ConfigError",
          sectionId: section.id,
          message: "Section title is recommended for better form organization",
          severity: "warning",
        })
      }
    }

    for (const page of formStructure.pages) {
      if (!page.description || page.description.trim() === "") {
        report.warnings.push({
          type: "ConfigError",
          pageId: page.id,
          pageTitle: page.title,
          message: "Page description is recommended for better user experience",
          severity: "warning",
        })
      }
    }

    // Check for fields without help text
    const complexFieldTypes = ["calculated", "lookup", "matrix", "signature"]
    for (const field of allFields) {
      if (complexFieldTypes.includes(field.field_type) && (!field.help_text || field.help_text.trim() === "")) {
        report.warnings.push({
          type: "ConfigError",
          fieldId: field.id,
          fieldLabel: field.label,
          message: `Complex field type '${field.field_type}' should include help text`,
          severity: "warning",
        })
      }
    }

    // Set final status
    if (report.errors.length > 0) {
      report.status = "failed"
    }
  } catch (fatal) {
    report.status = "crashed"
    report.errors.push({
      type: "FatalError",
      message: fatal instanceof Error ? fatal.message : "Unknown fatal error",
      severity: "error",
    })
  }

  report.executionTime = Date.now() - startTime
  return report
}

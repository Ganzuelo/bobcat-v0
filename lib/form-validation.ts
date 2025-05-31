import { z } from "zod"
import type { FormField, ValidationRule, FieldOption } from "./form-types"
import { VALIDATION_PATTERNS, FIELD_TYPES } from "./form-types"

// Field value validation based on field type and rules
export const createFieldValueSchema = (field: FormField): z.ZodSchema => {
  let schema: z.ZodSchema = z.any()

  // Base schema based on field type
  switch (field.field_type) {
    case FIELD_TYPES.TEXT:
    case FIELD_TYPES.TEXTAREA:
    case FIELD_TYPES.PASSWORD:
      schema = z.string()
      break

    case FIELD_TYPES.EMAIL:
      schema = z.string().email("Invalid email address")
      break

    case FIELD_TYPES.PHONE:
      schema = z.string().regex(VALIDATION_PATTERNS.PHONE, "Invalid phone number")
      break

    case FIELD_TYPES.URL:
      schema = z.string().url("Invalid URL")
      break

    case FIELD_TYPES.NUMBER:
    case FIELD_TYPES.CURRENCY:
    case FIELD_TYPES.PERCENTAGE:
    case FIELD_TYPES.RATING:
    case FIELD_TYPES.SLIDER:
      schema = z.number()
      break

    case FIELD_TYPES.DATE:
      schema = z.string().regex(VALIDATION_PATTERNS.DATE_ISO, "Invalid date format")
      break

    case FIELD_TYPES.DATETIME:
      schema = z.string().datetime("Invalid datetime format")
      break

    case FIELD_TYPES.TIME:
      schema = z.string().regex(VALIDATION_PATTERNS.TIME, "Invalid time format")
      break

    case FIELD_TYPES.SELECT:
    case FIELD_TYPES.RADIO:
      schema = z.string()
      if (field.options && field.options.length > 0) {
        const validValues = field.options.map((opt) => opt.value)
        schema = z.enum(validValues as [string, ...string[]])
      }
      break

    case FIELD_TYPES.MULTISELECT:
    case FIELD_TYPES.CHECKBOX:
      schema = z.array(z.string())
      if (field.options && field.options.length > 0) {
        const validValues = field.options.map((opt) => opt.value)
        schema = z.array(z.enum(validValues as [string, ...string[]]))
      }
      break

    case FIELD_TYPES.TOGGLE:
      schema = z.boolean()
      break

    case FIELD_TYPES.FILE:
    case FIELD_TYPES.IMAGE:
    case FIELD_TYPES.SIGNATURE:
      schema = z.union([z.string(), z.instanceof(File)])
      break

    case FIELD_TYPES.ADDRESS:
      schema = z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        country: z.string().optional(),
      })
      break

    case FIELD_TYPES.LOCATION:
      schema = z.object({
        latitude: z.number(),
        longitude: z.number(),
        accuracy: z.number().optional(),
      })
      break

    case FIELD_TYPES.MATRIX:
      schema = z.record(z.string(), z.string())
      break

    default:
      schema = z.any()
  }

  // Apply validation rules
  if (field.validation) {
    field.validation.forEach((rule: ValidationRule) => {
      switch (rule.type) {
        case "required":
          if (rule.value === true) {
            if (schema instanceof z.ZodString) {
              schema = schema.min(1, rule.message || "This field is required")
            } else if (schema instanceof z.ZodArray) {
              schema = schema.min(1, rule.message || "At least one option must be selected")
            } else {
              schema = schema.refine((val) => val != null && val !== "", {
                message: rule.message || "This field is required",
              })
            }
          }
          break

        case "min":
          if (typeof rule.value === "number") {
            if (schema instanceof z.ZodNumber) {
              schema = schema.min(rule.value, rule.message)
            } else if (schema instanceof z.ZodArray) {
              schema = schema.min(rule.value, rule.message)
            }
          }
          break

        case "max":
          if (typeof rule.value === "number") {
            if (schema instanceof z.ZodNumber) {
              schema = schema.max(rule.value, rule.message)
            } else if (schema instanceof z.ZodArray) {
              schema = schema.max(rule.value, rule.message)
            }
          }
          break

        case "minLength":
          if (typeof rule.value === "number" && schema instanceof z.ZodString) {
            schema = schema.min(rule.value, rule.message)
          }
          break

        case "maxLength":
          if (typeof rule.value === "number" && schema instanceof z.ZodString) {
            schema = schema.max(rule.value, rule.message)
          }
          break

        case "pattern":
          if (rule.pattern && schema instanceof z.ZodString) {
            const regex = new RegExp(rule.pattern)
            schema = schema.regex(regex, rule.message || "Invalid format")
          }
          break

        case "custom":
          if (rule.customFunction) {
            try {
              // Note: In a real implementation, you'd want to safely evaluate custom functions
              // This is a simplified example
              const customFn = new Function("value", rule.customFunction)
              schema = schema.refine(customFn, {
                message: rule.message || "Custom validation failed",
              })
            } catch (error) {
              console.error("Error in custom validation function:", error)
            }
          }
          break
      }
    })
  }

  // Make optional if not required
  if (!field.required) {
    schema = schema.optional()
  }

  return schema
}

// Create validation schema for entire form
export const createFormValidationSchema = (fields: FormField[]) => {
  const schemaObject: Record<string, z.ZodSchema> = {}

  fields.forEach((field) => {
    if (
      field.field_type !== FIELD_TYPES.SECTION_BREAK &&
      field.field_type !== FIELD_TYPES.PAGE_BREAK &&
      field.field_type !== FIELD_TYPES.HTML_CONTENT
    ) {
      schemaObject[field.id] = createFieldValueSchema(field)
    }
  })

  return z.object(schemaObject)
}

// Validate form submission data
export const validateFormSubmission = (
  fields: FormField[],
  data: Record<string, any>,
): { success: boolean; errors: Record<string, string[]>; data?: any } => {
  const schema = createFormValidationSchema(fields)
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, errors: {}, data: result.data }
  } else {
    const errors: Record<string, string[]> = {}
    result.error.errors.forEach((error) => {
      const path = error.path.join(".")
      if (!errors[path]) {
        errors[path] = []
      }
      errors[path].push(error.message)
    })
    return { success: false, errors }
  }
}

// Field-specific validation helpers
export const validateFieldOptions = (options: FieldOption[]): string[] => {
  const errors: string[] = []
  const values = new Set<string>()

  options.forEach((option, index) => {
    if (!option.label.trim()) {
      errors.push(`Option ${index + 1}: Label is required`)
    }
    if (!option.value.trim()) {
      errors.push(`Option ${index + 1}: Value is required`)
    }
    if (values.has(option.value)) {
      errors.push(`Option ${index + 1}: Duplicate value "${option.value}"`)
    }
    values.add(option.value)
  })

  return errors
}

export const validateCalculatedFormula = (formula: string, availableFields: string[]): string[] => {
  const errors: string[] = []

  if (!formula.trim()) {
    errors.push("Formula is required")
    return errors
  }

  // Basic syntax validation (simplified)
  const validOperators = ["+", "-", "*", "/", "(", ")", ".", "Math.", "Number(", "parseFloat(", "parseInt("]
  const fieldPattern = /\{([^}]+)\}/g
  const referencedFields: string[] = []

  let match
  while ((match = fieldPattern.exec(formula)) !== null) {
    const fieldId = match[1]
    referencedFields.push(fieldId)
    if (!availableFields.includes(fieldId)) {
      errors.push(`Referenced field "${fieldId}" does not exist`)
    }
  }

  // Check for circular references (simplified)
  if (referencedFields.length === 0) {
    errors.push("Formula must reference at least one field")
  }

  return errors
}

export const validateConditionalLogic = (conditions: any[], availableFields: string[]): string[] => {
  const errors: string[] = []

  conditions.forEach((condition, index) => {
    if (!condition.fieldId) {
      errors.push(`Condition ${index + 1}: Field is required`)
    } else if (!availableFields.includes(condition.fieldId)) {
      errors.push(`Condition ${index + 1}: Referenced field does not exist`)
    }

    if (!condition.operator) {
      errors.push(`Condition ${index + 1}: Operator is required`)
    }

    const operatorsRequiringValue = ["equals", "not_equals", "contains", "not_contains", "greater_than", "less_than"]
    if (
      operatorsRequiringValue.includes(condition.operator) &&
      (condition.value === undefined || condition.value === "")
    ) {
      errors.push(`Condition ${index + 1}: Value is required for operator "${condition.operator}"`)
    }
  })

  return errors
}

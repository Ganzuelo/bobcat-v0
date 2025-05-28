import { z } from "zod"

// Define valid field types
const VALID_FIELD_TYPES = [
  // Text inputs
  "text",
  "textarea",
  "email",
  "password",
  "phone",
  "url",
  // Number inputs
  "number",
  "currency",
  "percentage",
  // Selection inputs
  "select",
  "multiselect",
  "radio",
  "checkbox",
  "toggle",
  // Date/time inputs
  "date",
  "datetime",
  "time",
  // File inputs
  "file",
  "image",
  "signature",
  // Interactive inputs
  "rating",
  "slider",
  "matrix",
  // Location inputs
  "address",
  "location",
  // Calculated/dynamic fields
  "calculated",
  "lookup",
  "hidden",
  // Layout elements
  "section_break",
  "page_break",
  "html_content",
] as const

type ValidFieldType = (typeof VALID_FIELD_TYPES)[number]

// Define valid form types
const VALID_FORM_TYPES = ["UAD_3_6", "UAD_2_6", "BPO", "Other"] as const

// Define valid width options
const VALID_WIDTHS = ["quarter", "half", "three_quarters", "full"] as const

// Field option schema for select/radio/checkbox fields
const FieldOptionSchema = z.object({
  label: z.string().min(1, "Option label cannot be empty"),
  value: z.string().min(1, "Option value cannot be empty"),
  disabled: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
})

// Matrix option schema (includes type for row/column distinction)
const MatrixOptionSchema = z.object({
  type: z.enum(["row", "column"], {
    errorMap: () => ({ message: "Matrix option type must be 'row' or 'column'" }),
  }),
  label: z.string().min(1, "Matrix option label cannot be empty"),
  value: z.string().min(1, "Matrix option value cannot be empty"),
  disabled: z.boolean().optional(),
})

// Calculated config schema
const CalculatedConfigSchema = z.object({
  enabled: z.boolean(),
  formula: z.string().min(1, "Calculated field must have a formula"),
  dependencies: z.array(z.string()).optional(),
  outputFormat: z.string().optional(),
  precision: z.number().int().min(0).max(10).optional(),
})

// Lookup config schema
const LookupConfigSchema = z.object({
  enabled: z.boolean(),
  dataSource: z.enum(["api", "database", "static"], {
    errorMap: () => ({ message: "Lookup dataSource must be 'api', 'database', or 'static'" }),
  }),
  endpoint: z.string().min(1, "Lookup field must have an endpoint").optional(),
  table: z.string().optional(),
  keyField: z.string().optional(),
  valueField: z.string().optional(),
  filters: z.record(z.any()).optional(),
  cacheTimeout: z.number().optional(),
})

// Base field schema
const BaseFieldSchema = z.object({
  id: z.string().min(1, "Field ID cannot be empty"),
  field_type: z.enum(VALID_FIELD_TYPES as any, {
    errorMap: () => ({
      message: `Field type must be one of: ${VALID_FIELD_TYPES.join(", ")}`,
    }),
  }),
  label: z.string().min(1, "Field label cannot be empty"),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  required: z.boolean().optional(),
  width: z.enum(VALID_WIDTHS as any).optional(),
  field_order: z.number().int().min(0).optional(),
  validation: z.record(z.any()).optional(),
  conditional_visibility: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// Field schema with conditional validation based on field type
const FieldSchema = BaseFieldSchema.superRefine((field, ctx) => {
  const fieldType = field.field_type as ValidFieldType

  // Selection fields require options array
  if (["select", "multiselect", "radio", "checkbox"].includes(fieldType)) {
    const options = (field as any).options
    if (!options || !Array.isArray(options) || options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Field type '${fieldType}' requires a non-empty options array`,
        path: ["options"],
      })
    } else {
      // Validate each option
      options.forEach((option: any, index: number) => {
        const optionResult = FieldOptionSchema.safeParse(option)
        if (!optionResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid option at index ${index}: ${optionResult.error.errors[0]?.message}`,
            path: ["options", index],
          })
        }
      })
    }
  }

  // Matrix fields require options with row and column types
  if (fieldType === "matrix") {
    const options = (field as any).options
    if (!options || !Array.isArray(options) || options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Matrix field requires a non-empty options array",
        path: ["options"],
      })
    } else {
      const hasRows = options.some((opt: any) => opt.type === "row")
      const hasColumns = options.some((opt: any) => opt.type === "column")

      if (!hasRows) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Matrix field must have at least one row option",
          path: ["options"],
        })
      }

      if (!hasColumns) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Matrix field must have at least one column option",
          path: ["options"],
        })
      }

      // Validate each matrix option
      options.forEach((option: any, index: number) => {
        const optionResult = MatrixOptionSchema.safeParse(option)
        if (!optionResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid matrix option at index ${index}: ${optionResult.error.errors[0]?.message}`,
            path: ["options", index],
          })
        }
      })
    }
  }

  // Calculated fields require calculated_config with formula
  if (fieldType === "calculated") {
    const calculatedConfig = (field as any).calculated_config
    if (!calculatedConfig) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Calculated field requires calculated_config",
        path: ["calculated_config"],
      })
    } else {
      const configResult = CalculatedConfigSchema.safeParse(calculatedConfig)
      if (!configResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid calculated_config: ${configResult.error.errors[0]?.message}`,
          path: ["calculated_config"],
        })
      }
    }
  }

  // Lookup fields require lookup_config with dataSource
  if (fieldType === "lookup") {
    const lookupConfig = (field as any).lookup_config
    if (!lookupConfig) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Lookup field requires lookup_config",
        path: ["lookup_config"],
      })
    } else {
      const configResult = LookupConfigSchema.safeParse(lookupConfig)
      if (!configResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid lookup_config: ${configResult.error.errors[0]?.message}`,
          path: ["lookup_config"],
        })
      }
    }
  }
})

// Section schema
const SectionSchema = z.object({
  id: z.string().min(1, "Section ID cannot be empty"),
  title: z.string().min(1, "Section title cannot be empty"),
  description: z.string().optional(),
  section_order: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional(),
  fields: z.array(FieldSchema).optional().default([]),
})

// Page schema
const PageSchema = z.object({
  id: z.string().min(1, "Page ID cannot be empty"),
  title: z.string().min(1, "Page title cannot be empty"),
  description: z.string().optional(),
  page_order: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional(),
  sections: z.array(SectionSchema).min(1, "Page must have at least one section"),
})

// Form schema
const FormSchema = z.object({
  id: z.string().min(1, "Form ID cannot be empty"),
  name: z.string().min(1, "Form name cannot be empty"),
  description: z.string().optional(),
  formType: z.enum(VALID_FORM_TYPES, {
    errorMap: () => ({
      message: `Form type must be one of: ${VALID_FORM_TYPES.join(", ")}`,
    }),
  }),
  pages: z.array(PageSchema).min(1, "Form must have at least one page"),
})

// Validation result types
export interface ValidationSuccess {
  valid: true
  data: z.infer<typeof FormSchema>
  errors: null
}

export interface ValidationFailure {
  valid: false
  data: null
  errors: string[]
}

export type ValidationResult = ValidationSuccess | ValidationFailure

// Main validation function
export function validateFormSchema(form: unknown): ValidationResult {
  console.log("🔍 Starting form schema validation...")

  try {
    // Parse and validate the form
    const result = FormSchema.safeParse(form)

    if (result.success) {
      console.log("✅ Form schema validation successful")
      return {
        valid: true,
        data: result.data,
        errors: null,
      }
    } else {
      console.error("❌ Form schema validation failed:", result.error)

      // Flatten and format errors for better readability
      const errors = result.error.errors.map((error) => {
        const path = error.path.length > 0 ? `${error.path.join(".")} - ` : ""
        return `${path}${error.message}`
      })

      return {
        valid: false,
        data: null,
        errors,
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error during validation:", error)

    return {
      valid: false,
      data: null,
      errors: [`Unexpected validation error: ${error instanceof Error ? error.message : "Unknown error"}`],
    }
  }
}

// Helper function to validate just field types
export function validateFieldType(fieldType: string): boolean {
  return VALID_FIELD_TYPES.includes(fieldType as ValidFieldType)
}

// Helper function to get all valid field types
export function getValidFieldTypes(): readonly string[] {
  return VALID_FIELD_TYPES
}

// Helper function to get all valid form types
export function getValidFormTypes(): readonly string[] {
  return VALID_FORM_TYPES
}

// Export the schema for external use if needed
export { FormSchema, FieldSchema, SectionSchema, PageSchema }

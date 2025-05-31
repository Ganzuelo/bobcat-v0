import { z } from "zod"
import type {
  FieldOptionSchema,
  ValidationRuleSchema,
  ConditionalVisibilitySchema,
  CalculatedConfigSchema,
  LookupConfigSchema,
  PrefillConfigSchema,
} from "./form-schemas"
import type { CarryforwardConfigSchema, FormFieldMetadataSchema } from "./field-metadata"
import type { FieldType } from "./field-types"

// Core field interfaces
export interface FieldValidation {
  type: string
  value?: any
  message?: string
}

export interface FieldConditional {
  field: string
  operator: string
  value: any
}

export type FieldWidthType = "FULL" | "HALF" | "THIRD" | "QUARTER"

// Main FormField interface
export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  helpText?: string
  required?: boolean
  options?: { label: string; value: string }[]
  defaultValue?: any
  validation?: FieldValidation
  conditional?: FieldConditional
  width?: FieldWidthType
  prefill?: PrefillConfig
  metadata?: Record<string, any>
  // Sales Grid specific properties
  gridConfig?: SalesGridConfig
}

// Sales Grid interfaces
export interface SalesGridConfig {
  columns: SalesGridColumn[]
  minRows?: number
  maxRows?: number
  rowLabel?: string
}

export interface SalesGridColumn {
  id: string
  header: string
  type: "TEXT" | "NUMBER" | "SELECT" | "CHECKBOX"
  width?: number // Width in pixels or percentage
  options?: { label: string; value: string }[]
  defaultValue?: any
  required?: boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface SalesGridData {
  rows: SalesGridRow[]
}

export interface SalesGridRow {
  id: string
  label: string
  cells: Record<string, any> // Map of column id to cell value
}

// Form structure interfaces
export interface FormSection extends z.infer<typeof FormSectionSchema> {
  fields?: FormField[]
}

export interface FormPage extends z.infer<typeof FormPageSchema> {
  sections?: FormSection[]
}

// Extended interfaces with populated relationships
export interface FieldOption extends z.infer<typeof FieldOptionSchema> {}
export interface ValidationRule extends z.infer<typeof ValidationRuleSchema> {}
export interface ConditionalVisibility extends z.infer<typeof ConditionalVisibilitySchema> {}
export interface CalculatedConfig extends z.infer<typeof CalculatedConfigSchema> {}
export interface LookupConfig extends z.infer<typeof LookupConfigSchema> {}
export interface PrefillConfig extends z.infer<typeof PrefillConfigSchema> {}
export interface CarryforwardConfig extends z.infer<typeof CarryforwardConfigSchema> {}
export interface FormFieldMetadata extends z.infer<typeof FormFieldMetadataSchema> {}

// Form builder utility types
export type FieldCategory =
  | "input"
  | "selection"
  | "date"
  | "file"
  | "interactive"
  | "location"
  | "calculated"
  | "layout"

export interface FieldTypeGroup {
  category: FieldCategory
  label: string
  fields: {
    type: FieldType
    config: any
  }[]
}

// Zod schemas for form structure
export const FormSectionSchema = z.object({
  id: z.string().uuid(),
  page_id: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  section_order: z.number().min(0),
  settings: z
    .object({
      collapsible: z.boolean().optional(),
      collapsed: z.boolean().optional(),
      columns: z.number().min(1).max(12).optional(),
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      padding: z.string().optional(),
      margin: z.string().optional(),
    })
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const FormPageSchema = z.object({
  id: z.string().uuid(),
  form_id: z.string().uuid(),
  title: z.string().min(1, "Page title is required"),
  description: z.string().optional(),
  page_order: z.number().min(0),
  settings: z
    .object({
      showProgressBar: z.boolean().optional(),
      allowBack: z.boolean().optional(),
      allowSkip: z.boolean().optional(),
      backgroundColor: z.string().optional(),
      headerImage: z.string().optional(),
      customCSS: z.string().optional(),
    })
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const FormFieldSchema = z.object({
  id: z.string().uuid(),
  section_id: z.string().uuid(),
  field_type: z.string(), // Changed to string to match FieldType
  label: z.string().min(1, "Field label is required"),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  guidance: z.string().optional(),
  required: z.boolean().default(false),
  width: z.string().optional(), // Changed to string to match FieldWidth
  field_order: z.number().min(0),

  // Field configuration
  options: z.array(FieldOptionSchema).optional(),
  validation: z.array(ValidationRuleSchema).optional(),
  conditional_visibility: ConditionalVisibilitySchema.optional(),
  calculated_config: CalculatedConfigSchema.optional(),
  lookup_config: LookupConfigSchema.optional(),
  prefill_config: PrefillConfigSchema.optional(),
  carryforward_config: CarryforwardConfigSchema.optional(),
  metadata: FormFieldMetadataSchema.optional(),

  // Timestamps
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

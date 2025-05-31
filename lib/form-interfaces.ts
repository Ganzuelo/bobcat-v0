import type { FieldType } from "./field-types"
import type { FormSectionSchema, FormPageSchema } from "./form-schemas"
import type { z } from "zod"
import type {
  FieldOptionSchema,
  ValidationRuleSchema,
  ConditionalVisibilitySchema,
  CalculatedConfigSchema,
  LookupConfigSchema,
  PrefillConfigSchema,
} from "./field-validation"
import type { FormFieldMetadataSchema, CarryforwardConfigSchema } from "./field-metadata"

// Carryforward configuration
export const CARRYFORWARD_MODES = {
  DEFAULT: "default",
  MIRROR: "mirror",
} as const

export type CarryforwardMode = (typeof CARRYFORWARD_MODES)[keyof typeof CARRYFORWARD_MODES]

// New interfaces
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

// New interface for Sales Grid configuration
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
    config: {
      label: string
      icon: any
      category: FieldCategory
      description: string
      supportsValidation: boolean
      supportsOptions: boolean
      supportsCalculation: boolean
      supportsLookup: boolean
    }
  }[]
}

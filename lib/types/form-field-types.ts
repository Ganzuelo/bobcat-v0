import type { z } from "zod"
import type { FieldType } from "./field-types"
import type { FieldWidth } from "./field-width-types"
import type { FormFieldMetadata } from "./compliance-types"
import type {
  ValidationRuleSchema,
  ConditionalVisibilitySchema,
  CalculatedConfigSchema,
  LookupConfigSchema,
  PrefillConfigSchema,
  FieldOptionSchema,
} from "./validation-types"
import type { CarryforwardConfigSchema } from "./carryforward-types"

export interface FormField {
  id: string
  section_id: string
  field_type: FieldType
  label: string
  placeholder?: string
  help_text?: string
  guidance?: string
  required?: boolean
  width?: FieldWidth
  field_order: number
  options?: FieldOption[]
  validation?: ValidationRule[]
  conditional_visibility?: ConditionalVisibility
  calculated_config?: CalculatedConfig
  lookup_config?: LookupConfig
  prefill_config?: PrefillConfig
  carryforward_config?: CarryforwardConfig
  metadata?: FormFieldMetadata
  created_at: string
  updated_at: string
}

export interface FieldOption extends z.infer<typeof FieldOptionSchema> {}
export interface ValidationRule extends z.infer<typeof ValidationRuleSchema> {}
export interface ConditionalVisibility extends z.infer<typeof ConditionalVisibilitySchema> {}
export interface CalculatedConfig extends z.infer<typeof CalculatedConfigSchema> {}
export interface LookupConfig extends z.infer<typeof LookupConfigSchema> {}
export interface PrefillConfig extends z.infer<typeof PrefillConfigSchema> {}
export interface CarryforwardConfig extends z.infer<typeof CarryforwardConfigSchema> {}

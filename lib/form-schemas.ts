import { z } from "zod"
import {
  FieldOptionSchema,
  ValidationRuleSchema,
  ConditionalVisibilitySchema,
  CalculatedConfigSchema,
  LookupConfigSchema,
  PrefillConfigSchema,
} from "./field-validation"
import { FormFieldMetadataSchema } from "./field-metadata"
import { CarryforwardConfigSchema } from "./field-metadata"

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

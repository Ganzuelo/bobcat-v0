import { z } from "zod"

// URAR/MISMO compliance metadata
export const URAR_CARDINALITY = {
  REQUIRED: "required",
  OPTIONAL: "optional",
  CONDITIONAL: "conditional",
  NOT_APPLICABLE: "not_applicable",
} as const

export type UrarCardinality = (typeof URAR_CARDINALITY)[keyof typeof URAR_CARDINALITY]

export const URAR_CONDITIONALITY = {
  ALWAYS: "always",
  CONDITIONAL: "conditional",
  NEVER: "never",
} as const

export type UrarConditionality = (typeof URAR_CONDITIONALITY)[keyof typeof URAR_CONDITIONALITY]

export const URAR_OUTPUT_FORMAT = {
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
  CURRENCY: "currency",
  PERCENTAGE: "percentage",
  BOOLEAN: "boolean",
  LIST: "list",
} as const

export type UrarOutputFormat = (typeof URAR_OUTPUT_FORMAT)[keyof typeof URAR_OUTPUT_FORMAT]

// Carryforward configuration
export const CARRYFORWARD_MODES = {
  DEFAULT: "default",
  MIRROR: "mirror",
} as const

export type CarryforwardMode = (typeof CARRYFORWARD_MODES)[keyof typeof CARRYFORWARD_MODES]

export const CarryforwardConfigSchema = z.object({
  enabled: z.boolean().default(false),
  source: z.string().optional(), // Field ID to copy from
  mode: z.nativeEnum(CARRYFORWARD_MODES).default(CARRYFORWARD_MODES.DEFAULT),
})

export interface CarryforwardConfig extends z.infer<typeof CarryforwardConfigSchema> {}

export const FormFieldMetadataSchema = z.object({
  // UAD 3.6 compliance field
  uad_field_id: z.string().optional(),

  // URAR/MISMO compliance fields
  reportFieldId: z.string().optional(),
  mismoFieldId: z.string().optional(),
  mismo_path: z.string().optional(),
  cardinality: z.nativeEnum(URAR_CARDINALITY).optional(),
  conditionality: z.nativeEnum(URAR_CONDITIONALITY).optional(),
  outputFormat: z.nativeEnum(URAR_OUTPUT_FORMAT).optional(),
  category: z.string().optional(),
  xml: z
    .object({
      fieldId: z.string().optional(),
      required: z.boolean().optional(),
      format: z.string().optional(),
    })
    .optional(),
})

export interface FormFieldMetadata extends z.infer<typeof FormFieldMetadataSchema> {}

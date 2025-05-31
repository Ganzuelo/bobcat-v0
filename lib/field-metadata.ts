import { z } from "zod"
import { URAR_CARDINALITY, URAR_CONDITIONALITY, URAR_OUTPUT_FORMAT } from "./field-types"
import { CARRYFORWARD_MODES } from "./form-interfaces"

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

  // XML configuration
  xml: z
    .object({
      fieldId: z.string().optional(),
      path: z.string().optional(),
      required: z.boolean().optional(),
      format: z.string().optional(),
    })
    .optional(),

  // Field categorization
  category: z.string().optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dataType: z.string().optional(),
  unit: z.string().optional(),

  // Documentation
  documentation: z.string().optional(),
  examples: z.array(z.string()).optional(),
  notes: z.string().optional(),

  // Compliance tracking
  lastReviewed: z.string().optional(),
  reviewedBy: z.string().optional(),
  complianceVersion: z.string().optional(),

  // Custom metadata
  custom: z.record(z.any()).optional(),
})

export const CarryforwardConfigSchema = z.object({
  enabled: z.boolean().default(false),
  source: z.string().optional(), // Field ID to copy from
  mode: z.nativeEnum(CARRYFORWARD_MODES).default(CARRYFORWARD_MODES.DEFAULT),
})

import { type FieldType, FIELD_WIDTHS } from "./field-types"
import type { FormField, FieldTypeGroup, FieldCategory } from "./form-interfaces"
import { FormFieldSchema } from "./form-interfaces"

// Helper functions for field type management
export const getFieldTypesByCategory = (): FieldTypeGroup[] => {
  // Return empty array for now - this function needs to be implemented based on actual field-types exports
  return []
}

export const getFieldTypeConfig = (type: FieldType) => {
  // Return basic config - this function needs to be implemented based on actual field-types exports
  return { label: type, category: "input" as FieldCategory }
}

export const validateFieldData = (field: Partial<FormField>) => {
  return FormFieldSchema.safeParse(field)
}

export const createDefaultField = (
  type: FieldType,
  sectionId: string,
  order: number,
): Omit<FormField, "id" | "created_at" | "updated_at"> => {
  const config = getFieldTypeConfig(type)

  return {
    section_id: sectionId,
    field_type: type,
    label: `New ${config.label} Field`,
    required: false,
    width: FIELD_WIDTHS.FULL,
    field_order: order,
    options: config.supportsOptions ? [] : undefined,
    validation: [],
    conditional_visibility: { enabled: false },
    calculated_config: config.supportsCalculation ? { enabled: false } : undefined,
    lookup_config: config.supportsLookup ? { enabled: false, dataSource: "static" } : undefined,
    prefill_config: { enabled: false, source: "internal" },
    carryforward_config: { enabled: false, mode: "default" },
    metadata: {},
  }
}

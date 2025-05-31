import type { FieldType } from "./field-types"
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
  return {
    section_id: sectionId,
    field_type: type,
    label: `New ${type} Field`,
    required: false,
    width: "full",
    field_order: order,
    validation: [],
    conditional_visibility: { enabled: false },
    prefill_config: { enabled: false, source: "internal" },
    carryforward_config: { enabled: false, mode: "default" },
    metadata: {},
  }
}

import { FIELD_TYPE_CONFIG, type FieldType, FIELD_WIDTHS } from "./field-types"
import { FormFieldSchema } from "./form-schemas"
import type { FormField, FieldTypeGroup, FieldCategory } from "./form-interfaces"

// Helper functions for field type management
export const getFieldTypesByCategory = (): FieldTypeGroup[] => {
  const categories: Record<FieldCategory, FieldTypeGroup> = {
    input: { category: "input", label: "Text Inputs", fields: [] },
    selection: { category: "selection", label: "Selection", fields: [] },
    date: { category: "date", label: "Date & Time", fields: [] },
    file: { category: "file", label: "File Upload", fields: [] },
    interactive: { category: "interactive", label: "Interactive", fields: [] },
    location: { category: "location", label: "Location", fields: [] },
    calculated: { category: "calculated", label: "Calculated", fields: [] },
    layout: { category: "layout", label: "Layout", fields: [] },
  }

  Object.entries(FIELD_TYPE_CONFIG).forEach(([type, config]) => {
    categories[config.category].fields.push({
      type: type as FieldType,
      config,
    })
  })

  return Object.values(categories)
}

export const getFieldTypeConfig = (type: FieldType) => {
  return FIELD_TYPE_CONFIG[type]
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
    carryforward_config: { enabled: false, mode: "DEFAULT" },
    metadata: {},
  }
}

import type { FormField } from "@/lib/form-types"
import type { FieldType } from "@/lib/database-types"
import { FIELD_WIDTH_CONFIG, type FieldWidthKey } from "@/lib/form-width-utils"

// Re-export width utilities for backward compatibility
export {
  getGridColClass,
  getWidthLabel,
  getTailwindWidthClass,
  getResponsiveWidthClasses,
} from "@/lib/form-width-utils"

// Helper function to create a new field with proper width handling
export const createNewField = (sectionId: string, fieldType: FieldType, fieldOrder: number): FormField => {
  return {
    id: crypto.randomUUID(),
    section_id: sectionId,
    field_type: fieldType,
    label: `New ${fieldType} field`,
    placeholder: "",
    help_text: "",
    required: false,
    width: "full", // Default to full width
    field_order: fieldOrder,
    options: [],
    validation: {},
    conditional_visibility: { enabled: false },
    calculated_config: { enabled: false },
    lookup_config: { enabled: false, dataSource: "static" },
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Helper function to validate field width
export const isValidFieldWidth = (width: string): width is FieldWidthKey => {
  return width in FIELD_WIDTH_CONFIG
}

// Helper function to normalize field width (handle legacy values)
export const normalizeFieldWidth = (width: string | undefined): FieldWidthKey => {
  if (!width) return "full"

  // Handle legacy width values
  const legacyMapping: Record<string, FieldWidthKey> = {
    quarter: "one_quarter",
    third: "one_third",
    half: "one_half",
    three_quarters: "three_quarters",
    full: "full",
  }

  // Check if it's a legacy value
  if (legacyMapping[width]) {
    return legacyMapping[width]
  }

  // Check if it's already a valid width
  if (isValidFieldWidth(width)) {
    return width
  }

  // Default to full width
  return "full"
}

// Helper function to calculate how many fields can fit in a row
export const calculateFieldsPerRow = (fields: FormField[]): number => {
  let totalWidth = 0
  let fieldsInCurrentRow = 0

  for (const field of fields) {
    const width = normalizeFieldWidth(field.width)
    const widthPercentage = Number.parseFloat(FIELD_WIDTH_CONFIG[width].percentage)

    if (totalWidth + widthPercentage > 100) {
      break
    }

    totalWidth += widthPercentage
    fieldsInCurrentRow++
  }

  return fieldsInCurrentRow
}

// Helper function to group fields by rows based on their widths
export const groupFieldsByRows = (fields: FormField[]): FormField[][] => {
  const rows: FormField[][] = []
  let currentRow: FormField[] = []
  let currentRowWidth = 0

  for (const field of fields) {
    const width = normalizeFieldWidth(field.width)
    const widthPercentage = Number.parseFloat(FIELD_WIDTH_CONFIG[width].percentage)

    // If adding this field would exceed 100% width, start a new row
    if (currentRowWidth + widthPercentage > 100 && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = [field]
      currentRowWidth = widthPercentage
    } else {
      currentRow.push(field)
      currentRowWidth += widthPercentage
    }
  }

  // Add the last row if it has fields
  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
}

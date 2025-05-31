import type { FormField } from "@/lib/form-types"
import type { FieldType } from "@/lib/database-types"
// Fix the import path to use relative path instead of alias
import {
  FIELD_WIDTH_CONFIG,
  type FieldWidthKey,
  getGridColClass,
  getWidthLabel,
  getTailwindWidthClass,
  getResponsiveWidthClasses,
  FIELD_WIDTH_OPTIONS,
  isValidFieldWidth,
} from "./form-width-utils"

// Re-export width utilities for external use
export {
  FIELD_WIDTH_CONFIG,
  type FieldWidthKey,
  getGridColClass,
  getWidthLabel,
  getTailwindWidthClass,
  getResponsiveWidthClasses,
  FIELD_WIDTH_OPTIONS,
  isValidFieldWidth,
}

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

// Generate unique IDs
export const generateFieldId = (): string => {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateSectionId = (): string => {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Field validation helpers
export const validateFieldConfiguration = (field: Partial<FormField>): string[] => {
  const errors: string[] = []

  if (!field.label?.trim()) {
    errors.push("Field label is required")
  }

  if (!field.field_type) {
    errors.push("Field type is required")
  }

  if (field.width && !isValidFieldWidth(field.width as FieldWidthKey)) {
    errors.push("Invalid field width")
  }

  return errors
}

// Form layout helpers
export const calculateFormLayout = (fields: FormField[]) => {
  const rows = groupFieldsByRows(fields)
  const totalFields = fields.length
  const totalRows = rows.length
  const averageFieldsPerRow = totalFields / totalRows

  return {
    rows,
    totalFields,
    totalRows,
    averageFieldsPerRow,
    isCompact: averageFieldsPerRow > 2,
  }
}

// Helper function to calculate how many fields can fit in a row
export const calculateFieldsPerRow = (fields: FormField[]): number => {
  let totalWidth = 0
  let fieldsInCurrentRow = 0

  for (const field of fields) {
    const width = (field.width as FieldWidthKey) || "full"
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
    const width = (field.width as FieldWidthKey) || "full"
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

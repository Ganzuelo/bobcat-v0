import type { FormStructure } from "@/lib/database-types"
import { validateFormSchema, type ValidationResult } from "@/lib/form-schema-validator"

// Define the clean exportable form schema type
export interface ExportableFormSchema {
  id: string
  name: string
  description?: string
  formType: "UAD_3_6" | "UAD_2_6" | "BPO" | "Other"
  pages: ExportablePage[]
}

export interface ExportablePage {
  id: string
  title: string
  description?: string
  page_order: number
  settings?: Record<string, any>
  sections: ExportableSection[]
}

export interface ExportableSection {
  id: string
  title: string
  description?: string
  section_order: number
  settings?: Record<string, any>
  fields: ExportableField[]
}

export interface ExportableField {
  id: string
  field_type: string
  label: string
  placeholder?: string
  help_text?: string
  required?: boolean
  width?: string
  field_order: number
  options?: Array<{
    label: string
    value: string
    disabled?: boolean
    metadata?: Record<string, any>
  }>
  validation?: Record<string, any>
  conditional_visibility?: Record<string, any>
  calculated_config?: Record<string, any>
  lookup_config?: Record<string, any>
  metadata?: Record<string, any>
}

// Export result types
export interface ExportSuccess {
  success: true
  data: ExportableFormSchema
  json: string
  blob: Blob
  errors: null
}

export interface ExportFailure {
  success: false
  data: null
  json: null
  blob: null
  errors: string[]
}

export type ExportResult = ExportSuccess | ExportFailure

// Properties to strip from internal objects (UI state, database metadata, etc.)
const UI_STATE_PROPERTIES = [
  // Form UI state
  "isSelected",
  "isEditing",
  "isDirty",
  "isExpanded",
  "isVisible",
  "editMode",
  "selectedFieldId",
  "selectedSectionId",
  "selectedPageId",
  "dragState",
  "dropZone",
  "isHovered",
  "isFocused",
  "isActive",
  "uiState",
  "editorState",
  "previewMode",

  // Database metadata
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "form_id",
  "page_id",
  "section_id",
  "version",
  "status",

  // Internal references
  "parentId",
  "childIds",
  "siblingIds",
  "depth",
  "index",
  "path",

  // Temporary state
  "tempId",
  "isNew",
  "isDeleted",
  "pendingChanges",
  "validationErrors",
  "lastModified",
  "syncStatus",
]

/**
 * Recursively removes UI state and volatile properties from an object
 */
function stripUIState<T extends Record<string, any>>(obj: T): Partial<T> {
  if (!obj || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => stripUIState(item)) as any
  }

  const cleaned: Partial<T> = {}

  for (const [key, value] of Object.entries(obj)) {
    // Skip UI state properties
    if (UI_STATE_PROPERTIES.includes(key)) {
      continue
    }

    // Skip undefined values
    if (value === undefined) {
      continue
    }

    // Skip null values for optional properties
    if (value === null && !["id", "name", "title", "label", "field_type", "formType"].includes(key)) {
      continue
    }

    // Skip empty strings for optional properties
    if (value === "" && !["name", "title", "label"].includes(key)) {
      continue
    }

    // Skip empty arrays for optional properties
    if (Array.isArray(value) && value.length === 0 && !["pages", "sections"].includes(key)) {
      continue
    }

    // Skip empty objects for optional properties
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null &&
      Object.keys(value).length === 0 &&
      !["validation", "settings", "metadata"].includes(key)
    ) {
      continue
    }

    // Recursively clean nested objects and arrays
    if (typeof value === "object" && value !== null) {
      const cleanedValue = stripUIState(value)
      if (Array.isArray(cleanedValue) ? cleanedValue.length > 0 : Object.keys(cleanedValue).length > 0) {
        cleaned[key as keyof T] = cleanedValue
      }
    } else {
      cleaned[key as keyof T] = value
    }
  }

  return cleaned
}

/**
 * Maps internal form type to exportable form type
 */
function mapFormType(internalType: string, settings?: Record<string, any>): "UAD_3_6" | "UAD_2_6" | "BPO" | "Other" {
  // Check if there's an original form type in settings
  if (settings?.originalFormType) {
    switch (settings.originalFormType) {
      case "uad_3_6":
        return "UAD_3_6"
      case "uad_2_6":
        return "UAD_2_6"
      case "bpo":
        return "BPO"
      default:
        return "Other"
    }
  }

  // Map based on internal form type
  switch (internalType) {
    case "urar":
      return "UAD_3_6" // Default URAR to UAD 3.6
    case "assessment":
      return "BPO"
    case "custom":
    default:
      return "Other"
  }
}

/**
 * Converts internal form structure to exportable format
 */
function convertToExportableFormat(formStructure: FormStructure): ExportableFormSchema {
  console.log("🔄 Converting internal form structure to exportable format...")

  const { form, pages } = formStructure

  // Clean and convert the form
  const exportableForm: ExportableFormSchema = {
    id: form.id,
    name: form.title,
    description: form.description || undefined,
    formType: mapFormType(form.form_type, form.settings),
    pages: pages.map((page, pageIndex) => {
      const exportablePage: ExportablePage = {
        id: page.id,
        title: page.title,
        description: page.description || undefined,
        page_order: page.page_order ?? pageIndex,
        settings: page.settings && Object.keys(page.settings).length > 0 ? page.settings : undefined,
        sections: (page.sections || []).map((section, sectionIndex) => {
          const exportableSection: ExportableSection = {
            id: section.id,
            title: section.title || "",
            description: section.description || undefined,
            section_order: section.section_order ?? sectionIndex,
            settings: section.settings && Object.keys(section.settings).length > 0 ? section.settings : undefined,
            fields: (section.fields || []).map((field, fieldIndex) => {
              const exportableField: ExportableField = {
                id: field.id,
                field_type: field.field_type,
                label: field.label,
                placeholder: field.placeholder || undefined,
                help_text: field.help_text || undefined,
                required: field.required || undefined,
                width: field.width || undefined,
                field_order: field.field_order ?? fieldIndex,
              }

              // Add optional properties only if they have meaningful values
              if (field.options && field.options.length > 0) {
                exportableField.options = field.options.map((option) => ({
                  label: option.label,
                  value: option.value,
                  disabled: option.disabled || undefined,
                  metadata: option.metadata && Object.keys(option.metadata).length > 0 ? option.metadata : undefined,
                }))
              }

              if (field.validation && Object.keys(field.validation).length > 0) {
                exportableField.validation = field.validation
              }

              if (field.conditional_visibility && Object.keys(field.conditional_visibility).length > 0) {
                exportableField.conditional_visibility = field.conditional_visibility
              }

              if (field.calculated_config && Object.keys(field.calculated_config).length > 0) {
                exportableField.calculated_config = field.calculated_config
              }

              if (field.lookup_config && Object.keys(field.lookup_config).length > 0) {
                exportableField.lookup_config = field.lookup_config
              }

              if (field.metadata && Object.keys(field.metadata).length > 0) {
                exportableField.metadata = field.metadata
              }

              return exportableField
            }),
          }

          return exportableSection
        }),
      }

      return exportablePage
    }),
  }

  console.log("✅ Conversion to exportable format complete")
  return exportableForm
}

/**
 * Creates a downloadable blob from JSON data
 */
function createDownloadableBlob(jsonString: string): Blob {
  return new Blob([jsonString], {
    type: "application/json;charset=utf-8",
  })
}

/**
 * Main export function that converts internal form to clean, validated export format
 */
export function buildExportableForm(formStructure: FormStructure): ExportResult {
  console.log("📤 Starting form export process...")

  try {
    // Step 1: Convert to exportable format
    const exportableForm = convertToExportableFormat(formStructure)

    // Step 2: Strip UI state and volatile properties
    console.log("🧹 Stripping UI state and volatile properties...")
    const cleanedForm = stripUIState(exportableForm) as ExportableFormSchema

    // Step 3: Validate the cleaned form
    console.log("🔍 Validating cleaned form structure...")
    const validationResult: ValidationResult = validateFormSchema(cleanedForm)

    if (!validationResult.valid) {
      console.error("❌ Form validation failed:", validationResult.errors)
      return {
        success: false,
        data: null,
        json: null,
        blob: null,
        errors: validationResult.errors || ["Unknown validation error"],
      }
    }

    // Step 4: Create JSON string and blob
    console.log("📝 Creating JSON string and downloadable blob...")
    const jsonString = JSON.stringify(validationResult.data, null, 2)
    const blob = createDownloadableBlob(jsonString)

    console.log("✅ Form export successful")
    return {
      success: true,
      data: validationResult.data,
      json: jsonString,
      blob,
      errors: null,
    }
  } catch (error) {
    console.error("❌ Unexpected error during form export:", error)
    return {
      success: false,
      data: null,
      json: null,
      blob: null,
      errors: [`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`],
    }
  }
}

/**
 * Helper function to generate a filename for the exported form
 */
export function generateExportFilename(formName: string): string {
  const sanitizedName = formName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")
  return `form-${sanitizedName}-${timestamp}.json`
}

/**
 * Helper function to trigger download of the exported form
 */
export function downloadExportedForm(exportResult: ExportSuccess, filename?: string): void {
  if (!exportResult.success || !exportResult.blob) {
    throw new Error("Invalid export result for download")
  }

  const url = URL.createObjectURL(exportResult.blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename || generateExportFilename(exportResult.data.name)

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the object URL
  URL.revokeObjectURL(url)
}

import { z } from "zod"
import type { FormStructure, FormPage, FormSection, FormField } from "@/lib/database-types"

// Enhanced validation schemas
const EnhancedFieldSchema = z.object({
  id: z.string().min(1, "Field ID is required"),
  field_type: z.string().min(1, "Field must have a field_type"),
  label: z.string().min(1, "Field must have a label"),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  required: z.boolean().optional(),
  width: z.string().optional(),
  field_order: z.number().int().min(0).optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        disabled: z.boolean().optional(),
      }),
    )
    .optional(),
  validation: z.record(z.any()).optional(), // Ensure it's an object, not array
  conditional_visibility: z.record(z.any()).optional(),
  calculated_config: z.record(z.any()).optional(),
  lookup_config: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

const EnhancedSectionSchema = z.object({
  id: z.string().min(1, "Section ID is required"),
  title: z.string().min(1, "Section must have a title"),
  description: z.string().optional(),
  section_order: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional(),
  fields: z.array(EnhancedFieldSchema).optional().default([]),
})

const EnhancedPageSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
  title: z.string().min(1, "Page must have a title"),
  description: z.string().optional(),
  page_order: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional(),
  sections: z.array(EnhancedSectionSchema).min(1, "Page must have at least one section"),
})

export const EnhancedImportFormSchema = z.object({
  id: z.string().min(1, "Form ID is required"),
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
  formType: z.enum(["UAD_3_6", "UAD_2_6", "BPO", "Other"], {
    errorMap: () => ({ message: "Form type must be one of: UAD_3_6, UAD_2_6, BPO, Other" }),
  }),
  pages: z.array(EnhancedPageSchema).min(1, "Form must have at least one page"),
})

export type ValidatedImportForm = z.infer<typeof EnhancedImportFormSchema>

// Import modes
export enum ImportMode {
  OVERWRITE = "overwrite",
  APPEND_SECTIONS = "append_sections",
  REPLACE_MATCHING_SECTIONS = "replace_matching_sections",
}

// Conflict types
export interface ImportConflict {
  type: "duplicate_section" | "duplicate_field" | "page_mismatch"
  pageId?: string
  sectionId?: string
  fieldId?: string
  message: string
  suggestedAction: "rename" | "skip" | "overwrite"
}

// Import analysis result
export interface ImportAnalysis {
  isValid: boolean
  errors: string[]
  conflicts: ImportConflict[]
  summary: {
    newPages: number
    newSections: number
    replacedSections: number
    totalFields: number
  }
  canProceed: boolean
}

// Enhanced validation function
export function validateEnhancedImportForm(jsonData: unknown): {
  success: boolean
  data?: ValidatedImportForm
  errors: string[]
} {
  console.log("🔍 Starting enhanced form validation...")

  if (!jsonData || typeof jsonData !== "object") {
    return {
      success: false,
      errors: ["Import failed: file does not contain a valid JSON object"],
    }
  }

  const data = jsonData as Record<string, unknown>

  // Check for required top-level keys
  const requiredKeys = ["id", "name", "formType", "pages"]
  const missingKeys = requiredKeys.filter((key) => !(key in data))

  if (missingKeys.length > 0) {
    return {
      success: false,
      errors: missingKeys.map((key) => `Import failed: missing required property '${key}'`),
    }
  }

  // Validate with Zod schema
  const result = EnhancedImportFormSchema.safeParse(data)

  if (!result.success) {
    console.error("❌ Validation errors:", result.error)

    const errors = result.error.errors.map((error) => {
      const path = error.path.join(".")
      return `Import failed: ${path ? `${path} - ` : ""}${error.message}`
    })

    return {
      success: false,
      errors,
    }
  }

  // Additional validation for validation objects (not arrays)
  const validationErrors: string[] = []

  result.data.pages.forEach((page, pageIndex) => {
    page.sections?.forEach((section, sectionIndex) => {
      section.fields?.forEach((field, fieldIndex) => {
        if (field.validation && Array.isArray(field.validation)) {
          validationErrors.push(
            `Import failed: page ${pageIndex + 1}, section ${sectionIndex + 1}, field ${fieldIndex + 1} - validation must be an object, not an array`,
          )
        }
      })
    })
  })

  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors,
    }
  }

  console.log("✅ Enhanced validation successful")
  return {
    success: true,
    data: result.data,
    errors: [],
  }
}

// Analyze import for conflicts and compatibility
export function analyzeImport(
  importData: ValidatedImportForm,
  existingForm: FormStructure | null,
  mode: ImportMode,
): ImportAnalysis {
  const conflicts: ImportConflict[] = []
  const summary = {
    newPages: 0,
    newSections: 0,
    replacedSections: 0,
    totalFields: 0,
  }

  // Count total fields
  importData.pages.forEach((page) => {
    page.sections?.forEach((section) => {
      summary.totalFields += section.fields?.length || 0
    })
  })

  if (!existingForm) {
    // No existing form, everything is new
    summary.newPages = importData.pages.length
    summary.newSections = importData.pages.reduce((acc, page) => acc + (page.sections?.length || 0), 0)

    return {
      isValid: true,
      errors: [],
      conflicts: [],
      summary,
      canProceed: true,
    }
  }

  // Check for conflicts based on import mode
  if (mode === ImportMode.OVERWRITE) {
    // No conflicts for overwrite mode
    return {
      isValid: true,
      errors: [],
      conflicts: [],
      summary: {
        newPages: importData.pages.length,
        newSections: importData.pages.reduce((acc, page) => acc + (page.sections?.length || 0), 0),
        replacedSections: 0,
        totalFields: summary.totalFields,
      },
      canProceed: true,
    }
  }

  // Analyze page and section conflicts
  importData.pages.forEach((importPage) => {
    const existingPage = existingForm.pages.find((p) => p.id === importPage.id)

    if (!existingPage) {
      summary.newPages++
      summary.newSections += importPage.sections?.length || 0
    } else {
      // Page exists, check sections
      importPage.sections?.forEach((importSection) => {
        const existingSection = existingPage.sections?.find((s) => s.id === importSection.id)

        if (!existingSection) {
          summary.newSections++
        } else {
          // Section exists
          if (mode === ImportMode.APPEND_SECTIONS) {
            conflicts.push({
              type: "duplicate_section",
              pageId: importPage.id,
              sectionId: importSection.id,
              message: `Section "${importSection.title}" already exists in page "${importPage.title}"`,
              suggestedAction: "skip",
            })
          } else if (mode === ImportMode.REPLACE_MATCHING_SECTIONS) {
            summary.replacedSections++

            // Check for field ID conflicts within the section
            const existingFieldIds = new Set(existingSection.fields?.map((f) => f.id) || [])
            const importFieldIds = new Set(importSection.fields?.map((f) => f.id) || [])

            importSection.fields?.forEach((field) => {
              if (existingFieldIds.has(field.id)) {
                // This is expected in replace mode, not a conflict
              }
            })
          }
        }
      })
    }
  })

  const canProceed = conflicts.length === 0 || conflicts.every((c) => c.suggestedAction !== "rename")

  return {
    isValid: true,
    errors: [],
    conflicts,
    summary,
    canProceed,
  }
}

// Merge imported form with existing form
export function mergeFormStructures(
  importData: ValidatedImportForm,
  existingForm: FormStructure | null,
  mode: ImportMode,
  conflictResolutions: Record<string, "skip" | "overwrite" | "rename"> = {},
): FormStructure {
  if (!existingForm || mode === ImportMode.OVERWRITE) {
    // Convert import data to FormStructure
    return convertImportToFormStructure(importData)
  }

  const mergedForm: FormStructure = {
    form: {
      ...existingForm.form,
      title: importData.name,
      form_type: importData.formType.toLowerCase(),
      description: importData.description || existingForm.form.description,
      updated_at: new Date().toISOString(),
    },
    pages: [...existingForm.pages],
    rules: existingForm.rules || [],
  }

  // Process each imported page
  importData.pages.forEach((importPage, pageIndex) => {
    const existingPageIndex = mergedForm.pages.findIndex((p) => p.id === importPage.id)

    if (existingPageIndex === -1) {
      // New page, add it
      const newPage: FormPage & { sections: (FormSection & { fields: FormField[] })[] } = {
        id: importPage.id,
        form_id: mergedForm.form.id,
        title: importPage.title,
        description: importPage.description || "",
        page_order: mergedForm.pages.length + 1,
        settings: importPage.settings || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sections:
          importPage.sections?.map((section, sectionIndex) => ({
            id: section.id,
            page_id: importPage.id,
            title: section.title,
            description: section.description || "",
            section_order: sectionIndex + 1,
            settings: section.settings || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            fields:
              section.fields?.map((field, fieldIndex) => ({
                id: field.id,
                section_id: section.id,
                field_type: field.field_type,
                label: field.label,
                placeholder: field.placeholder || "",
                help_text: field.help_text || "",
                required: field.required || false,
                width: field.width || "full",
                field_order: fieldIndex + 1,
                options: field.options || [],
                validation: field.validation || {},
                conditional_visibility: field.conditional_visibility || {},
                calculated_config: field.calculated_config || {},
                lookup_config: field.lookup_config || {},
                metadata: field.metadata || {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })) || [],
          })) || [],
      }
      mergedForm.pages.push(newPage)
    } else {
      // Page exists, merge sections
      const existingPage = mergedForm.pages[existingPageIndex]

      importPage.sections?.forEach((importSection, sectionIndex) => {
        const existingSectionIndex = existingPage.sections?.findIndex((s) => s.id === importSection.id) ?? -1

        if (existingSectionIndex === -1) {
          // New section, add it
          const newSection: FormSection & { fields: FormField[] } = {
            id: importSection.id,
            page_id: importPage.id,
            title: importSection.title,
            description: importSection.description || "",
            section_order: (existingPage.sections?.length || 0) + 1,
            settings: importSection.settings || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            fields:
              importSection.fields?.map((field, fieldIndex) => ({
                id: field.id,
                section_id: importSection.id,
                field_type: field.field_type,
                label: field.label,
                placeholder: field.placeholder || "",
                help_text: field.help_text || "",
                required: field.required || false,
                width: field.width || "full",
                field_order: fieldIndex + 1,
                options: field.options || [],
                validation: field.validation || {},
                conditional_visibility: field.conditional_visibility || {},
                calculated_config: field.calculated_config || {},
                lookup_config: field.lookup_config || {},
                metadata: field.metadata || {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })) || [],
          }

          if (!existingPage.sections) {
            existingPage.sections = []
          }
          existingPage.sections.push(newSection)
        } else {
          // Section exists
          const conflictKey = `${importPage.id}-${importSection.id}`
          const resolution = conflictResolutions[conflictKey]

          if (mode === ImportMode.REPLACE_MATCHING_SECTIONS || resolution === "overwrite") {
            // Replace the section
            existingPage.sections![existingSectionIndex] = {
              id: importSection.id,
              page_id: importPage.id,
              title: importSection.title,
              description: importSection.description || "",
              section_order: existingPage.sections![existingSectionIndex].section_order,
              settings: importSection.settings || {},
              created_at: existingPage.sections![existingSectionIndex].created_at,
              updated_at: new Date().toISOString(),
              fields:
                importSection.fields?.map((field, fieldIndex) => ({
                  id: field.id,
                  section_id: importSection.id,
                  field_type: field.field_type,
                  label: field.label,
                  placeholder: field.placeholder || "",
                  help_text: field.help_text || "",
                  required: field.required || false,
                  width: field.width || "full",
                  field_order: fieldIndex + 1,
                  options: field.options || [],
                  validation: field.validation || {},
                  conditional_visibility: field.conditional_visibility || {},
                  calculated_config: field.calculated_config || {},
                  lookup_config: field.lookup_config || {},
                  metadata: field.metadata || {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })) || [],
            }
          }
          // If mode is APPEND_SECTIONS and no resolution, skip (do nothing)
        }
      })
    }
  })

  return mergedForm
}

// Convert import format to FormStructure
function convertImportToFormStructure(importData: ValidatedImportForm): FormStructure {
  const currentTime = new Date().toISOString()

  return {
    form: {
      id: importData.id,
      title: importData.name,
      description: importData.description || "",
      form_type: importData.formType.toLowerCase(),
      version: 1,
      status: "draft",
      created_by: "",
      tags: [],
      settings: {},
      metadata: {},
      created_at: currentTime,
      updated_at: currentTime,
    },
    pages: importData.pages.map((page, pageIndex) => ({
      id: page.id,
      form_id: importData.id,
      title: page.title,
      description: page.description || "",
      page_order: pageIndex + 1,
      settings: page.settings || {},
      created_at: currentTime,
      updated_at: currentTime,
      sections:
        page.sections?.map((section, sectionIndex) => ({
          id: section.id,
          page_id: page.id,
          title: section.title,
          description: section.description || "",
          section_order: sectionIndex + 1,
          settings: section.settings || {},
          created_at: currentTime,
          updated_at: currentTime,
          fields:
            section.fields?.map((field, fieldIndex) => ({
              id: field.id,
              section_id: section.id,
              field_type: field.field_type,
              label: field.label,
              placeholder: field.placeholder || "",
              help_text: field.help_text || "",
              required: field.required || false,
              width: field.width || "full",
              field_order: fieldIndex + 1,
              options: field.options || [],
              validation: field.validation || {},
              conditional_visibility: field.conditional_visibility || {},
              calculated_config: field.calculated_config || {},
              lookup_config: field.lookup_config || {},
              metadata: field.metadata || {},
              created_at: currentTime,
              updated_at: currentTime,
            })) || [],
        })) || [],
    })),
    rules: [],
  }
}

// Helper function to format validation errors for display
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 1) {
    return errors[0]
  }

  return `Multiple validation errors:\n${errors.map((error, index) => `${index + 1}. ${error}`).join("\n")}`
}

// Export all the functions that are used by other modules
export { convertImportToFormStructure }

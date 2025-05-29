import { z } from "zod"
import type { FormStructure } from "@/lib/database-types"
import { v4 as uuidv4 } from "uuid"

// Flexible field schema for modular imports
const ModularFieldSchema = z.object({
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
  validation: z.record(z.any()).optional(),
  conditional_visibility: z.record(z.any()).optional(),
  calculated_config: z.record(z.any()).optional(),
  lookup_config: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// Flexible section schema for modular imports
const ModularSectionSchema = z.object({
  id: z.string().min(1, "Section ID is required"),
  title: z.string().min(1, "Section must have a title"),
  description: z.string().optional(),
  section_order: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional(),
  fields: z.array(ModularFieldSchema).optional().default([]),
})

// Flexible page schema for modular imports
const ModularPageSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
  title: z.string().min(1, "Page must have a title"),
  description: z.string().optional(),
  page_order: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional(),
  sections: z.array(ModularSectionSchema).min(1, "Page must have at least one section"),
})

// Full form schema (existing)
const FullFormSchema = z.object({
  id: z.string().min(1, "Form ID is required"),
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
  formType: z.enum(["UAD_3_6", "UAD_2_6", "BPO", "Other"], {
    errorMap: () => ({ message: "Form type must be one of: UAD_3_6, UAD_2_6, BPO, Other" }),
  }),
  pages: z.array(ModularPageSchema).min(1, "Form must have at least one page"),
})

// Modular import schemas
const PagesOnlySchema = z.object({
  pages: z.array(ModularPageSchema).min(1, "Must have at least one page"),
})

const SectionsOnlySchema = z.object({
  sections: z.array(ModularSectionSchema).min(1, "Must have at least one section"),
})

const SingleSectionSchema = ModularSectionSchema

// Import types
export enum ImportType {
  FULL_FORM = "full_form",
  PAGES_ONLY = "pages_only",
  SECTIONS_ONLY = "sections_only",
  SINGLE_SECTION = "single_section",
}

export enum ImportMode {
  OVERWRITE = "overwrite",
  APPEND_SECTIONS = "append_sections",
  REPLACE_MATCHING_SECTIONS = "replace_matching_sections",
}

// Import data types
export interface FullFormImport {
  type: ImportType.FULL_FORM
  data: z.infer<typeof FullFormSchema>
}

export interface PagesOnlyImport {
  type: ImportType.PAGES_ONLY
  data: z.infer<typeof PagesOnlySchema>
}

export interface SectionsOnlyImport {
  type: ImportType.SECTIONS_ONLY
  data: z.infer<typeof SectionsOnlySchema>
}

export interface SingleSectionImport {
  type: ImportType.SINGLE_SECTION
  data: z.infer<typeof SingleSectionSchema>
}

export type ModularImportData = FullFormImport | PagesOnlyImport | SectionsOnlyImport | SingleSectionImport

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
export interface ModularImportAnalysis {
  isValid: boolean
  errors: string[]
  conflicts: ImportConflict[]
  importType: ImportType
  summary: {
    newPages: number
    newSections: number
    replacedSections: number
    totalFields: number
  }
  canProceed: boolean
  requiresTargetPage?: boolean // For sections-only imports
}

// Main validation function for modular imports
export function validateModularImport(jsonData: unknown): {
  success: boolean
  data?: ModularImportData
  errors: string[]
} {
  console.log("🔍 Starting modular import validation...")

  if (!jsonData || typeof jsonData !== "object") {
    return {
      success: false,
      errors: ["Import failed: file does not contain a valid JSON object"],
    }
  }

  const data = jsonData as Record<string, unknown>

  // Determine import type and validate accordingly
  if (data.id && data.name && data.formType && data.pages) {
    // Full form import
    console.log("📋 Detected full form import")
    const result = FullFormSchema.safeParse(data)
    if (result.success) {
      return {
        success: true,
        data: { type: ImportType.FULL_FORM, data: result.data },
        errors: [],
      }
    } else {
      return {
        success: false,
        errors: result.error.errors.map((error) => `Full form validation: ${error.path.join(".")} - ${error.message}`),
      }
    }
  } else if (data.pages && Array.isArray(data.pages)) {
    // Pages-only import
    console.log("📄 Detected pages-only import")
    const result = PagesOnlySchema.safeParse(data)
    if (result.success) {
      return {
        success: true,
        data: { type: ImportType.PAGES_ONLY, data: result.data },
        errors: [],
      }
    } else {
      return {
        success: false,
        errors: result.error.errors.map((error) => `Pages validation: ${error.path.join(".")} - ${error.message}`),
      }
    }
  } else if (data.sections && Array.isArray(data.sections)) {
    // Sections-only import
    console.log("📑 Detected sections-only import")
    const result = SectionsOnlySchema.safeParse(data)
    if (result.success) {
      return {
        success: true,
        data: { type: ImportType.SECTIONS_ONLY, data: result.data },
        errors: [],
      }
    } else {
      return {
        success: false,
        errors: result.error.errors.map((error) => `Sections validation: ${error.path.join(".")} - ${error.message}`),
      }
    }
  } else if (data.id && data.title && data.fields) {
    // Single section import
    console.log("📝 Detected single section import")
    const result = SingleSectionSchema.safeParse(data)
    if (result.success) {
      return {
        success: true,
        data: { type: ImportType.SINGLE_SECTION, data: result.data },
        errors: [],
      }
    } else {
      return {
        success: false,
        errors: result.error.errors.map((error) => `Section validation: ${error.path.join(".")} - ${error.message}`),
      }
    }
  } else {
    return {
      success: false,
      errors: [
        "Import failed: Unable to determine import type. Expected one of:",
        "• Full form: { id, name, formType, pages }",
        "• Pages only: { pages }",
        "• Sections only: { sections }",
        "• Single section: { id, title, fields }",
      ],
    }
  }
}

// Analyze modular import for conflicts and compatibility
export function analyzeModularImport(
  importData: ModularImportData,
  existingForm: FormStructure | null,
  mode: ImportMode,
): ModularImportAnalysis {
  const conflicts: ImportConflict[] = []
  const summary = {
    newPages: 0,
    newSections: 0,
    replacedSections: 0,
    totalFields: 0,
  }

  // Convert import data to normalized format for analysis
  const normalizedData = normalizeImportData(importData)

  // Count total fields
  normalizedData.pages.forEach((page) => {
    page.sections?.forEach((section) => {
      summary.totalFields += section.fields?.length || 0
    })
  })

  if (!existingForm) {
    // No existing form, everything is new
    summary.newPages = normalizedData.pages.length
    summary.newSections = normalizedData.pages.reduce((acc, page) => acc + (page.sections?.length || 0), 0)

    return {
      isValid: true,
      errors: [],
      conflicts: [],
      importType: importData.type,
      summary,
      canProceed: true,
      requiresTargetPage: importData.type === ImportType.SECTIONS_ONLY || importData.type === ImportType.SINGLE_SECTION,
    }
  }

  // Check for conflicts based on import mode
  if (mode === ImportMode.OVERWRITE && importData.type === ImportType.FULL_FORM) {
    // No conflicts for full form overwrite
    return {
      isValid: true,
      errors: [],
      conflicts: [],
      importType: importData.type,
      summary: {
        newPages: normalizedData.pages.length,
        newSections: normalizedData.pages.reduce((acc, page) => acc + (page.sections?.length || 0), 0),
        replacedSections: 0,
        totalFields: summary.totalFields,
      },
      canProceed: true,
    }
  }

  // Analyze page and section conflicts
  normalizedData.pages.forEach((importPage) => {
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
    importType: importData.type,
    summary,
    canProceed,
    requiresTargetPage: importData.type === ImportType.SECTIONS_ONLY || importData.type === ImportType.SINGLE_SECTION,
  }
}

// Normalize import data to a consistent format
function normalizeImportData(importData: ModularImportData): { pages: any[] } {
  switch (importData.type) {
    case ImportType.FULL_FORM:
      return { pages: importData.data.pages }

    case ImportType.PAGES_ONLY:
      return { pages: importData.data.pages }

    case ImportType.SECTIONS_ONLY:
      // Create a default page for sections
      return {
        pages: [
          {
            id: `page-${uuidv4()}`,
            title: "Imported Sections",
            description: "Page created for imported sections",
            page_order: 1,
            sections: importData.data.sections,
          },
        ],
      }

    case ImportType.SINGLE_SECTION:
      // Create a default page for the single section
      return {
        pages: [
          {
            id: `page-${uuidv4()}`,
            title: "Imported Section",
            description: "Page created for imported section",
            page_order: 1,
            sections: [importData.data],
          },
        ],
      }

    default:
      return { pages: [] }
  }
}

// Merge modular import with existing form
export function mergeModularImport(
  importData: ModularImportData,
  existingForm: FormStructure | null,
  mode: ImportMode,
  targetPageId?: string,
  conflictResolutions: Record<string, "skip" | "overwrite" | "rename"> = {},
): FormStructure {
  if (!existingForm || (mode === ImportMode.OVERWRITE && importData.type === ImportType.FULL_FORM)) {
    // Convert import data to FormStructure
    return convertModularImportToFormStructure(importData)
  }

  const mergedForm: FormStructure = {
    form: {
      ...existingForm.form,
      updated_at: new Date().toISOString(),
    },
    pages: [...existingForm.pages],
    rules: existingForm.rules || [],
  }

  // Handle different import types
  switch (importData.type) {
    case ImportType.FULL_FORM:
      // Update form metadata
      mergedForm.form.title = importData.data.name
      mergedForm.form.form_type = importData.data.formType.toLowerCase()
      mergedForm.form.description = importData.data.description || mergedForm.form.description
      // Process pages normally
      processPages(importData.data.pages, mergedForm, mode, conflictResolutions)
      break

    case ImportType.PAGES_ONLY:
      processPages(importData.data.pages, mergedForm, mode, conflictResolutions)
      break

    case ImportType.SECTIONS_ONLY:
      processSections(importData.data.sections, mergedForm, targetPageId, mode, conflictResolutions)
      break

    case ImportType.SINGLE_SECTION:
      processSections([importData.data], mergedForm, targetPageId, mode, conflictResolutions)
      break
  }

  return mergedForm
}

// Process pages for merging
function processPages(
  importPages: any[],
  mergedForm: FormStructure,
  mode: ImportMode,
  conflictResolutions: Record<string, "skip" | "overwrite" | "rename">,
) {
  importPages.forEach((importPage) => {
    const existingPageIndex = mergedForm.pages.findIndex((p) => p.id === importPage.id)

    if (existingPageIndex === -1) {
      // New page, add it
      const newPage = createFormPage(importPage, mergedForm.form.id, mergedForm.pages.length + 1)
      mergedForm.pages.push(newPage)
    } else {
      // Page exists, merge sections
      const existingPage = mergedForm.pages[existingPageIndex]
      processSectionsInPage(importPage.sections || [], existingPage, mode, conflictResolutions)
    }
  })
}

// Process sections for merging
function processSections(
  importSections: any[],
  mergedForm: FormStructure,
  targetPageId: string | undefined,
  mode: ImportMode,
  conflictResolutions: Record<string, "skip" | "overwrite" | "rename">,
) {
  let targetPage: any

  if (targetPageId) {
    targetPage = mergedForm.pages.find((p) => p.id === targetPageId)
  }

  if (!targetPage) {
    // Create a new page for the sections
    targetPage = createFormPage(
      {
        id: `page-${uuidv4()}`,
        title: "Imported Sections",
        description: "Page created for imported sections",
        sections: importSections,
      },
      mergedForm.form.id,
      mergedForm.pages.length + 1,
    )
    mergedForm.pages.push(targetPage)
  } else {
    // Add sections to existing page
    processSectionsInPage(importSections, targetPage, mode, conflictResolutions)
  }
}

// Process sections within a page
function processSectionsInPage(
  importSections: any[],
  targetPage: any,
  mode: ImportMode,
  conflictResolutions: Record<string, "skip" | "overwrite" | "rename">,
) {
  importSections.forEach((importSection) => {
    const existingSectionIndex = targetPage.sections?.findIndex((s: any) => s.id === importSection.id) ?? -1

    if (existingSectionIndex === -1) {
      // New section, add it
      const newSection = createFormSection(importSection, targetPage.id, (targetPage.sections?.length || 0) + 1)
      if (!targetPage.sections) {
        targetPage.sections = []
      }
      targetPage.sections.push(newSection)
    } else {
      // Section exists
      const conflictKey = `${targetPage.id}-${importSection.id}`
      const resolution = conflictResolutions[conflictKey]

      if (mode === ImportMode.REPLACE_MATCHING_SECTIONS || resolution === "overwrite") {
        // Replace the section
        targetPage.sections[existingSectionIndex] = createFormSection(
          importSection,
          targetPage.id,
          targetPage.sections[existingSectionIndex].section_order,
        )
      }
      // If mode is APPEND_SECTIONS and no resolution, skip (do nothing)
    }
  })
}

// Helper functions to create form structures
function createFormPage(pageData: any, formId: string, pageOrder: number): any {
  const currentTime = new Date().toISOString()
  return {
    id: pageData.id,
    form_id: formId,
    title: pageData.title,
    description: pageData.description || "",
    page_order: pageOrder,
    settings: pageData.settings || {},
    created_at: currentTime,
    updated_at: currentTime,
    sections:
      pageData.sections?.map((section: any, sectionIndex: number) =>
        createFormSection(section, pageData.id, sectionIndex + 1),
      ) || [],
  }
}

function createFormSection(sectionData: any, pageId: string, sectionOrder: number): any {
  const currentTime = new Date().toISOString()
  return {
    id: sectionData.id,
    page_id: pageId,
    title: sectionData.title,
    description: sectionData.description || "",
    section_order: sectionOrder,
    settings: sectionData.settings || {},
    created_at: currentTime,
    updated_at: currentTime,
    fields:
      sectionData.fields?.map((field: any, fieldIndex: number) =>
        createFormField(field, sectionData.id, fieldIndex + 1),
      ) || [],
  }
}

function createFormField(fieldData: any, sectionId: string, fieldOrder: number): any {
  const currentTime = new Date().toISOString()
  return {
    id: fieldData.id,
    section_id: sectionId,
    field_type: fieldData.field_type,
    label: fieldData.label,
    placeholder: fieldData.placeholder || "",
    help_text: fieldData.help_text || "",
    required: fieldData.required || false,
    width: fieldData.width || "full",
    field_order: fieldOrder,
    options: fieldData.options || [],
    validation: fieldData.validation || {},
    conditional_visibility: fieldData.conditional_visibility || {},
    calculated_config: fieldData.calculated_config || {},
    lookup_config: fieldData.lookup_config || {},
    metadata: fieldData.metadata || {},
    created_at: currentTime,
    updated_at: currentTime,
  }
}

// Convert modular import to FormStructure
function convertModularImportToFormStructure(importData: ModularImportData): FormStructure {
  const currentTime = new Date().toISOString()

  // Generate default form metadata for non-full-form imports
  let formMetadata = {
    id: uuidv4(),
    title: "Imported Form",
    description: "",
    form_type: "other",
    version: 1,
    status: "draft" as const,
    created_by: "",
    tags: [],
    settings: {},
    metadata: {},
    created_at: currentTime,
    updated_at: currentTime,
  }

  // Override with actual form data if it's a full form import
  if (importData.type === ImportType.FULL_FORM) {
    formMetadata = {
      ...formMetadata,
      id: importData.data.id,
      title: importData.data.name,
      description: importData.data.description || "",
      form_type: importData.data.formType.toLowerCase(),
    }
  }

  const normalizedData = normalizeImportData(importData)

  return {
    form: formMetadata,
    pages: normalizedData.pages.map((page, pageIndex) => createFormPage(page, formMetadata.id, pageIndex + 1)),
    rules: [],
  }
}

// Helper function to format validation errors for display
export function formatModularValidationErrors(errors: string[]): string {
  if (errors.length === 1) {
    return errors[0]
  }

  return `Multiple validation errors:\n${errors.map((error, index) => `${index + 1}. ${error}`).join("\n")}`
}

// Get import type description for UI
export function getImportTypeDescription(importType: ImportType): string {
  switch (importType) {
    case ImportType.FULL_FORM:
      return "Complete form with metadata, pages, and sections"
    case ImportType.PAGES_ONLY:
      return "One or more pages with their sections"
    case ImportType.SECTIONS_ONLY:
      return "One or more sections to add to a page"
    case ImportType.SINGLE_SECTION:
      return "A single section to add to a page"
    default:
      return "Unknown import type"
  }
}

import { z } from "zod"

// Enhanced validation schemas with detailed error messages
const FieldSchema = z.object({
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

const SectionSchema = z.object({
  id: z.string().min(1, "Section ID is required"),
  title: z.string().min(1, "Section must have a title"),
  description: z.string().optional(),
  section_order: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional(),
  fields: z.array(FieldSchema).optional().default([]),
})

const PageSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
  title: z.string().min(1, "Page must have a title"),
  description: z.string().optional(),
  page_order: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional(),
  sections: z.array(SectionSchema).min(1, "Page must have at least one section"),
})

export const EnhancedImportFormSchema = z.object({
  id: z.string().min(1, "Form ID is required"),
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
  formType: z.enum(["UAD_3_6", "UAD_2_6", "BPO", "Other"], {
    errorMap: () => ({ message: "Form type must be one of: UAD_3_6, UAD_2_6, BPO, Other" }),
  }),
  pages: z.array(PageSchema).min(1, "Form must have at least one page"),
})

export type ValidatedImportForm = z.infer<typeof EnhancedImportFormSchema>

// Validation result type
export interface ValidationResult {
  success: boolean
  data?: ValidatedImportForm
  errors: string[]
}

// Enhanced validation function with detailed error reporting
export function validateImportForm(jsonData: unknown): ValidationResult {
  console.log("🔍 Starting form validation...")
  console.log("📋 Input data structure:", JSON.stringify(jsonData, null, 2))

  // Check if it's an object
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

  // Log the pages structure for debugging
  console.log("📄 Pages structure:", JSON.stringify(data.pages, null, 2))

  // Validate with Zod schema
  const result = EnhancedImportFormSchema.safeParse(data)

  if (!result.success) {
    console.error("❌ Validation errors:", result.error)

    const errors = result.error.errors.map((error) => {
      const path = error.path.join(".")
      console.log(`❌ Validation error at ${path}:`, error.message)
      console.log(`❌ Received value:`, error.received)
      console.log(`❌ Expected:`, error.expected)
      return `Import failed: ${path ? `${path} - ` : ""}${error.message}`
    })

    return {
      success: false,
      errors,
    }
  }

  // Additional structural validation
  const structuralErrors: string[] = []

  // Validate pages structure
  if (result.data.pages.length === 0) {
    structuralErrors.push("Import failed: form must have at least one page")
  }

  // Validate each page has sections
  result.data.pages.forEach((page, pageIndex) => {
    if (!page.sections || page.sections.length === 0) {
      structuralErrors.push(`Import failed: page ${pageIndex + 1} ('${page.title}') must have at least one section`)
    }

    // Validate section structure
    page.sections?.forEach((section, sectionIndex) => {
      if (typeof section === "string") {
        structuralErrors.push(
          `Import failed: page ${pageIndex + 1} section ${sectionIndex + 1} is a string ID but should be a section object with title, description, etc.`,
        )
      }
    })
  })

  if (structuralErrors.length > 0) {
    return {
      success: false,
      errors: structuralErrors,
    }
  }

  console.log("✅ Validation successful")
  return {
    success: true,
    data: result.data,
    errors: [],
  }
}

// Helper function to format validation errors for display
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 1) {
    return errors[0]
  }

  return `Multiple validation errors:\n${errors.map((error, index) => `${index + 1}. ${error}`).join("\n")}`
}

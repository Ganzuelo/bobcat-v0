import type { FormStructure } from "@/lib/database-types"
import { z } from "zod"

// Schema for validating imported form JSON - this should match the validation schema
export const ImportFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
  formType: z.enum(["UAD_3_6", "UAD_2_6", "BPO", "Other"]),
  pages: z.array(
    z.object({
      id: z.string().uuid().optional(),
      title: z.string(),
      description: z.string().optional(),
      page_order: z.number().int().min(0),
      settings: z.record(z.any()).optional(),
      sections: z.array(
        z.object({
          id: z.string().uuid().optional(),
          title: z.string(),
          description: z.string().optional(),
          section_order: z.number().int().min(0),
          settings: z.record(z.any()).optional(),
          fields: z
            .array(
              z.object({
                id: z.string().uuid().optional(),
                field_type: z.string(),
                label: z.string(),
                placeholder: z.string().optional(),
                help_text: z.string().optional(),
                required: z.boolean().optional(),
                width: z.string().optional(),
                field_order: z.number().int().min(0),
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
              }),
            )
            .optional(),
        }),
      ),
    }),
  ),
})

export type ImportFormData = z.infer<typeof ImportFormSchema>

// Convert FormStructure to ImportFormData format
export function formStructureToExportFormat(formStructure: FormStructure): ImportFormData {
  const { form, pages } = formStructure

  // Map form type from database enum to export format
  let formType: "UAD_3_6" | "UAD_2_6" | "BPO" | "Other" = "Other"
  if (form.settings?.originalFormType) {
    switch (form.settings.originalFormType) {
      case "uad_3_6":
        formType = "UAD_3_6"
        break
      case "uad_2_6":
        formType = "UAD_2_6"
        break
      case "bpo":
        formType = "BPO"
        break
    }
  } else if (form.form_type === "urar") {
    formType = "UAD_3_6"
  }

  return {
    id: form.id,
    name: form.title,
    description: form.description || "",
    formType,
    pages: pages.map((page) => ({
      id: page.id,
      title: page.title,
      description: page.description || "",
      page_order: page.page_order,
      settings: page.settings || {},
      sections:
        page.sections?.map((section) => ({
          id: section.id,
          title: section.title || "",
          description: section.description || "",
          section_order: section.section_order,
          settings: section.settings || {},
          fields:
            section.fields?.map((field) => ({
              id: field.id,
              field_type: field.field_type,
              label: field.label,
              placeholder: field.placeholder || "",
              help_text: field.help_text || "",
              required: field.required || false,
              width: field.width || "full",
              field_order: field.field_order,
              options: field.options || [],
              validation: field.validation || {},
              conditional_visibility: field.conditional_visibility || {},
              calculated_config: field.calculated_config || {},
              lookup_config: field.lookup_config || {},
              metadata: field.metadata || {},
            })) || [],
        })) || [],
    })),
  }
}

// Convert ImportFormData to FormStructure format
export function importFormatToFormStructure(importData: ImportFormData): FormStructure {
  // Map form type from export format to database enum
  let formType = "custom"
  let originalFormType = ""

  switch (importData.formType) {
    case "UAD_3_6":
      formType = "urar"
      originalFormType = "uad_3_6"
      break
    case "UAD_2_6":
      formType = "urar"
      originalFormType = "uad_2_6"
      break
    case "BPO":
      formType = "assessment"
      originalFormType = "bpo"
      break
    default:
      formType = "custom"
      originalFormType = "other"
  }

  const now = new Date().toISOString()

  return {
    form: {
      id: importData.id || crypto.randomUUID(),
      title: importData.name,
      description: importData.description || "",
      form_type: formType,
      version: 1,
      status: "draft",
      created_by: "",
      tags: [],
      settings: {
        originalFormType,
      },
      metadata: {},
      created_at: now,
      updated_at: now,
    },
    pages: importData.pages.map((page) => ({
      id: page.id || crypto.randomUUID(),
      form_id: "",
      title: page.title,
      description: page.description || "",
      page_order: page.page_order,
      settings: page.settings || {},
      created_at: now,
      updated_at: now,
      sections:
        page.sections?.map((section) => ({
          id: section.id || crypto.randomUUID(),
          page_id: "",
          title: section.title || "",
          description: section.description || "",
          section_order: section.section_order,
          settings: section.settings || {},
          created_at: now,
          updated_at: now,
          fields:
            section.fields?.map((field) => ({
              id: field.id || crypto.randomUUID(),
              section_id: "",
              field_type: field.field_type,
              label: field.label,
              placeholder: field.placeholder || "",
              help_text: field.help_text || "",
              required: field.required || false,
              width: field.width || "full",
              field_order: field.field_order,
              options: field.options || [],
              validation: field.validation || {},
              conditional_visibility: field.conditional_visibility || {},
              calculated_config: field.calculated_config || {},
              lookup_config: field.lookup_config || {},
              metadata: field.metadata || {},
              created_at: now,
              updated_at: now,
            })) || [],
        })) || [],
    })),
    rules: [],
  }
}

// Helper function to download JSON
export function downloadJson(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Generate filename for export
export function generateExportFilename(formName: string): string {
  const sanitizedName = formName.toLowerCase().replace(/[^a-z0-9]/g, "-")
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  return `form-${sanitizedName}-${timestamp}.json`
}

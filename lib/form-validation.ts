import { z } from "zod"

// Zod schemas for validation
export const FormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  settings: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({}),
})

export const FormPageSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Page title is required"),
  description: z.string().optional(),
  form_id: z.string().uuid(),
  page_order: z.number().int().min(0),
  settings: z.record(z.any()).default({}),
})

export const FormSectionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Section title is required"),
  description: z.string().optional(),
  page_id: z.string().uuid(),
  section_order: z.number().int().min(0),
  settings: z.record(z.any()).default({}),
})

export const FormFieldSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1, "Field label is required"),
  field_type: z.string().min(1, "Field type is required"),
  section_id: z.string().uuid(),
  field_order: z.number().int().min(0),
  required: z.boolean().default(false),
  width: z.enum(["quarter", "half", "three-quarters", "full"]).default("full"),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  options: z.record(z.any()).optional(),
  validation: z.record(z.any()).optional(),
  conditional_visibility: z.record(z.any()).optional(),
  calculated_config: z.record(z.any()).optional(),
  lookup_config: z.record(z.any()).optional(),
  prefill_config: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

export const FormStructureSchema = z.object({
  form: FormSchema,
  pages: z.array(FormPageSchema),
  sections: z.array(FormSectionSchema),
  fields: z.array(FormFieldSchema),
})

// Type definitions
export type ValidatedForm = z.infer<typeof FormSchema>
export type ValidatedFormPage = z.infer<typeof FormPageSchema>
export type ValidatedFormSection = z.infer<typeof FormSectionSchema>
export type ValidatedFormField = z.infer<typeof FormFieldSchema>
export type ValidatedFormStructure = z.infer<typeof FormStructureSchema>

// Validation function
export function validateFormData(formData: any): {
  isValid: boolean
  errors: string[]
  data?: ValidatedFormStructure
} {
  try {
    // Extract and validate form
    const form = FormSchema.parse(formData.form || formData)

    // Extract and validate pages
    const pages: ValidatedFormPage[] = []
    const sections: ValidatedFormSection[] = []
    const fields: ValidatedFormField[] = []

    if (formData.pages) {
      formData.pages.forEach((page: any, pageIndex: number) => {
        const pageData = FormPageSchema.parse({
          ...page,
          form_id: form.id,
          page_order: pageIndex,
        })
        pages.push(pageData)

        if (page.sections) {
          page.sections.forEach((section: any, sectionIndex: number) => {
            const sectionData = FormSectionSchema.parse({
              ...section,
              page_id: page.id,
              section_order: sectionIndex,
            })
            sections.push(sectionData)

            if (section.fields) {
              section.fields.forEach((field: any, fieldIndex: number) => {
                const fieldData = FormFieldSchema.parse({
                  ...field,
                  section_id: section.id,
                  field_order: fieldIndex,
                })
                fields.push(fieldData)
              })
            }
          })
        }
      })
    }

    const validatedData = {
      form,
      pages,
      sections,
      fields,
    }

    return {
      isValid: true,
      errors: [],
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      }
    }

    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : "Unknown validation error"],
    }
  }
}

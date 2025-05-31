import { z } from "zod"

// Validation schemas
export const FormFieldSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1, "Field label is required"),
  field_type: z.string().min(1, "Field type is required"),
  section_id: z.string().uuid("Invalid section ID"),
  field_order: z.number().int().min(0),
  required: z.boolean().default(false),
  width: z.enum(["full", "half", "third", "quarter"]).default("full"),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  options: z.any().optional(),
  validation: z.any().optional(),
  conditional_visibility: z.any().optional(),
  calculated_config: z.any().optional(),
  lookup_config: z.any().optional(),
  prefill_config: z.any().optional(),
  metadata: z.any().optional(),
})

export const FormSectionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Section title is required"),
  description: z.string().optional(),
  page_id: z.string().uuid("Invalid page ID"),
  section_order: z.number().int().min(0),
  settings: z.any().optional(),
})

export const FormPageSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Page title is required"),
  description: z.string().optional(),
  form_id: z.string().uuid("Invalid form ID"),
  page_order: z.number().int().min(0),
  settings: z.any().optional(),
})

export const FormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Form title is required"),
  description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  settings: z.any().optional(),
  metadata: z.any().optional(),
})

export type ValidatedFormField = z.infer<typeof FormFieldSchema>
export type ValidatedFormSection = z.infer<typeof FormSectionSchema>
export type ValidatedFormPage = z.infer<typeof FormPageSchema>
export type ValidatedForm = z.infer<typeof FormSchema>

// Validation functions
export function validateFormData(formData: any) {
  const errors: string[] = []

  try {
    // Validate form
    FormSchema.parse(formData)

    // Validate pages
    if (formData.pages) {
      formData.pages.forEach((page: any, pageIndex: number) => {
        try {
          FormPageSchema.parse(page)
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              errors.push(`Page ${pageIndex + 1}: ${err.message}`)
            })
          }
        }

        // Validate sections
        if (page.sections) {
          page.sections.forEach((section: any, sectionIndex: number) => {
            try {
              FormSectionSchema.parse(section)
            } catch (error) {
              if (error instanceof z.ZodError) {
                error.errors.forEach((err) => {
                  errors.push(`Page ${pageIndex + 1}, Section ${sectionIndex + 1}: ${err.message}`)
                })
              }
            }

            // Validate fields
            if (section.fields) {
              section.fields.forEach((field: any, fieldIndex: number) => {
                try {
                  FormFieldSchema.parse(field)
                } catch (error) {
                  if (error instanceof z.ZodError) {
                    error.errors.forEach((err) => {
                      errors.push(
                        `Page ${pageIndex + 1}, Section ${sectionIndex + 1}, Field ${fieldIndex + 1}: ${err.message}`,
                      )
                    })
                  }
                }
              })
            }
          })
        }
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        errors.push(`Form: ${err.message}`)
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

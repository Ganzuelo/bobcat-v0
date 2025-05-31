import { createClient } from "@/lib/supabase/client"
import {
  validateFormData,
  type ValidatedForm,
  type ValidatedFormPage,
  type ValidatedFormSection,
  type ValidatedFormField,
} from "./form-validation"

export interface SaveResult {
  success: boolean
  data?: any
  errors?: string[]
}

export interface FormSaveData {
  form: ValidatedForm
  pages: ValidatedFormPage[]
  sections: ValidatedFormSection[]
  fields: ValidatedFormField[]
}

export class FormSaveService {
  private supabase = createClient()

  async saveForm(formData: any): Promise<SaveResult> {
    // Step 1: Validate all data upfront
    const validation = validateFormData(formData)
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      }
    }

    // Step 2: Prepare normalized data
    const saveData = this.prepareFormData(formData)

    try {
      // Step 3: Execute transactional save
      const result = await this.executeTransactionalSave(saveData)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("Form save failed:", error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Unknown error occurred"],
      }
    }
  }

  private prepareFormData(formData: any): FormSaveData {
    const form: ValidatedForm = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      status: formData.status || "draft",
      settings: formData.settings || {},
      metadata: formData.metadata || {},
    }

    const pages: ValidatedFormPage[] = []
    const sections: ValidatedFormSection[] = []
    const fields: ValidatedFormField[] = []

    if (formData.pages) {
      formData.pages.forEach((page: any, pageIndex: number) => {
        const pageData: ValidatedFormPage = {
          id: page.id,
          title: page.title,
          description: page.description,
          form_id: formData.id,
          page_order: pageIndex,
          settings: page.settings || {},
        }
        pages.push(pageData)

        if (page.sections) {
          page.sections.forEach((section: any, sectionIndex: number) => {
            const sectionData: ValidatedFormSection = {
              id: section.id,
              title: section.title,
              description: section.description,
              page_id: page.id,
              section_order: sectionIndex,
              settings: section.settings || {},
            }
            sections.push(sectionData)

            if (section.fields) {
              section.fields.forEach((field: any, fieldIndex: number) => {
                const fieldData: ValidatedFormField = {
                  id: field.id,
                  label: field.label,
                  field_type: field.field_type || field.type,
                  section_id: section.id,
                  field_order: fieldIndex,
                  required: field.required || false,
                  width: field.width || "full",
                  placeholder: field.placeholder,
                  help_text: field.help_text,
                  options: field.options,
                  validation: field.validation,
                  conditional_visibility: field.conditional_visibility,
                  calculated_config: field.calculated_config,
                  lookup_config: field.lookup_config,
                  prefill_config: field.prefill_config,
                  metadata: field.metadata,
                }
                fields.push(fieldData)
              })
            }
          })
        }
      })
    }

    return { form, pages, sections, fields }
  }

  private async executeTransactionalSave(saveData: FormSaveData): Promise<any> {
    const { form, pages, sections, fields } = saveData

    // Use Supabase RPC for transaction-like behavior
    const { data, error } = await this.supabase.rpc("save_form_transaction", {
      form_data: form,
      pages_data: pages,
      sections_data: sections,
      fields_data: fields,
    })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  }

  // Separate methods for individual operations
  async saveFormOnly(formData: ValidatedForm): Promise<SaveResult> {
    try {
      const isUpdate = !!formData.id

      if (isUpdate) {
        const { data, error } = await this.supabase
          .from("forms")
          .update({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            settings: formData.settings,
            metadata: formData.metadata,
            updated_at: new Date().toISOString(),
          })
          .eq("id", formData.id)
          .select()
          .single()

        if (error) throw error
        return { success: true, data }
      } else {
        const { data, error } = await this.supabase
          .from("forms")
          .insert({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            settings: formData.settings,
            metadata: formData.metadata,
          })
          .select()
          .single()

        if (error) throw error
        return { success: true, data }
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to save form"],
      }
    }
  }

  async reorderFields(sectionId: string, fieldIds: string[]): Promise<SaveResult> {
    try {
      // Update field_order for all fields in the section
      const updates = fieldIds.map((fieldId, index) => ({
        id: fieldId,
        field_order: index,
      }))

      const { error } = await this.supabase.rpc("update_field_orders", {
        section_id: sectionId,
        field_updates: updates,
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to reorder fields"],
      }
    }
  }
}

export const formSaveService = new FormSaveService()

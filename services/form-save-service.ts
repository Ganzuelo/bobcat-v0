import { supabase } from "@/lib/supabase-client"
import {
  validateFormData,
  type ValidatedForm,
  type ValidatedFormPage,
  type ValidatedFormSection,
  type ValidatedFormField,
} from "@/lib/form-validation"

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
  // Use the existing supabase client instead of creating a new one
  private supabase = supabase

  async saveForm(formData: any): Promise<SaveResult> {
    console.log("🔧 FormSaveService.saveForm called with:", formData)

    // Step 1: Validate all data upfront
    const validation = validateFormData(formData)
    if (!validation.isValid) {
      console.error("❌ Validation failed:", validation.errors)
      return {
        success: false,
        errors: validation.errors,
      }
    }

    // Step 2: Prepare normalized data
    const saveData = this.prepareFormData(formData)
    console.log("🔧 Prepared save data:", saveData)

    try {
      // Step 3: Execute save operations
      const result = await this.executeSave(saveData)
      console.log("✅ Save successful:", result)

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("❌ Form save failed:", error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Unknown error occurred"],
      }
    }
  }

  private prepareFormData(formData: any): FormSaveData {
    const form: ValidatedForm = {
      id: formData.form?.id || formData.id,
      title: formData.form?.title || formData.title,
      description: formData.form?.description || formData.description,
      status: formData.form?.status || formData.status || "draft",
      settings: formData.form?.settings || formData.settings || {},
      metadata: formData.form?.metadata || formData.metadata || {},
    }

    const pages: ValidatedFormPage[] = []
    const sections: ValidatedFormSection[] = []
    const fields: ValidatedFormField[] = []

    if (formData.pages) {
      formData.pages.forEach((page: any, pageIndex: number) => {
        const pageData: ValidatedFormPage = {
          id: page.id,
          title: page.title,
          description: page.description || "",
          form_id: form.id!,
          page_order: pageIndex,
          settings: page.settings || {},
        }
        pages.push(pageData)

        if (page.sections) {
          page.sections.forEach((section: any, sectionIndex: number) => {
            const sectionData: ValidatedFormSection = {
              id: section.id,
              title: section.title,
              description: section.description || "",
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

  private async executeSave(saveData: FormSaveData): Promise<any> {
    const { form, pages, sections, fields } = saveData

    // For now, let's use a simpler approach without the stored procedure
    // We'll save each entity type separately but in the right order

    // 1. Save/update form
    const savedForm = await this.saveFormEntity(form)

    // 2. Save/update pages
    const savedPages = await Promise.all(pages.map((page) => this.savePageEntity({ ...page, form_id: savedForm.id })))

    // 3. Save/update sections
    const savedSections = await Promise.all(sections.map((section) => this.saveSectionEntity(section)))

    // 4. Save/update fields
    const savedFields = await Promise.all(fields.map((field) => this.saveFieldEntity(field)))

    return {
      form: savedForm,
      pages: savedPages,
      sections: savedSections,
      fields: savedFields,
    }
  }

  private async saveFormEntity(form: ValidatedForm) {
    const isUpdate = !!form.id

    if (isUpdate) {
      const { data, error } = await this.supabase
        .from("forms")
        .update({
          title: form.title,
          description: form.description,
          status: form.status,
          settings: form.settings,
          metadata: form.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", form.id)
        .select()
        .single()

      if (error) throw new Error(`Failed to update form: ${error.message}`)
      return data
    } else {
      const { data, error } = await this.supabase
        .from("forms")
        .insert({
          id: form.id || crypto.randomUUID(),
          title: form.title,
          description: form.description,
          status: form.status,
          settings: form.settings,
          metadata: form.metadata,
        })
        .select()
        .single()

      if (error) throw new Error(`Failed to create form: ${error.message}`)
      return data
    }
  }

  private async savePageEntity(page: ValidatedFormPage) {
    const isUpdate = !!page.id

    if (isUpdate) {
      const { data, error } = await this.supabase
        .from("form_pages")
        .update({
          title: page.title,
          description: page.description,
          page_order: page.page_order,
          settings: page.settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", page.id)
        .select()
        .single()

      if (error) throw new Error(`Failed to update page: ${error.message}`)
      return data
    } else {
      const { data, error } = await this.supabase
        .from("form_pages")
        .insert({
          id: page.id || crypto.randomUUID(),
          form_id: page.form_id,
          title: page.title,
          description: page.description,
          page_order: page.page_order,
          settings: page.settings,
        })
        .select()
        .single()

      if (error) throw new Error(`Failed to create page: ${error.message}`)
      return data
    }
  }

  private async saveSectionEntity(section: ValidatedFormSection) {
    const isUpdate = !!section.id

    if (isUpdate) {
      const { data, error } = await this.supabase
        .from("form_sections")
        .update({
          title: section.title,
          description: section.description,
          section_order: section.section_order,
          settings: section.settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", section.id)
        .select()
        .single()

      if (error) throw new Error(`Failed to update section: ${error.message}`)
      return data
    } else {
      const { data, error } = await this.supabase
        .from("form_sections")
        .insert({
          id: section.id || crypto.randomUUID(),
          page_id: section.page_id,
          title: section.title,
          description: section.description,
          section_order: section.section_order,
          settings: section.settings,
        })
        .select()
        .single()

      if (error) throw new Error(`Failed to create section: ${error.message}`)
      return data
    }
  }

  private async saveFieldEntity(field: ValidatedFormField) {
    const isUpdate = !!field.id

    if (isUpdate) {
      const { data, error } = await this.supabase
        .from("form_fields")
        .update({
          label: field.label,
          field_type: field.field_type,
          field_order: field.field_order,
          required: field.required,
          width: field.width,
          placeholder: field.placeholder,
          help_text: field.help_text,
          options: field.options,
          validation: field.validation,
          conditional_visibility: field.conditional_visibility,
          calculated_config: field.calculated_config,
          lookup_config: field.lookup_config,
          prefill_config: field.prefill_config,
          metadata: field.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", field.id)
        .select()
        .single()

      if (error) throw new Error(`Failed to update field: ${error.message}`)
      return data
    } else {
      const { data, error } = await this.supabase
        .from("form_fields")
        .insert({
          id: field.id || crypto.randomUUID(),
          section_id: field.section_id,
          label: field.label,
          field_type: field.field_type,
          field_order: field.field_order,
          required: field.required,
          width: field.width,
          placeholder: field.placeholder,
          help_text: field.help_text,
          options: field.options,
          validation: field.validation,
          conditional_visibility: field.conditional_visibility,
          calculated_config: field.calculated_config,
          lookup_config: field.lookup_config,
          prefill_config: field.prefill_config,
          metadata: field.metadata,
        })
        .select()
        .single()

      if (error) throw new Error(`Failed to create field: ${error.message}`)
      return data
    }
  }

  async reorderFields(sectionId: string, fieldIds: string[]): Promise<SaveResult> {
    try {
      // Update field_order for all fields in the section
      const updates = fieldIds.map((fieldId, index) =>
        this.supabase
          .from("form_fields")
          .update({ field_order: index, updated_at: new Date().toISOString() })
          .eq("id", fieldId)
          .eq("section_id", sectionId),
      )

      await Promise.all(updates)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to reorder fields"],
      }
    }
  }

  // Separate method for quick form-only saves
  async saveFormOnly(formData: ValidatedForm): Promise<SaveResult> {
    try {
      const savedForm = await this.saveFormEntity(formData)
      return { success: true, data: savedForm }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to save form"],
      }
    }
  }
}

export const formSaveService = new FormSaveService()

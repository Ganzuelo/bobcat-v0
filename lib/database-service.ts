import { supabase } from "./supabase-client"
import type { Form, FormPage, FormSection, FormField, FormSubmission, FormRule, FormStructure } from "./database-types"

export class DatabaseService {
  // Get current user ID
  static async getCurrentUserId(): Promise<string | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Error getting user:", error)
        return null
      }

      return user?.id || null
    } catch (error) {
      console.error("Error in getCurrentUserId:", error)
      return null
    }
  }

  // Form operations
  static async getForms(userId?: string) {
    try {
      let query = supabase.from("forms").select("*").order("updated_at", { ascending: false })

      if (userId) {
        query = query.eq("created_by", userId)
      } else {
        query = query.eq("status", "published")
      }

      const { data, error } = await query
      if (error) {
        console.error("Error fetching forms:", error)
        throw error
      }

      return data as Form[]
    } catch (error) {
      console.error("Error in getForms:", error)
      throw error
    }
  }

  static async getForm(id: string) {
    try {
      const { data, error } = await supabase.from("forms").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching form:", error)
        throw error
      }

      return data as Form
    } catch (error) {
      console.error("Error in getForm:", error)
      throw error
    }
  }

  static async createForm(form: Omit<Form, "id" | "created_at" | "updated_at">) {
    try {
      // Ensure created_by is set to current user
      const userId = await this.getCurrentUserId()
      if (!userId) throw new Error("User not authenticated")

      const formData = {
        ...form,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Creating form with data:", formData)

      const { data, error } = await supabase.from("forms").insert(formData).select().single()

      if (error) {
        console.error("Error creating form:", error)
        throw error
      }

      console.log("Form created successfully:", data)
      return data as Form
    } catch (error) {
      console.error("Error in createForm:", error)
      throw error
    }
  }

  static async updateForm(id: string, updates: Partial<Form>) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      console.log("Updating form with data:", updateData)

      const { data, error } = await supabase.from("forms").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("Error updating form:", error)
        throw error
      }

      console.log("Form updated successfully:", data)
      return data as Form
    } catch (error) {
      console.error("Error in updateForm:", error)
      throw error
    }
  }

  static async deleteForm(id: string) {
    try {
      const { error } = await supabase.from("forms").delete().eq("id", id)

      if (error) {
        console.error("Error deleting form:", error)
        throw error
      }

      console.log("Form deleted successfully")
    } catch (error) {
      console.error("Error in deleteForm:", error)
      throw error
    }
  }

  // Form structure operations
  static async getFormStructure(formId: string): Promise<FormStructure> {
    try {
      console.log("Getting form structure for:", formId)

      // Get form
      const form = await this.getForm(formId)

      // Get pages with sections and fields
      const { data: pages, error: pagesError } = await supabase
        .from("form_pages")
        .select(`
          *,
          form_sections (
            *,
            form_fields (*)
          )
        `)
        .eq("form_id", formId)
        .order("page_order")

      if (pagesError) {
        console.error("Error fetching pages:", pagesError)
        throw pagesError
      }

      // Get rules
      const { data: rules, error: rulesError } = await supabase
        .from("form_rules")
        .select("*")
        .eq("form_id", formId)
        .order("priority")

      if (rulesError) {
        console.error("Error fetching rules:", rulesError)
        throw rulesError
      }

      // Sort sections and fields
      const sortedPages = (pages || []).map((page) => ({
        ...page,
        sections: (page.form_sections || [])
          .sort((a, b) => a.section_order - b.section_order)
          .map((section) => ({
            ...section,
            fields: (section.form_fields || []).sort((a, b) => a.field_order - b.field_order),
          })),
      }))

      const structure = {
        form,
        pages: sortedPages,
        rules: rules || [],
      }

      console.log("Form structure loaded:", structure)
      return structure
    } catch (error) {
      console.error("Error in getFormStructure:", error)
      throw error
    }
  }

  // Save complete form structure
  static async saveFormStructure(formStructure: FormStructure): Promise<FormStructure> {
    try {
      console.log("Saving form structure:", formStructure)

      // Start transaction-like operations
      const { form, pages } = formStructure

      // Validate form ID
      if (!form.id || form.id === "") {
        form.id = crypto.randomUUID()
        console.log("Generated new form ID:", form.id)
      }

      // Save or update form
      let savedForm: Form
      if (form.created_at && form.id) {
        savedForm = await this.updateForm(form.id, form)
      } else {
        savedForm = await this.createForm(form)
      }

      // Update form_id in pages
      const updatedPages = pages.map((page) => ({
        ...page,
        form_id: savedForm.id,
      }))

      // Save pages, sections, and fields
      const savedPages = []
      for (const page of updatedPages) {
        const savedPage = await this.savePage(page, savedForm.id)
        savedPages.push(savedPage)
      }

      const savedStructure = {
        form: savedForm,
        pages: savedPages,
        rules: formStructure.rules,
      }

      console.log("Form structure saved successfully:", savedStructure)
      return savedStructure
    } catch (error) {
      console.error("Error in saveFormStructure:", error)
      throw error
    }
  }

  // Page operations
  static async savePage(page: FormPage & { sections: (FormSection & { fields: FormField[] })[] }, formId: string) {
    try {
      // Validate page ID
      if (!page.id || page.id === "") {
        page.id = crypto.randomUUID()
        console.log("Generated new page ID:", page.id)
      }

      const pageData = {
        id: page.id,
        form_id: formId,
        title: page.title,
        description: page.description,
        page_order: page.page_order,
        settings: page.settings || {},
      }

      // Upsert page
      const { data: savedPage, error: pageError } = await supabase.from("form_pages").upsert(pageData).select().single()

      if (pageError) throw pageError

      // Save sections
      const savedSections = []
      for (const section of page.sections) {
        const savedSection = await this.saveSection(section, savedPage.id)
        savedSections.push(savedSection)
      }

      return {
        ...savedPage,
        sections: savedSections,
      }
    } catch (error) {
      console.error("Error saving page:", error)
      throw error
    }
  }

  static async saveSection(section: FormSection & { fields: FormField[] }, pageId: string) {
    try {
      // Validate section ID
      if (!section.id || section.id === "") {
        section.id = crypto.randomUUID()
        console.log("Generated new section ID:", section.id)
      }

      const sectionData = {
        id: section.id,
        page_id: pageId,
        title: section.title,
        description: section.description,
        section_order: section.section_order,
        settings: section.settings || {},
      }

      // Upsert section
      const { data: savedSection, error: sectionError } = await supabase
        .from("form_sections")
        .upsert(sectionData)
        .select()
        .single()

      if (sectionError) throw sectionError

      // Save fields
      const savedFields = []
      for (const field of section.fields) {
        const savedField = await this.saveField(field, savedSection.id)
        savedFields.push(savedField)
      }

      return {
        ...savedSection,
        fields: savedFields,
      }
    } catch (error) {
      console.error("Error saving section:", error)
      throw error
    }
  }

  static async saveField(field: FormField, sectionId: string) {
    try {
      // Validate field ID
      if (!field.id || field.id === "") {
        field.id = crypto.randomUUID()
        console.log("Generated new field ID:", field.id)
      }

      const fieldData = {
        id: field.id,
        section_id: sectionId,
        field_type: field.field_type,
        label: field.label,
        placeholder: field.placeholder,
        help_text: field.help_text,
        required: field.required,
        width: field.width,
        field_order: field.field_order,
        options: field.options || [],
        validation: field.validation || {}, // Ensure it's always an object
        conditional_visibility: field.conditional_visibility || {},
        calculated_config: field.calculated_config || {},
        lookup_config: field.lookup_config || {},
        prefill_config: field.prefill_config || {},
        metadata: field.metadata || {},
      }

      // Upsert field
      const { data: savedField, error: fieldError } = await supabase
        .from("form_fields")
        .upsert(fieldData)
        .select()
        .single()

      if (fieldError) throw fieldError

      return savedField as FormField
    } catch (error) {
      console.error("Error saving field:", error)
      throw error
    }
  }

  static async createPage(page: Omit<FormPage, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase.from("form_pages").insert(page).select().single()

      if (error) throw error
      return data as FormPage
    } catch (error) {
      console.error("Error creating page:", error)
      throw error
    }
  }

  static async updatePage(id: string, updates: Partial<FormPage>) {
    try {
      const { data, error } = await supabase.from("form_pages").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data as FormPage
    } catch (error) {
      console.error("Error updating page:", error)
      throw error
    }
  }

  static async deletePage(id: string) {
    try {
      const { error } = await supabase.from("form_pages").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting page:", error)
      throw error
    }
  }

  // Section operations
  static async createSection(section: Omit<FormSection, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase.from("form_sections").insert(section).select().single()

      if (error) throw error
      return data as FormSection
    } catch (error) {
      console.error("Error creating section:", error)
      throw error
    }
  }

  static async updateSection(id: string, updates: Partial<FormSection>) {
    try {
      const { data, error } = await supabase.from("form_sections").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data as FormSection
    } catch (error) {
      console.error("Error updating section:", error)
      throw error
    }
  }

  static async deleteSection(id: string) {
    try {
      const { error } = await supabase.from("form_sections").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting section:", error)
      throw error
    }
  }

  // Field operations
  static async createField(field: Omit<FormField, "id" | "created_at" | "updated_at">) {
    try {
      const fieldData = {
        ...field,
        validation: field.validation || {}, // Ensure it's always an object
        prefill_config: field.prefill_config || {},
      }

      const { data, error } = await supabase.from("form_fields").insert(fieldData).select().single()

      if (error) throw error
      return data as FormField
    } catch (error) {
      console.error("Error creating field:", error)
      throw error
    }
  }

  static async updateField(id: string, updates: Partial<FormField>) {
    try {
      const updateData = {
        ...updates,
        validation: updates.validation || {}, // Ensure it's always an object
        prefill_config: updates.prefill_config || {},
      }

      const { data, error } = await supabase.from("form_fields").update(updateData).eq("id", id).select().single()

      if (error) throw error
      return data as FormField
    } catch (error) {
      console.error("Error updating field:", error)
      throw error
    }
  }

  static async deleteField(id: string) {
    try {
      const { error } = await supabase.from("form_fields").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting field:", error)
      throw error
    }
  }

  // Submission operations
  static async getSubmissions(formId: string) {
    try {
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false })

      if (error) throw error
      return data as FormSubmission[]
    } catch (error) {
      console.error("Error getting submissions:", error)
      throw error
    }
  }

  static async createSubmission(submission: Omit<FormSubmission, "id" | "submitted_at">) {
    try {
      // Ensure submitted_by is set to current user if not provided
      const userId = await this.getCurrentUserId()
      const submissionData = { ...submission, submitted_by: submission.submitted_by || userId }

      const { data, error } = await supabase.from("form_submissions").insert(submissionData).select().single()

      if (error) throw error
      return data as FormSubmission
    } catch (error) {
      console.error("Error creating submission:", error)
      throw error
    }
  }

  static async updateSubmission(id: string, updates: Partial<FormSubmission>) {
    try {
      const { data, error } = await supabase.from("form_submissions").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data as FormSubmission
    } catch (error) {
      console.error("Error updating submission:", error)
      throw error
    }
  }

  // Rule operations
  static async createRule(rule: Omit<FormRule, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase.from("form_rules").insert(rule).select().single()

      if (error) throw error
      return data as FormRule
    } catch (error) {
      console.error("Error creating rule:", error)
      throw error
    }
  }

  static async updateRule(id: string, updates: Partial<FormRule>) {
    try {
      const { data, error } = await supabase.from("form_rules").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data as FormRule
    } catch (error) {
      console.error("Error updating rule:", error)
      throw error
    }
  }

  static async deleteRule(id: string) {
    try {
      const { error } = await supabase.from("form_rules").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting rule:", error)
      throw error
    }
  }
}

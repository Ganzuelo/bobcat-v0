import { supabase } from "./supabase-client"
import type { Form, FormPage, FormSection, FormField, FormSubmission, FormRule, FormStructure } from "./database-types"

// Utility function to validate and generate UUIDs
function ensureValidUUID(id: string | undefined | null): string {
  if (!id || id === "" || id === "new" || id === "undefined" || id === "null") {
    return crypto.randomUUID()
  }
  return id
}

// Utility function to safely log objects
function safeLog(message: string, data: any): void {
  try {
    console.log(
      message,
      JSON.stringify(
        data,
        (key, value) => {
          if (value === undefined) return "undefined"
          if (value === null) return "null"
          return value
        },
        2,
      ),
    )
  } catch (error) {
    console.log(message, "Error stringifying object:", error)
  }
}

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
      // Validate ID
      if (!id || id === "" || id === "new") {
        throw new Error("Invalid form ID for fetch operation")
      }

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

      // Generate a valid UUID for the form
      const formId = ensureValidUUID(form.id)

      // Create a clean form object with all required fields
      const formData = {
        ...form,
        id: formId,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        title: form.title || "Untitled Form",
        description: form.description || "",
        status: form.status || "draft",
        settings: form.settings || {},
      }

      safeLog("Creating form with data:", formData)

      const { data, error } = await supabase.from("forms").insert(formData).select().single()

      if (error) {
        console.error("Error creating form:", error)
        throw error
      }

      console.log("Form created successfully:", data?.id)
      return data as Form
    } catch (error) {
      console.error("Error in createForm:", error)
      throw error
    }
  }

  static async updateForm(id: string, updates: Partial<Form>) {
    try {
      // Validate ID
      const validId = ensureValidUUID(id)
      if (validId !== id) {
        throw new Error(`Invalid form ID for update operation: ${id}`)
      }

      // Create a clean update object
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      // Remove id from updateData to prevent conflicts
      if ("id" in updateData) {
        delete updateData.id
      }

      safeLog(`Updating form ${id} with data:`, updateData)

      const { data, error } = await supabase.from("forms").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("Error updating form:", error)
        throw error
      }

      console.log("Form updated successfully:", data?.id)
      return data as Form
    } catch (error) {
      console.error("Error in updateForm:", error)
      throw error
    }
  }

  static async deleteForm(id: string) {
    try {
      // Validate ID
      if (!id || id === "" || id === "new") {
        throw new Error("Invalid form ID for delete operation")
      }

      const { error } = await supabase.from("forms").delete().eq("id", id)

      if (error) {
        console.error("Error deleting form:", error)
        throw error
      }

      console.log("Form deleted successfully:", id)
    } catch (error) {
      console.error("Error in deleteForm:", error)
      throw error
    }
  }

  // Form structure operations
  static async getFormStructure(formId: string): Promise<FormStructure> {
    try {
      console.log("Getting form structure for:", formId)

      // Validate ID
      if (!formId || formId === "" || formId === "new") {
        throw new Error("Invalid form ID for structure fetch operation")
      }

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

      console.log("Form structure loaded successfully:", formId)
      return structure
    } catch (error) {
      console.error("Error in getFormStructure:", error)
      throw error
    }
  }

  // Save complete form structure
  static async saveFormStructure(formStructure: FormStructure): Promise<FormStructure> {
    try {
      console.log("Starting form structure save...")

      // Start transaction-like operations
      const { form, pages, rules } = formStructure

      // Validate form ID and ensure it's a valid UUID
      const formId = ensureValidUUID(form.id)
      form.id = formId

      safeLog("Form data for save:", {
        id: form.id,
        title: form.title,
        pageCount: pages?.length || 0,
        ruleCount: rules?.length || 0,
      })

      // Save or update form
      let savedForm: Form
      try {
        if (form.created_at) {
          savedForm = await this.updateForm(formId, form)
        } else {
          savedForm = await this.createForm(form)
        }
      } catch (error) {
        console.error("Error saving form:", error)
        throw new Error(`Failed to save form: ${error.message}`)
      }

      // Update form_id in pages and ensure all pages have valid IDs
      const updatedPages = (pages || []).map((page, index) => {
        const pageId = ensureValidUUID(page.id)
        return {
          ...page,
          id: pageId,
          form_id: savedForm.id,
          page_order: page.page_order ?? index,
          title: page.title || `Page ${index + 1}`,
        }
      })

      // Save pages, sections, and fields
      const savedPages = []
      for (const page of updatedPages) {
        try {
          const savedPage = await this.savePage(page, savedForm.id)
          savedPages.push(savedPage)
        } catch (error) {
          console.error(`Error saving page ${page.id}:`, error)
          // Continue with other pages even if one fails
        }
      }

      // Save rules if any
      if (rules && rules.length > 0) {
        for (const rule of rules) {
          try {
            rule.form_id = savedForm.id
            if (rule.id) {
              await this.updateRule(rule.id, rule)
            } else {
              await this.createRule(rule)
            }
          } catch (error) {
            console.error(`Error saving rule:`, error)
            // Continue with other rules even if one fails
          }
        }
      }

      const savedStructure = {
        form: savedForm,
        pages: savedPages,
        rules: rules || [],
      }

      console.log("Form structure saved successfully:", savedForm.id)
      return savedStructure
    } catch (error) {
      console.error("Error in saveFormStructure:", error)
      throw error
    }
  }

  // Page operations
  static async savePage(page: FormPage & { sections?: (FormSection & { fields?: FormField[] })[] }, formId: string) {
    try {
      // Validate page ID and ensure it's a valid UUID
      const pageId = ensureValidUUID(page.id)

      // Create a clean page object with all required fields
      const pageData = {
        id: pageId,
        form_id: formId,
        title: page.title || "Untitled Page",
        description: page.description || "",
        page_order: page.page_order ?? 0,
        settings: page.settings || {},
      }

      safeLog(`Saving page ${pageId} with data:`, {
        id: pageData.id,
        title: pageData.title,
        sectionCount: page.sections?.length || 0,
      })

      // Upsert page
      const { data: savedPage, error: pageError } = await supabase.from("form_pages").upsert(pageData).select().single()

      if (pageError) {
        console.error(`Error upserting page ${pageId}:`, pageError)
        throw pageError
      }

      // Save sections
      const savedSections = []
      for (const section of page.sections || []) {
        try {
          // Ensure section has a valid ID
          const sectionId = ensureValidUUID(section.id)
          section.id = sectionId

          const savedSection = await this.saveSection(section, savedPage.id)
          savedSections.push(savedSection)
        } catch (error) {
          console.error(`Error saving section in page ${pageId}:`, error)
          // Continue with other sections even if one fails
        }
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

  static async saveSection(section: FormSection & { fields?: FormField[] }, pageId: string) {
    try {
      // Validate section ID and ensure it's a valid UUID
      const sectionId = ensureValidUUID(section.id)

      // Create a clean section object with all required fields
      const sectionData = {
        id: sectionId,
        page_id: pageId,
        title: section.title || "Untitled Section",
        description: section.description || "",
        section_order: section.section_order ?? 0,
        settings: section.settings || {},
      }

      safeLog(`Saving section ${sectionId} with data:`, {
        id: sectionData.id,
        title: sectionData.title,
        fieldCount: section.fields?.length || 0,
      })

      // Upsert section
      const { data: savedSection, error: sectionError } = await supabase
        .from("form_sections")
        .upsert(sectionData)
        .select()
        .single()

      if (sectionError) {
        console.error(`Error upserting section ${sectionId}:`, sectionError)
        throw sectionError
      }

      // Save fields
      const savedFields = []
      for (const field of section.fields || []) {
        try {
          // Ensure field has a valid ID
          const fieldId = ensureValidUUID(field.id)
          field.id = fieldId

          const savedField = await this.saveField(field, savedSection.id)
          savedFields.push(savedField)
        } catch (error) {
          console.error(`Error saving field in section ${sectionId}:`, error)
          // Continue with other fields even if one fails
        }
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
      // Validate field ID and ensure it's a valid UUID
      const fieldId = ensureValidUUID(field.id)

      // Handle field_type vs type inconsistency
      const fieldType = field.field_type || field.type || "text"

      // Create a clean field object with all required fields
      const fieldData = {
        id: fieldId,
        section_id: sectionId,
        field_type: fieldType,
        label: field.label || "Untitled Field",
        placeholder: field.placeholder || "",
        help_text: field.help_text || "",
        required: !!field.required,
        width: field.width || "FULL",
        field_order: field.field_order ?? 0,
        options: field.options || [],
        validation: field.validation || {},
        conditional_visibility: field.conditional_visibility || {},
        calculated_config: field.calculated_config || {},
        lookup_config: field.lookup_config || {},
        prefill_config: field.prefill_config || {},
        metadata: field.metadata || {},
      }

      // Handle special field types
      if (fieldType === "sales_grid" && field.gridConfig) {
        fieldData.metadata = {
          ...fieldData.metadata,
          gridConfig: field.gridConfig,
        }
      }

      safeLog(`Saving field ${fieldId} with data:`, {
        id: fieldData.id,
        type: fieldData.field_type,
        label: fieldData.label,
      })

      // Upsert field
      const { data: savedField, error: fieldError } = await supabase
        .from("form_fields")
        .upsert(fieldData)
        .select()
        .single()

      if (fieldError) {
        console.error(`Error upserting field ${fieldId}:`, fieldError)
        throw fieldError
      }

      // Add back any special properties that aren't in the database schema
      const enhancedField = {
        ...savedField,
        gridConfig: field.gridConfig,
      }

      return enhancedField as FormField
    } catch (error) {
      console.error("Error saving field:", error)
      throw error
    }
  }

  static async createPage(page: Omit<FormPage, "id" | "created_at" | "updated_at">) {
    try {
      // Ensure page has a valid ID
      const pageId = !page.id || page.id === "" ? crypto.randomUUID() : page.id

      const pageData = {
        ...page,
        id: pageId,
      }

      const { data, error } = await supabase.from("form_pages").insert(pageData).select().single()

      if (error) throw error
      return data as FormPage
    } catch (error) {
      console.error("Error creating page:", error)
      throw error
    }
  }

  static async updatePage(id: string, updates: Partial<FormPage>) {
    try {
      // Validate ID before proceeding
      if (!id || id === "") {
        throw new Error("Invalid page ID for update operation")
      }

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
      // Ensure section has a valid ID
      const sectionId = !section.id || section.id === "" ? crypto.randomUUID() : section.id

      const sectionData = {
        ...section,
        id: sectionId,
      }

      const { data, error } = await supabase.from("form_sections").insert(sectionData).select().single()

      if (error) throw error
      return data as FormSection
    } catch (error) {
      console.error("Error creating section:", error)
      throw error
    }
  }

  static async updateSection(id: string, updates: Partial<FormSection>) {
    try {
      // Validate ID before proceeding
      if (!id || id === "") {
        throw new Error("Invalid section ID for update operation")
      }

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
      // Ensure field has a valid ID
      const fieldId = !field.id || field.id === "" ? crypto.randomUUID() : field.id

      const fieldData = {
        ...field,
        id: fieldId,
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
      // Validate ID before proceeding
      if (!id || id === "") {
        throw new Error("Invalid field ID for update operation")
      }

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

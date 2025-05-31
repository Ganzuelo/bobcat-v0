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

// Deep clean object to ensure all UUIDs are valid
function deepCleanObject(obj: any): any {
  if (!obj) return obj

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCleanObject(item))
  }

  // Handle objects
  if (typeof obj === "object") {
    const cleaned: any = {}

    for (const [key, value] of Object.entries(obj)) {
      // Skip null or undefined values
      if (value === null || value === undefined) continue

      // Handle ID fields specifically
      if ((key === "id" || key.endsWith("_id")) && typeof value === "string") {
        cleaned[key] = ensureValidUUID(value)
      }
      // Recursively clean nested objects
      else if (typeof value === "object") {
        cleaned[key] = deepCleanObject(value)
      }
      // Keep other values as is
      else {
        cleaned[key] = value
      }
    }

    return cleaned
  }

  // Return primitive values as is
  return obj
}

export class DatabaseService {
  // Get current user ID with development fallback
  static async getCurrentUserId(): Promise<string> {
    // Development fallback - replace with actual auth in production
    const SYSTEM_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Error getting user:", error)
        console.log("Using system user fallback due to auth error")
        return SYSTEM_USER_ID
      }

      if (!user?.id || user.id === "" || user.id === "undefined") {
        console.log("No valid user ID found, using system user fallback")
        return SYSTEM_USER_ID
      }

      console.log("Using authenticated user:", user.id)
      return user.id
    } catch (error) {
      console.error("Error in getCurrentUserId:", error)
      console.log("Using system user fallback due to exception")
      return SYSTEM_USER_ID
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

      // Clean the form data to ensure all UUIDs are valid
      const cleanFormData = deepCleanObject(formData)

      safeLog("Creating form with data:", cleanFormData)

      const { data, error } = await supabase.from("forms").insert(cleanFormData).select().single()

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
      // Generate a valid UUID for the form ID
      const validId = ensureValidUUID(id)

      // Get current user for updated_by field
      const userId = await this.getCurrentUserId()

      // Create a clean update object
      const updateData = {
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }

      // Handle published status validation
      if (updateData.status === "published") {
        // Ensure published_at is set when status is published
        if (!updateData.published_at) {
          updateData.published_at = new Date().toISOString()
        }

        // Ensure required fields for published forms
        if (!updateData.title || updateData.title.trim() === "") {
          throw new Error("Title is required for published forms")
        }
      } else if (updateData.status === "draft") {
        // Clear published_at when status is draft
        updateData.published_at = null
      }

      // Remove id from updateData to prevent conflicts
      if ("id" in updateData) {
        delete updateData.id
      }

      // Clean the update data to ensure all UUIDs are valid
      const cleanUpdateData = deepCleanObject(updateData)

      safeLog(`Updating form ${validId} with data:`, cleanUpdateData)

      const { data, error } = await supabase.from("forms").update(cleanUpdateData).eq("id", validId).select().single()

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

      // Create a clean form object with the valid ID
      const cleanForm = {
        ...form,
        id: formId,
      }

      safeLog("Form data for save:", {
        id: cleanForm.id,
        title: cleanForm.title,
        pageCount: pages?.length || 0,
        ruleCount: rules?.length || 0,
      })

      // Save or update form
      let savedForm: Form
      try {
        if (cleanForm.created_at) {
          // For existing forms, use the valid ID for the update
          savedForm = await this.updateForm(formId, cleanForm)
        } else {
          // For new forms, create with the clean form object
          savedForm = await this.createForm(cleanForm)
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
            const cleanRule = {
              ...rule,
              form_id: savedForm.id,
              id: rule.id ? ensureValidUUID(rule.id) : crypto.randomUUID(),
            }

            if (cleanRule.id && cleanRule.id !== "new") {
              await this.updateRule(cleanRule.id, cleanRule)
            } else {
              await this.createRule(cleanRule)
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

      // Get current user for tracking
      const userId = await this.getCurrentUserId()

      // Create a clean page object with all required fields
      const pageData = {
        id: pageId,
        form_id: formId,
        title: page.title || "Untitled Page",
        description: page.description || "",
        page_order: page.page_order ?? 0,
        settings: page.settings || {},
        // Add user tracking
        ...(page.created_at ? { updated_by: userId } : { created_by: userId }),
        ...(page.created_at ? {} : { created_at: new Date().toISOString() }),
        updated_at: new Date().toISOString(),
      }

      // Clean the page data to ensure all UUIDs are valid
      const cleanPageData = deepCleanObject(pageData)

      safeLog(`Saving page ${pageId} with data:`, {
        id: cleanPageData.id,
        title: cleanPageData.title,
        sectionCount: page.sections?.length || 0,
      })

      // Upsert page
      const { data: savedPage, error: pageError } = await supabase
        .from("form_pages")
        .upsert(cleanPageData)
        .select()
        .single()

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

      // Get current user for tracking
      const userId = await this.getCurrentUserId()

      // Create a clean section object with all required fields
      const sectionData = {
        id: sectionId,
        page_id: pageId,
        title: section.title || "Untitled Section",
        description: section.description || "",
        section_order: section.section_order ?? 0,
        settings: section.settings || {},
        // Add user tracking
        ...(section.created_at ? { updated_by: userId } : { created_by: userId }),
        ...(section.created_at ? {} : { created_at: new Date().toISOString() }),
        updated_at: new Date().toISOString(),
      }

      // Clean the section data to ensure all UUIDs are valid
      const cleanSectionData = deepCleanObject(sectionData)

      safeLog(`Saving section ${sectionId} with data:`, {
        id: cleanSectionData.id,
        title: cleanSectionData.title,
        fieldCount: section.fields?.length || 0,
      })

      // Upsert section
      const { data: savedSection, error: sectionError } = await supabase
        .from("form_sections")
        .upsert(cleanSectionData)
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

      // Get current user for tracking
      const userId = await this.getCurrentUserId()

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
        // Add user tracking
        ...(field.created_at ? { updated_by: userId } : { created_by: userId }),
        ...(field.created_at ? {} : { created_at: new Date().toISOString() }),
        updated_at: new Date().toISOString(),
      }

      // Handle special field types
      if (fieldType === "sales_grid" && field.gridConfig) {
        fieldData.metadata = {
          ...fieldData.metadata,
          gridConfig: field.gridConfig,
        }
      }

      // Clean the field data to ensure all UUIDs are valid
      const cleanFieldData = deepCleanObject(fieldData)

      safeLog(`Saving field ${fieldId} with data:`, {
        id: cleanFieldData.id,
        type: cleanFieldData.field_type,
        label: cleanFieldData.label,
      })

      // Upsert field
      const { data: savedField, error: fieldError } = await supabase
        .from("form_fields")
        .upsert(cleanFieldData)
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

  // Other methods remain the same...
  static async createPage(page: Omit<FormPage, "id" | "created_at" | "updated_at">) {
    try {
      // Ensure page has a valid ID
      const pageId = ensureValidUUID(page.id)

      const pageData = {
        ...page,
        id: pageId,
      }

      // Clean the page data to ensure all UUIDs are valid
      const cleanPageData = deepCleanObject(pageData)

      const { data, error } = await supabase.from("form_pages").insert(cleanPageData).select().single()

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
      const validId = ensureValidUUID(id)

      // Clean the update data to ensure all UUIDs are valid
      const cleanUpdates = deepCleanObject(updates)

      const { data, error } = await supabase.from("form_pages").update(cleanUpdates).eq("id", validId).select().single()

      if (error) throw error
      return data as FormPage
    } catch (error) {
      console.error("Error updating page:", error)
      throw error
    }
  }

  static async deletePage(id: string) {
    try {
      const validId = ensureValidUUID(id)
      const { error } = await supabase.from("form_pages").delete().eq("id", validId)

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
      const sectionId = ensureValidUUID(section.id)

      const sectionData = {
        ...section,
        id: sectionId,
      }

      // Clean the section data to ensure all UUIDs are valid
      const cleanSectionData = deepCleanObject(sectionData)

      const { data, error } = await supabase.from("form_sections").insert(cleanSectionData).select().single()

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
      const validId = ensureValidUUID(id)

      // Clean the update data to ensure all UUIDs are valid
      const cleanUpdates = deepCleanObject(updates)

      const { data, error } = await supabase
        .from("form_sections")
        .update(cleanUpdates)
        .eq("id", validId)
        .select()
        .single()

      if (error) throw error
      return data as FormSection
    } catch (error) {
      console.error("Error updating section:", error)
      throw error
    }
  }

  static async deleteSection(id: string) {
    try {
      const validId = ensureValidUUID(id)
      const { error } = await supabase.from("form_sections").delete().eq("id", validId)

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
      const fieldId = ensureValidUUID(field.id)

      const fieldData = {
        ...field,
        id: fieldId,
        validation: field.validation || {}, // Ensure it's always an object
        prefill_config: field.prefill_config || {},
      }

      // Clean the field data to ensure all UUIDs are valid
      const cleanFieldData = deepCleanObject(fieldData)

      const { data, error } = await supabase.from("form_fields").insert(cleanFieldData).select().single()

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
      const validId = ensureValidUUID(id)

      // Clean the update data to ensure all UUIDs are valid
      const cleanUpdates = deepCleanObject(updates)

      const { data, error } = await supabase
        .from("form_fields")
        .update(cleanUpdates)
        .eq("id", validId)
        .select()
        .single()

      if (error) throw error
      return data as FormField
    } catch (error) {
      console.error("Error updating field:", error)
      throw error
    }
  }

  static async deleteField(id: string) {
    try {
      const validId = ensureValidUUID(id)
      const { error } = await supabase.from("form_fields").delete().eq("id", validId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting field:", error)
      throw error
    }
  }

  // Rule operations
  static async createRule(rule: Omit<FormRule, "id" | "created_at" | "updated_at">) {
    try {
      // Ensure rule has a valid ID
      const ruleId = ensureValidUUID(rule.id)

      const ruleData = {
        ...rule,
        id: ruleId,
      }

      // Clean the rule data to ensure all UUIDs are valid
      const cleanRuleData = deepCleanObject(ruleData)

      const { data, error } = await supabase.from("form_rules").insert(cleanRuleData).select().single()

      if (error) throw error
      return data as FormRule
    } catch (error) {
      console.error("Error creating rule:", error)
      throw error
    }
  }

  static async updateRule(id: string, updates: Partial<FormRule>) {
    try {
      // Validate ID before proceeding
      const validId = ensureValidUUID(id)

      // Clean the update data to ensure all UUIDs are valid
      const cleanUpdates = deepCleanObject(updates)

      // Remove id from updates to prevent conflicts
      if ("id" in cleanUpdates) {
        delete cleanUpdates.id
      }

      const { data, error } = await supabase.from("form_rules").update(cleanUpdates).eq("id", validId).select().single()

      if (error) throw error
      return data as FormRule
    } catch (error) {
      console.error("Error updating rule:", error)
      throw error
    }
  }

  static async deleteRule(id: string) {
    try {
      const validId = ensureValidUUID(id)
      const { error } = await supabase.from("form_rules").delete().eq("id", validId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting rule:", error)
      throw error
    }
  }

  // Submission operations remain the same...
  static async getSubmissions(formId: string) {
    try {
      const validId = ensureValidUUID(formId)
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_id", validId)
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
      const submissionData = {
        ...submission,
        submitted_by: submission.submitted_by || userId,
        id: ensureValidUUID(submission.id),
      }

      // Clean the submission data to ensure all UUIDs are valid
      const cleanSubmissionData = deepCleanObject(submissionData)

      const { data, error } = await supabase.from("form_submissions").insert(cleanSubmissionData).select().single()

      if (error) throw error
      return data as FormSubmission
    } catch (error) {
      console.error("Error creating submission:", error)
      throw error
    }
  }

  static async updateSubmission(id: string, updates: Partial<FormSubmission>) {
    try {
      const validId = ensureValidUUID(id)

      // Get current user for updated_by field
      const userId = await this.getCurrentUserId()

      // Clean the update data to ensure all UUIDs are valid
      const cleanUpdates = deepCleanObject({
        ...updates,
        updated_by: userId, // Add this line
        updated_at: new Date().toISOString(), // Add this line
      })

      // Remove id from updates to prevent conflicts
      if ("id" in cleanUpdates) {
        delete cleanUpdates.id
      }

      const { data, error } = await supabase
        .from("form_submissions")
        .update(cleanUpdates)
        .eq("id", validId)
        .select()
        .single()

      if (error) throw error
      return data as FormSubmission
    } catch (error) {
      console.error("Error updating submission:", error)
      throw error
    }
  }
}

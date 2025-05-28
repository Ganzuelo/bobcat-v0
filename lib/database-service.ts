import { supabase } from "./supabase-client"
import type { Form, FormPage, FormSection, FormField, FormSubmission, FormRule, FormStructure } from "./database-types"

export class DatabaseService {
  // Get current user ID
  static async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id || null
  }

  // Form operations
  static async getForms(userId?: string) {
    let query = supabase.from("forms").select("*").order("updated_at", { ascending: false })

    if (userId) {
      query = query.eq("created_by", userId)
    } else {
      query = query.eq("status", "published")
    }

    const { data, error } = await query
    if (error) throw error
    return data as Form[]
  }

  static async getForm(id: string) {
    const { data, error } = await supabase.from("forms").select("*").eq("id", id).single()

    if (error) throw error
    return data as Form
  }

  static async createForm(form: Omit<Form, "id" | "created_at" | "updated_at">) {
    // Ensure created_by is set to current user
    const userId = await this.getCurrentUserId()
    if (!userId) throw new Error("User not authenticated")

    const formData = { ...form, created_by: userId }
    const { data, error } = await supabase.from("forms").insert(formData).select().single()

    if (error) throw error
    return data as Form
  }

  static async updateForm(id: string, updates: Partial<Form>) {
    const { data, error } = await supabase.from("forms").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as Form
  }

  static async deleteForm(id: string) {
    const { error } = await supabase.from("forms").delete().eq("id", id)

    if (error) throw error
  }

  // Form structure operations
  static async getFormStructure(formId: string): Promise<FormStructure> {
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

    if (pagesError) throw pagesError

    // Get rules
    const { data: rules, error: rulesError } = await supabase
      .from("form_rules")
      .select("*")
      .eq("form_id", formId)
      .order("priority")

    if (rulesError) throw rulesError

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

    return {
      form,
      pages: sortedPages,
      rules: rules || [],
    }
  }

  // Page operations
  static async createPage(page: Omit<FormPage, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("form_pages").insert(page).select().single()

    if (error) throw error
    return data as FormPage
  }

  static async updatePage(id: string, updates: Partial<FormPage>) {
    const { data, error } = await supabase.from("form_pages").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as FormPage
  }

  static async deletePage(id: string) {
    const { error } = await supabase.from("form_pages").delete().eq("id", id)

    if (error) throw error
  }

  // Section operations
  static async createSection(section: Omit<FormSection, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("form_sections").insert(section).select().single()

    if (error) throw error
    return data as FormSection
  }

  static async updateSection(id: string, updates: Partial<FormSection>) {
    const { data, error } = await supabase.from("form_sections").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as FormSection
  }

  static async deleteSection(id: string) {
    const { error } = await supabase.from("form_sections").delete().eq("id", id)

    if (error) throw error
  }

  // Field operations
  static async createField(field: Omit<FormField, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("form_fields").insert(field).select().single()

    if (error) throw error
    return data as FormField
  }

  static async updateField(id: string, updates: Partial<FormField>) {
    const { data, error } = await supabase.from("form_fields").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as FormField
  }

  static async deleteField(id: string) {
    const { error } = await supabase.from("form_fields").delete().eq("id", id)

    if (error) throw error
  }

  // Submission operations
  static async getSubmissions(formId: string) {
    const { data, error } = await supabase
      .from("form_submissions")
      .select("*")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false })

    if (error) throw error
    return data as FormSubmission[]
  }

  static async createSubmission(submission: Omit<FormSubmission, "id" | "submitted_at">) {
    // Ensure submitted_by is set to current user if not provided
    const userId = await this.getCurrentUserId()
    const submissionData = { ...submission, submitted_by: submission.submitted_by || userId }

    const { data, error } = await supabase.from("form_submissions").insert(submissionData).select().single()

    if (error) throw error
    return data as FormSubmission
  }

  static async updateSubmission(id: string, updates: Partial<FormSubmission>) {
    const { data, error } = await supabase.from("form_submissions").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as FormSubmission
  }

  // Rule operations
  static async createRule(rule: Omit<FormRule, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("form_rules").insert(rule).select().single()

    if (error) throw error
    return data as FormRule
  }

  static async updateRule(id: string, updates: Partial<FormRule>) {
    const { data, error } = await supabase.from("form_rules").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data as FormRule
  }

  static async deleteRule(id: string) {
    const { error } = await supabase.from("form_rules").delete().eq("id", id)

    if (error) throw error
  }
}

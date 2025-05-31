"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import type { FormStructure } from "@/lib/database-types"
import { useToast } from "@/hooks/use-toast"

// Map import form types to database enum values
function mapFormTypeToDbType(formType: string): string {
  switch (formType.toLowerCase()) {
    case "uad_3_6":
    case "uad_2_6":
      return "urar" // Uniform Residential Appraisal Report
    case "bpo":
      return "assessment" // Broker Price Opinion
    case "survey":
      return "survey"
    case "application":
      return "application"
    case "registration":
      return "registration"
    case "feedback":
      return "feedback"
    case "inspection":
      return "inspection"
    case "other":
    default:
      return "custom"
  }
}

export function useFormBuilder(formId?: string) {
  const [formStructure, setFormStructure] = useState<FormStructure | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (formId && formId !== "new") {
      loadForm()
    } else {
      initializeNewForm()
    }
  }, [formId])

  const initializeNewForm = (structure?: FormStructure) => {
    if (structure) {
      setFormStructure(structure)
      return
    }
    const newFormStructure: FormStructure = {
      form: {
        id: crypto.randomUUID(),
        title: "New Form",
        description: "",
        form_type: "custom",
        version: 1,
        status: "draft",
        created_by: "",
        tags: [],
        settings: {},
        metadata: {},
        created_at: "",
        updated_at: "",
      },
      pages: [
        {
          id: crypto.randomUUID(),
          form_id: "",
          title: "Page 1",
          description: "",
          page_order: 1,
          settings: {},
          created_at: "",
          updated_at: "",
          sections: [
            {
              id: crypto.randomUUID(),
              page_id: "",
              title: "Section 1",
              description: "",
              section_order: 1,
              settings: {},
              created_at: "",
              updated_at: "",
              fields: [],
            },
          ],
        },
      ],
      rules: [],
    }
    setFormStructure(newFormStructure)
  }

  const setInitialFormStructure = (structure: FormStructure) => {
    setFormStructure(structure)
  }

  const loadForm = async () => {
    if (!formId || formId === "new") return

    setLoading(true)
    try {
      const { data: form, error: formError } = await supabase.from("forms").select("*").eq("id", formId).single()
      if (formError) throw formError

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

      // Ensure proper structure and ordering
      const structuredPages = (pages || []).map((page, pageIndex) => ({
        ...page,
        page_order: pageIndex + 1,
        sections: (page.form_sections || [])
          .sort((a, b) => a.section_order - b.section_order)
          .map((section, sectionIndex) => ({
            ...section,
            section_order: sectionIndex + 1,
            fields: (section.form_fields || [])
              .sort((a, b) => a.field_order - b.field_order)
              .map((field, fieldIndex) => ({
                ...field,
                field_order: fieldIndex + 1,
              })),
          })),
      }))

      setFormStructure({
        form,
        pages: structuredPages,
        rules: [],
      })
    } catch (error) {
      console.error("Error loading form:", error)
      toast({
        title: "Error",
        description: "Failed to load form",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveForm = async (onSave?: (form: any) => void) => {
    if (!formStructure) return

    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Ensure pages is an array before processing
      const pages = Array.isArray(formStructure.pages) ? formStructure.pages : []

      // Normalize and validate the form structure before saving
      const normalizedFormStructure = {
        ...formStructure,
        pages: pages.map((page, pageIndex) => {
          const sections = Array.isArray(page.sections) ? page.sections : []
          return {
            ...page,
            page_order: pageIndex + 1, // Ensure sequential page ordering based on array position
            sections: sections.map((section, sectionIndex) => {
              const fields = Array.isArray(section.fields) ? section.fields : []
              return {
                ...section,
                section_order: sectionIndex + 1,
                fields: fields.map((field, fieldIndex) => ({
                  ...field,
                  field_order: fieldIndex + 1,
                })),
              }
            }),
          }
        }),
      }

      // Prepare form data with proper constraint handling
      const currentTime = new Date().toISOString()

      // Map the form type to a valid database enum
      const mappedFormType = mapFormTypeToDbType(normalizedFormStructure.form.form_type)

      const formData = {
        id: normalizedFormStructure.form.id,
        title: normalizedFormStructure.form.title,
        description: normalizedFormStructure.form.description,
        form_type: mappedFormType, // Use the mapped form type
        version: normalizedFormStructure.form.version,
        status: normalizedFormStructure.form.status,
        created_by: user.id,
        tags: Array.isArray(normalizedFormStructure.form.tags) ? normalizedFormStructure.form.tags : [],
        settings: normalizedFormStructure.form.settings || {},
        metadata: normalizedFormStructure.form.metadata || {},
        updated_at: currentTime,
        // Handle published_at based on status to satisfy database constraints
        ...(normalizedFormStructure.form.status === "published"
          ? { published_at: normalizedFormStructure.form.published_at || currentTime }
          : { published_at: null }),
        // Handle archived_at based on status
        ...(normalizedFormStructure.form.status === "archived"
          ? { archived_at: normalizedFormStructure.form.archived_at || currentTime }
          : { archived_at: null }),
        ...(normalizedFormStructure.form.created_at ? {} : { created_at: currentTime }),
      }

      const { data: savedForm, error: formError } = await supabase.from("forms").upsert(formData).select().single()
      if (formError) throw formError

      // Delete existing pages, sections, and fields to avoid constraint violations
      if (formId && formId !== "new") {
        try {
          // Get existing page IDs first
          const { data: existingPages } = await supabase.from("form_pages").select("id").eq("form_id", savedForm.id)

          if (existingPages && existingPages.length > 0) {
            const pageIds = existingPages.map((p) => p.id)

            // Get existing section IDs
            const { data: existingSections } = await supabase.from("form_sections").select("id").in("page_id", pageIds)

            if (existingSections && existingSections.length > 0) {
              const sectionIds = existingSections.map((s) => s.id)

              // Delete fields first
              await supabase.from("form_fields").delete().in("section_id", sectionIds)
            }

            // Delete sections
            await supabase.from("form_sections").delete().in("page_id", pageIds)

            // Delete pages
            await supabase.from("form_pages").delete().eq("form_id", savedForm.id)
          }
        } catch (deleteError) {
          console.warn("Error during cleanup, continuing with save:", deleteError)
        }
      }

      // Save pages, sections, and fields with proper ordering
      for (let pageIndex = 0; pageIndex < normalizedFormStructure.pages.length; pageIndex++) {
        const page = normalizedFormStructure.pages[pageIndex]

        const pageData = {
          id: page.id,
          form_id: savedForm.id,
          title: page.title || `Page ${pageIndex + 1}`,
          description: page.description || "",
          page_order: pageIndex + 1,
          settings: page.settings || {},
          created_at: currentTime,
          updated_at: currentTime,
        }

        const { data: savedPage, error: pageError } = await supabase
          .from("form_pages")
          .insert(pageData)
          .select()
          .single()

        if (pageError) throw pageError

        // Ensure sections is an array
        const sections = Array.isArray(page.sections) ? page.sections : []

        // Save sections for this page
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
          const section = sections[sectionIndex]

          const sectionData = {
            id: section.id,
            page_id: savedPage.id,
            title: section.title || `Section ${sectionIndex + 1}`,
            description: section.description || "",
            section_order: sectionIndex + 1,
            settings: section.settings || {},
            created_at: currentTime,
            updated_at: currentTime,
          }

          const { data: savedSection, error: sectionError } = await supabase
            .from("form_sections")
            .insert(sectionData)
            .select()
            .single()

          if (sectionError) throw sectionError

          // Ensure fields is an array
          const fields = Array.isArray(section.fields) ? section.fields : []

          // Save fields for this section
          for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
            const field = fields[fieldIndex]

            const fieldData = {
              id: field.id,
              section_id: savedSection.id,
              field_type: field.field_type,
              label: field.label || "Untitled Field",
              placeholder: field.placeholder || "",
              help_text: field.help_text || "",
              required: field.required || false,
              width: field.width || "full",
              field_order: fieldIndex + 1,
              options: Array.isArray(field.options) ? field.options : [],
              validation: field.validation || {},
              conditional_visibility: field.conditional_visibility || {},
              calculated_config: field.calculated_config || {},
              lookup_config: field.lookup_config || {},
              metadata: field.metadata || {},
              created_at: currentTime,
              updated_at: currentTime,
            }

            const { error: fieldError } = await supabase.from("form_fields").insert(fieldData)
            if (fieldError) throw fieldError
          }
        }
      }

      // Update the form structure with the saved form
      setFormStructure((prev) => (prev ? { ...prev, form: savedForm } : null))

      toast({
        title: "Success",
        description: "Form saved successfully",
      })

      onSave?.(savedForm)
    } catch (error) {
      console.error("Error saving form:", error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save form",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return {
    formStructure,
    setFormStructure,
    setInitialFormStructure,
    loading,
    saving,
    saveForm,
  }
}

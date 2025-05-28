"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import type { FormStructure } from "@/lib/database-types"
import { useToast } from "@/hooks/use-toast"

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

      setFormStructure({
        form,
        pages: pages || [],
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

      // Save form
      const formData = {
        id: formStructure.form.id,
        title: formStructure.form.title,
        description: formStructure.form.description,
        form_type: formStructure.form.form_type,
        version: formStructure.form.version,
        status: formStructure.form.status,
        created_by: user.id,
        tags: formStructure.form.tags,
        settings: formStructure.form.settings,
        metadata: formStructure.form.metadata,
        updated_at: new Date().toISOString(),
        ...(formStructure.form.created_at ? {} : { created_at: new Date().toISOString() }),
      }

      const { data: savedForm, error: formError } = await supabase.from("forms").upsert(formData).select().single()
      if (formError) throw formError

      // Save pages, sections, and fields
      for (const page of formStructure.pages) {
        const { data: savedPage, error: pageError } = await supabase
          .from("form_pages")
          .upsert({
            id: page.id,
            form_id: savedForm.id,
            title: page.title,
            description: page.description,
            page_order: page.page_order,
            settings: page.settings,
          })
          .select()
          .single()

        if (pageError) throw pageError

        for (const section of page.sections) {
          const { data: savedSection, error: sectionError } = await supabase
            .from("form_sections")
            .upsert({
              id: section.id,
              page_id: savedPage.id,
              title: section.title,
              description: section.description,
              section_order: section.section_order,
              settings: section.settings,
            })
            .select()
            .single()

          if (sectionError) throw sectionError

          for (let i = 0; i < section.fields.length; i++) {
            const field = section.fields[i]
            const { error: fieldError } = await supabase.from("form_fields").upsert({
              id: field.id,
              section_id: savedSection.id,
              field_type: field.field_type,
              label: field.label,
              placeholder: field.placeholder || "",
              help_text: field.help_text || "",
              required: field.required || false,
              width: field.width || "full",
              field_order: i + 1,
              options: Array.isArray(field.options) && field.options.length > 0 ? field.options : [],
              validation: field.validation || {}, // Ensure it's always an object
              conditional_visibility: field.conditional_visibility || {},
              calculated_config: field.calculated_config || {},
              lookup_config: field.lookup_config || {},
              metadata: field.metadata || {},
            })

            if (fieldError) throw fieldError
          }
        }
      }

      setFormStructure((prev) => (prev ? { ...prev, form: savedForm } : null))
      toast({ title: "Success", description: "Form saved successfully" })
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

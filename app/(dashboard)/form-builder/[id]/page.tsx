"use client"

import { FormBuilderV2 } from "@/components/form-builder/form-builder-v2"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useFormContext } from "@/hooks/use-form-context"
import { DatabaseService } from "@/lib/database-service"
import type { Form } from "@/lib/database-types"

export default function FormBuilderEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const formId = params.id
  const { setCurrentForm, currentForm } = useFormContext()

  useEffect(() => {
    const loadForm = async () => {
      if (formId !== "new") {
        try {
          const form = await DatabaseService.getForm(formId)
          if (form) {
            setCurrentForm(form)
          }
        } catch (error) {
          console.error("Error loading form:", error)
        }
      } else {
        setCurrentForm({ id: "new", title: "New Form" } as Form)
      }
    }

    loadForm()

    // Cleanup
    return () => {
      setCurrentForm(null)
    }
  }, [formId, setCurrentForm])

  const handleSave = async (form: Form) => {
    console.log("Form saved:", form)
    try {
      // Validate form ID
      if (!form.id || form.id === "" || form.id === "new") {
        form.id = crypto.randomUUID()
        console.log("Generated new form ID:", form.id)
      }

      // First update the current form in memory
      setCurrentForm(form)

      // Then persist the entire form structure to the database
      if (formId !== "new") {
        // For existing forms, save the complete structure
        // Ensure all pages, sections, and fields have valid IDs
        const formStructure = {
          form,
          pages: (currentForm?.pages || []).map((page) => {
            // Ensure page has a valid ID
            const pageId = !page.id || page.id === "" ? crypto.randomUUID() : page.id

            return {
              ...page,
              id: pageId,
              sections: (page.sections || []).map((section) => {
                // Ensure section has a valid ID
                const sectionId = !section.id || section.id === "" ? crypto.randomUUID() : section.id

                return {
                  ...section,
                  id: sectionId,
                  fields: (section.fields || []).map((field) => {
                    // Ensure field has a valid ID
                    const fieldId = !field.id || field.id === "" ? crypto.randomUUID() : field.id

                    return {
                      ...field,
                      id: fieldId,
                    }
                  }),
                }
              }),
            }
          }),
          rules: currentForm?.rules || [],
        }

        await DatabaseService.saveFormStructure(formStructure)
      } else {
        // For new forms, create a new form first
        const newForm = await DatabaseService.createForm(form)
        setCurrentForm(newForm)
        // Redirect to the new form's edit page
        router.push(`/form-builder/${newForm.id}`)
      }
    } catch (error) {
      console.error("Error saving form:", error)
    }
  }

  return <FormBuilderV2 formId={formId === "new" ? "new" : formId} onSave={handleSave} />
}

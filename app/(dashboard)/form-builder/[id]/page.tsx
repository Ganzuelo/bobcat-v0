"use client"

import { FormBuilderV2 } from "@/components/form-builder/form-builder-v2"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useFormContext } from "@/hooks/use-form-context"
import { DatabaseService } from "@/lib/database-service"
import type { Form } from "@/lib/database-types"
import { toast } from "@/components/ui/use-toast"

// Utility function to validate and generate UUIDs
function ensureValidUUID(id: string | undefined | null): string {
  if (!id || id === "" || id === "new" || id === "undefined" || id === "null") {
    return crypto.randomUUID()
  }
  return id
}

export default function FormBuilderEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const formId = params.id
  const { setCurrentForm, currentForm } = useFormContext()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadForm = async () => {
      setIsLoading(true)
      if (formId !== "new") {
        try {
          console.log("Loading form:", formId)
          const form = await DatabaseService.getForm(formId)
          if (form) {
            console.log("Form loaded successfully:", form.id)
            setCurrentForm(form)
          }
        } catch (error) {
          console.error("Error loading form:", error)
          toast({
            title: "Error Loading Form",
            description: "There was a problem loading the form. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        console.log("Creating new form")
        setCurrentForm({
          id: "new",
          title: "New Form",
          description: "",
          status: "draft",
          settings: {},
        } as Form)
      }
      setIsLoading(false)
    }

    loadForm()

    // Cleanup
    return () => {
      setCurrentForm(null)
    }
  }, [formId, setCurrentForm])

  const handleSave = async (form: Form) => {
    console.log("Saving form:", form?.id)
    setIsSaving(true)

    try {
      // Validate form ID and ensure it's a valid UUID
      const validFormId = ensureValidUUID(form.id)
      form.id = validFormId

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
            const pageId = ensureValidUUID(page.id)

            return {
              ...page,
              id: pageId,
              sections: (page.sections || []).map((section) => {
                // Ensure section has a valid ID
                const sectionId = ensureValidUUID(section.id)

                return {
                  ...section,
                  id: sectionId,
                  fields: (section.fields || []).map((field) => {
                    // Ensure field has a valid ID
                    const fieldId = ensureValidUUID(field.id)

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
        toast({
          title: "Form Saved",
          description: "Your form has been saved successfully.",
        })
      } else {
        // For new forms, create a new form first
        const newForm = await DatabaseService.createForm(form)
        setCurrentForm(newForm)
        // Redirect to the new form's edit page
        toast({
          title: "Form Created",
          description: "Your new form has been created successfully.",
        })
        router.push(`/form-builder/${newForm.id}`)
      }
    } catch (error) {
      console.error("Error saving form:", error)
      toast({
        title: "Error Saving Form",
        description: error.message || "There was a problem saving the form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading form...</p>
        </div>
      </div>
    )
  }

  return <FormBuilderV2 formId={formId === "new" ? "new" : formId} onSave={handleSave} isSaving={isSaving} />
}

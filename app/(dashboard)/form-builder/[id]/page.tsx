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
      // First update the current form in memory
      setCurrentForm(form)

      // Then persist the entire form structure to the database
      if (formId !== "new") {
        // For existing forms, save the complete structure
        await DatabaseService.saveFormStructure({
          form,
          pages: currentForm?.pages || [],
          rules: currentForm?.rules || [],
        })
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

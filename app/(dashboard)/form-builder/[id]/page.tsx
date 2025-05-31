"use client"

import { FormBuilderV2 } from "@/components/form-builder/form-builder-v2"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useFormContext } from "@/hooks/use-form-context"
import { DatabaseService } from "@/lib/database-service"
import type { Form } from "@/lib/database-types"
import { toast } from "@/components/ui/use-toast"

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
      // Create a deep copy of the form to avoid modifying the original
      const formCopy = JSON.parse(JSON.stringify(form))

      // Create a clean form structure with valid UUIDs
      const formStructure = {
        form: formCopy,
        pages: currentForm?.pages || [],
        rules: currentForm?.rules || [],
      }

      // Save the form structure
      const savedStructure = await DatabaseService.saveFormStructure(formStructure)

      // Update the current form with the saved structure
      setCurrentForm({
        ...savedStructure.form,
        pages: savedStructure.pages,
        rules: savedStructure.rules,
      })

      toast({
        title: "Form Saved",
        description: "Your form has been saved successfully.",
      })

      // If this was a new form, redirect to the edit page
      if (formId === "new") {
        router.push(`/form-builder/${savedStructure.form.id}`)
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

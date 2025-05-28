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
  const { setCurrentForm } = useFormContext()

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

  const handleSave = (form: Form) => {
    console.log("Form saved:", form)
    setCurrentForm(form)
  }

  return <FormBuilderV2 formId={formId === "new" ? "new" : formId} onSave={handleSave} />
}

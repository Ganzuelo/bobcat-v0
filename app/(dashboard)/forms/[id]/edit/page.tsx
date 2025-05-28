"use client"

import { FormBuilder } from "@/components/form-builder/form-builder"
import { useRouter } from "next/navigation"
import type { Form } from "@/lib/database-types"

interface FormEditPageProps {
  params: {
    id: string
  }
}

export default function FormEditPage({ params }: FormEditPageProps) {
  const router = useRouter()

  const handleSave = (form: Form) => {
    // Show success message
    console.log("Form saved:", form)
    // Optionally redirect or show success state
  }

  return <FormBuilder formId={params.id === "new" ? undefined : params.id} onSave={handleSave} />
}

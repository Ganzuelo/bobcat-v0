"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Form } from "@/lib/database-types"

interface FormContextType {
  currentForm: Form | null
  setCurrentForm: (form: Form | null) => void
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export function FormProvider({ children }: { children: ReactNode }) {
  const [currentForm, setCurrentForm] = useState<Form | null>(null)

  return <FormContext.Provider value={{ currentForm, setCurrentForm }}>{children}</FormContext.Provider>
}

export function useFormContext() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider")
  }
  return context
}

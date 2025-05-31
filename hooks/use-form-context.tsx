"use client"

import type React from "react"

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react"

export interface FormStructure {
  form: any
  pages: any[]
  rules: any
}

interface FormContextProps {
  currentForm: FormStructure | null
  setCurrentForm: Dispatch<SetStateAction<FormStructure | null>>
  updateFormStructure: (updatedStructure: Partial<FormStructure>) => void
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

const FormContext = createContext<FormContextProps | undefined>(undefined)

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentForm, setCurrentForm] = useState<FormStructure | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const updateFormStructure = (updatedStructure: Partial<FormStructure>) => {
    setCurrentForm((prev) => {
      if (!prev) return null
      return {
        ...prev,
        ...updatedStructure,
        form: {
          ...prev.form,
          ...(updatedStructure.form || {}),
        },
        pages: updatedStructure.pages || prev.pages,
        rules: updatedStructure.rules || prev.rules,
      }
    })
  }

  const contextValue = {
    currentForm,
    setCurrentForm,
    updateFormStructure,
    isLoading,
    setIsLoading,
  }

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>
}

export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider")
  }
  return context
}

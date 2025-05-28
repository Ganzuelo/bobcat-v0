"use client"

import type React from "react"

import { useState } from "react"
import type { FormField, FormStructure } from "@/lib/form-types"
import type { FieldType } from "@/lib/database-types"
import { createNewField } from "@/lib/form-builder-utils"
import { useToast } from "@/hooks/use-toast"

export function useFieldOperations(
  formStructure: FormStructure | null,
  setFormStructure: React.Dispatch<React.SetStateAction<FormStructure | null>>,
) {
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [originalField, setOriginalField] = useState<FormField | null>(null)
  const { toast } = useToast()

  const addField = (sectionId: string, fieldType: FieldType) => {
    console.log("=== ADD FIELD DEBUG ===")
    console.log("sectionId:", sectionId)
    console.log("fieldType:", fieldType)
    console.log("formStructure:", formStructure)

    if (!formStructure) {
      console.log("No form structure available")
      return
    }

    const section = formStructure.pages.flatMap((page) => page.sections).find((s) => s.id === sectionId)
    console.log("Found section:", section)

    if (!section) {
      console.log("Section not found!")
      return
    }

    const nextOrder = section ? section.fields.length + 1 : 1
    console.log("Next order:", nextOrder)

    const newField = createNewField(sectionId, fieldType, nextOrder) as FormField
    console.log("Created new field:", newField)

    setFormStructure((prev) =>
      prev
        ? {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              sections: page.sections.map((section) =>
                section.id === sectionId ? { ...section, fields: [...section.fields, newField] } : section,
              ),
            })),
          }
        : null,
    )

    setSelectedField(newField)
    setOriginalField(JSON.parse(JSON.stringify(newField)))

    console.log("Field added successfully")
    toast({ title: "Success", description: `${fieldType} field added successfully` })
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!formStructure) return

    setFormStructure((prev) =>
      prev
        ? {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              sections: page.sections.map((section) => ({
                ...section,
                fields: section.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
              })),
            })),
          }
        : null,
    )

    if (selectedField?.id === fieldId) {
      setSelectedField((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const deleteField = (fieldId: string) => {
    if (!formStructure) return

    setFormStructure((prev) =>
      prev
        ? {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              sections: page.sections.map((section) => ({
                ...section,
                fields: section.fields.filter((field) => field.id !== fieldId),
              })),
            })),
          }
        : null,
    )

    if (selectedField?.id === fieldId) {
      setSelectedField(null)
      setOriginalField(null)
    }
  }

  const editField = (field: FormField) => {
    setSelectedField(field)
    setOriginalField(JSON.parse(JSON.stringify(field)))
  }

  const saveFieldChanges = () => {
    if (!selectedField) return
    toast({ title: "Success", description: "Field updated successfully" })
    setSelectedField(null)
    setOriginalField(null)
  }

  const resetField = () => {
    if (!originalField) return
    updateField(originalField.id, originalField)
  }

  const cancelFieldEdit = () => {
    setSelectedField(null)
    setOriginalField(null)
  }

  const moveFieldUp = (fieldId: string) => {
    if (!formStructure) return

    setFormStructure((prev) => {
      if (!prev) return null

      return {
        ...prev,
        pages: prev.pages.map((page) => ({
          ...page,
          sections: page.sections.map((section) => {
            const fieldIndex = section.fields.findIndex((f) => f.id === fieldId)
            if (fieldIndex <= 0) return section

            const newFields = [...section.fields]
            const [field] = newFields.splice(fieldIndex, 1)
            newFields.splice(fieldIndex - 1, 0, field)

            // Update field_order for all fields
            return {
              ...section,
              fields: newFields.map((f, index) => ({ ...f, field_order: index + 1 })),
            }
          }),
        })),
      }
    })
  }

  const moveFieldDown = (fieldId: string) => {
    if (!formStructure) return

    setFormStructure((prev) => {
      if (!prev) return null

      return {
        ...prev,
        pages: prev.pages.map((page) => ({
          ...page,
          sections: page.sections.map((section) => {
            const fieldIndex = section.fields.findIndex((f) => f.id === fieldId)
            if (fieldIndex === -1 || fieldIndex >= section.fields.length - 1) return section

            const newFields = [...section.fields]
            const [field] = newFields.splice(fieldIndex, 1)
            newFields.splice(fieldIndex + 1, 0, field)

            // Update field_order for all fields
            return {
              ...section,
              fields: newFields.map((f, index) => ({ ...f, field_order: index + 1 })),
            }
          }),
        })),
      }
    })
  }

  return {
    selectedField,
    originalField,
    addField,
    updateField,
    deleteField,
    editField,
    saveFieldChanges,
    resetField,
    cancelFieldEdit,
    moveFieldUp,
    moveFieldDown,
  }
}

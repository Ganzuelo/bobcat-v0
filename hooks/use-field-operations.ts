"use client"

import { useState } from "react"
import type { FormStructure, FormField } from "@/lib/database-types"

export function useFieldOperations(
  formStructure: FormStructure | null,
  setFormStructure: (structure: FormStructure) => void,
) {
  const [selectedField, setSelectedField] = useState<FormField | null>(null)

  const addField = (sectionId: string, fieldType: string) => {
    if (!formStructure) return

    const newField: FormField = {
      id: crypto.randomUUID(),
      section_id: sectionId,
      field_type: fieldType,
      label: `New ${fieldType} Field`,
      placeholder: "",
      help_text: "",
      required: false,
      width: "full",
      field_order: 0,
      options: [],
      validation: {},
      conditional_visibility: {},
      calculated_config: {},
      lookup_config: {},
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Add gridConfig for sales_grid fields
      ...(fieldType === "sales_grid" && {
        gridConfig: {
          columns: [
            { id: "address", header: "Address", type: "TEXT", width: 200, required: true },
            { id: "price", header: "Sale Price", type: "NUMBER", width: 120, required: true },
            { id: "date", header: "Sale Date", type: "TEXT", width: 120 },
          ],
          minRows: 1,
          maxRows: 10,
          rowLabel: "Comparable Sale",
        },
      }),
    }

    const updatedPages = formStructure.pages.map((page) => ({
      ...page,
      sections: page.sections?.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: [...(section.fields || []), newField],
            }
          : section,
      ),
    }))

    setFormStructure({
      ...formStructure,
      pages: updatedPages,
    })
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!formStructure) return

    const updatedPages = formStructure.pages.map((page) => ({
      ...page,
      sections: page.sections?.map((section) => ({
        ...section,
        fields: section.fields?.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
      })),
    }))

    setFormStructure({
      ...formStructure,
      pages: updatedPages,
    })
  }

  const deleteField = (fieldId: string) => {
    if (!formStructure) return

    const updatedPages = formStructure.pages.map((page) => ({
      ...page,
      sections: page.sections?.map((section) => ({
        ...section,
        fields: section.fields?.filter((field) => field.id !== fieldId),
      })),
    }))

    setFormStructure({
      ...formStructure,
      pages: updatedPages,
    })

    if (selectedField?.id === fieldId) {
      setSelectedField(null)
    }
  }

  const editField = (field: FormField) => {
    setSelectedField(field)
  }

  const saveFieldChanges = () => {
    setSelectedField(null)
  }

  const resetField = () => {
    // Reset field to original state - for now just close editor
    setSelectedField(null)
  }

  const cancelFieldEdit = () => {
    setSelectedField(null)
  }

  const moveFieldUp = (fieldId: string) => {
    // Implementation for moving field up
    console.log("Move field up:", fieldId)
  }

  const moveFieldDown = (fieldId: string) => {
    // Implementation for moving field down
    console.log("Move field down:", fieldId)
  }

  return {
    selectedField,
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

"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function useFieldOperations(formStructure: any, setFormStructure: any) {
  const [selectedField, setSelectedField] = useState<any>(null)
  const { toast } = useToast()

  const addField = (sectionId: string, fieldType: string) => {
    if (!formStructure) return

    const newField = {
      id: crypto.randomUUID(),
      section_id: sectionId,
      field_type: fieldType,
      label: `New ${fieldType} Field`,
      placeholder: "",
      help_text: "",
      required: false,
      width: "full",
      field_order: 0, // Will be set properly when we find the section
      options: [],
      validation: {},
      conditional_visibility: {},
      calculated_config: {},
      lookup_config: {},
      prefill_config: {},
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedPages = formStructure.pages.map((page: any) => ({
      ...page,
      sections: page.sections?.map((section: any) => {
        if (section.id === sectionId) {
          const currentFields = section.fields || []
          newField.field_order = currentFields.length
          return {
            ...section,
            fields: [...currentFields, newField],
          }
        }
        return section
      }),
    }))

    setFormStructure({
      ...formStructure,
      pages: updatedPages,
    })
  }

  const updateField = (fieldId: string, updates: any) => {
    if (!formStructure) return

    const updatedPages = formStructure.pages.map((page: any) => ({
      ...page,
      sections: page.sections?.map((section: any) => ({
        ...section,
        fields: section.fields?.map((field: any) =>
          field.id === fieldId ? { ...field, ...updates, updated_at: new Date().toISOString() } : field,
        ),
      })),
    }))

    setFormStructure({
      ...formStructure,
      pages: updatedPages,
    })
  }

  const deleteField = (fieldId: string) => {
    if (!formStructure) return

    const updatedPages = formStructure.pages.map((page: any) => ({
      ...page,
      sections: page.sections?.map((section: any) => ({
        ...section,
        fields: section.fields?.filter((field: any) => field.id !== fieldId),
      })),
    }))

    setFormStructure({
      ...formStructure,
      pages: updatedPages,
    })
  }

  const moveFieldUp = (fieldId: string) => {
    if (!formStructure) return

    const updatedPages = formStructure.pages.map((page: any) => ({
      ...page,
      sections: page.sections?.map((section: any) => {
        if (!section.fields) return section

        const fieldIndex = section.fields.findIndex((f: any) => f.id === fieldId)
        if (fieldIndex <= 0) return section

        const newFields = [...section.fields]
        const [movedField] = newFields.splice(fieldIndex, 1)
        newFields.splice(fieldIndex - 1, 0, movedField)

        // Update field_order for all fields
        return {
          ...section,
          fields: newFields.map((field: any, index: number) => ({
            ...field,
            field_order: index,
          })),
        }
      }),
    }))

    setFormStructure({
      ...formStructure,
      pages: updatedPages,
    })
  }

  const moveFieldDown = (fieldId: string) => {
    if (!formStructure) return

    const updatedPages = formStructure.pages.map((page: any) => ({
      ...page,
      sections: page.sections?.map((section: any) => {
        if (!section.fields) return section

        const fieldIndex = section.fields.findIndex((f: any) => f.id === fieldId)
        if (fieldIndex === -1 || fieldIndex >= section.fields.length - 1) return section

        const newFields = [...section.fields]
        const [movedField] = newFields.splice(fieldIndex, 1)
        newFields.splice(fieldIndex + 1, 0, movedField)

        // Update field_order for all fields
        return {
          ...section,
          fields: newFields.map((field: any, index: number) => ({
            ...field,
            field_order: index,
          })),
        }
      }),
    }))

    setFormStructure({
      ...formStructure,
      pages: updatedPages,
    })
  }

  const editField = (field: any) => {
    setSelectedField(field)
  }

  const saveFieldChanges = async (fieldId: string, changes: any) => {
    try {
      updateField(fieldId, changes)
      setSelectedField(null)

      toast({
        title: "Field Updated",
        description: "Field changes have been saved",
      })
    } catch (error) {
      console.error("Error saving field changes:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save field changes",
        variant: "destructive",
      })
    }
  }

  const resetField = () => {
    setSelectedField(null)
  }

  const cancelFieldEdit = () => {
    setSelectedField(null)
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

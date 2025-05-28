"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Save } from "lucide-react"
import { useFormBuilder } from "@/hooks/use-form-builder"
import { useFieldOperations } from "@/hooks/use-field-operations"
import { FieldPalette } from "./field-palette"
import { FormCanvas } from "./form-canvas"
import { FormPreview } from "./form-preview"
import { FieldEditor } from "./field-editor"
import { EnhancedFormImportExport } from "./enhanced-form-import-export"
import { useToast } from "@/hooks/use-toast"
import { showErrorToast } from "@/lib/error-toast-utils"
import type { Form, FormStructure } from "@/lib/database-types"

interface FormBuilderProps {
  formId?: string
  onSave?: (form: Form) => void
}

export function FormBuilderV2({ formId, onSave }: FormBuilderProps) {
  const [previewMode, setPreviewMode] = useState(false)
  const { formStructure, setFormStructure, loading, saving, saveForm } = useFormBuilder(formId)
  const {
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
  } = useFieldOperations(formStructure, setFormStructure)
  const { toast } = useToast()

  const handleSaveForm = () => {
    saveForm(onSave)
  }

  const handleAddField = (fieldType: any) => {
    console.log("=== HANDLE ADD FIELD ===")
    console.log("fieldType:", fieldType)
    console.log("formStructure:", formStructure)

    if (!formStructure) {
      console.log("No form structure")
      showErrorToast(toast, "Error", "No form structure available")
      return
    }

    if (!formStructure.pages || formStructure.pages.length === 0) {
      console.log("No pages in form structure")
      showErrorToast(toast, "Error", "No pages available in the form")
      return
    }

    const currentPage = formStructure.pages[0]
    if (!currentPage.sections || currentPage.sections.length === 0) {
      console.log("No sections in current page")
      showErrorToast(toast, "Error", "No sections available in the current page")
      return
    }

    const currentSection = currentPage.sections[0]
    console.log("Current section:", currentSection)

    if (currentSection) {
      addField(currentSection.id, fieldType)
    } else {
      console.log("Current section is null")
      showErrorToast(toast, "Error", "No section available to add field to")
    }
  }

  const handleAddPage = (pageData: { title: string; description?: string }) => {
    if (!formStructure) {
      showErrorToast(toast, "Error", "No form structure available")
      return
    }

    const newPageId = crypto.randomUUID()
    const newSectionId = crypto.randomUUID()

    const newPage = {
      id: newPageId,
      form_id: formStructure.form.id,
      title: pageData.title,
      description: pageData.description || "",
      page_order: formStructure.pages.length,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sections: [
        {
          id: newSectionId,
          page_id: newPageId,
          title: "Section 1",
          description: "",
          section_order: 0,
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          fields: [],
        },
      ],
    }

    const updatedFormStructure = {
      ...formStructure,
      pages: [...formStructure.pages, newPage],
    }

    setFormStructure(updatedFormStructure)

    toast({
      title: "✅ Page Added",
      description: `Added "${pageData.title}" to your form`,
    })
  }

  const handleAddSection = (sectionData: { title: string; description?: string }) => {
    if (!formStructure || !formStructure.pages || formStructure.pages.length === 0) {
      showErrorToast(toast, "Error", "No pages available. Please add a page first.")
      return
    }

    const currentPage = formStructure.pages[0] // Add to first page for now
    const newSectionId = crypto.randomUUID()

    const newSection = {
      id: newSectionId,
      page_id: currentPage.id,
      title: sectionData.title,
      description: sectionData.description || "",
      section_order: currentPage.sections?.length || 0,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fields: [],
    }

    const updatedPages = formStructure.pages.map((page) =>
      page.id === currentPage.id ? { ...page, sections: [...(page.sections || []), newSection] } : page,
    )

    const updatedFormStructure = {
      ...formStructure,
      pages: updatedPages,
    }

    setFormStructure(updatedFormStructure)

    toast({
      title: "✅ Section Added",
      description: `Added "${sectionData.title}" to ${currentPage.title}`,
    })
  }

  const handleImport = (importedForm: FormStructure) => {
    console.log("🔄 Applying imported form to builder...")
    setFormStructure(importedForm)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!formStructure) {
    return <div className="flex items-center justify-center h-64">No form data</div>
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <h1 className="text-xl font-semibold">{formStructure.form.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">Form Builder</p>
        </div>
        <div className="flex gap-2">
          <EnhancedFormImportExport formStructure={formStructure} onImport={handleImport} />
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? "Exit Preview" : "Preview"}
          </Button>
          <Button onClick={handleSaveForm} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Builder Palette - Hide in preview mode */}
        {!previewMode && (
          <FieldPalette onAddField={handleAddField} onAddPage={handleAddPage} onAddSection={handleAddSection} />
        )}

        {/* Main Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          {previewMode ? (
            <FormPreview formStructure={formStructure} />
          ) : (
            <FormCanvas
              formStructure={formStructure}
              onEditField={editField}
              onDeleteField={deleteField}
              onMoveFieldUp={moveFieldUp}
              onMoveFieldDown={moveFieldDown}
            />
          )}
        </div>

        {/* Field Editor Panel */}
        {selectedField && !previewMode && (
          <FieldEditor
            field={selectedField}
            onUpdateField={updateField}
            onSave={saveFieldChanges}
            onReset={resetField}
            onCancel={cancelFieldEdit}
          />
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { DndContext, type DragEndEvent, type DragStartEvent, closestCenter, DragOverlay } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Save, Settings, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatabaseService } from "@/lib/database-service"
import { FieldPalette } from "./field-palette"
import { FormCanvas } from "./form-canvas"
import { FormPreview } from "./form-preview"
import { PageNavigation } from "./page-navigation"
import { FieldEditor } from "./field-editor"
import { SectionEditor } from "./section-editor"
import { FormSettingsPanel } from "./form-settings-panel"
import type { Form, FormStructure, FieldType, FieldWidth } from "@/lib/database-types"
import type { FormField, FormSection, FormPage } from "@/lib/form-types"
import { useToast } from "@/hooks/use-toast"

interface FormBuilderProps {
  formId?: string
  onSave?: (form: Form) => void
}

export function FormBuilder({ formId, onSave }: FormBuilderProps) {
  const [formStructure, setFormStructure] = useState<FormStructure | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("design")
  const [previewMode, setPreviewMode] = useState(false)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [selectedSection, setSelectedSection] = useState<FormSection | null>(null)
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    console.log("FormBuilder mounted with formId:", formId)
    if (formId) {
      loadForm()
    } else {
      initializeNewForm()
    }
  }, [formId])

  const initializeNewForm = () => {
    console.log("Initializing new form")
    const newFormStructure: FormStructure = {
      form: {
        id: crypto.randomUUID(),
        title: "New Form",
        description: "",
        form_type: "custom",
        version: 1,
        status: "draft",
        created_by: "",
        tags: [],
        settings: {},
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      pages: [
        {
          id: crypto.randomUUID(),
          form_id: "",
          title: "Page 1",
          description: "",
          page_order: 1,
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sections: [],
        },
      ],
      rules: [],
    }
    setFormStructure(newFormStructure)
    console.log("New form structure created:", newFormStructure)
  }

  const loadForm = async () => {
    if (!formId) return

    console.log("Loading form with ID:", formId)
    setLoading(true)
    setError(null)

    try {
      const structure = await DatabaseService.getFormStructure(formId)
      console.log("Loaded form structure:", structure)
      setFormStructure(structure)
    } catch (error) {
      console.error("Error loading form:", error)
      setError(error instanceof Error ? error.message : "Failed to load form")
      toast({
        title: "Error",
        description: "Failed to load form",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (updates: Partial<Form>) => {
    console.log("Updating form with:", updates)
    if (!formStructure) return

    setFormStructure((prev) =>
      prev
        ? {
            ...prev,
            form: { ...prev.form, ...updates, updated_at: new Date().toISOString() },
          }
        : null,
    )
  }

  const saveForm = async () => {
    console.log("Save form clicked")

    if (!formStructure) {
      console.error("No form structure to save")
      toast({
        title: "Error",
        description: "No form data to save",
        variant: "destructive",
      })
      return
    }

    // Basic validation
    if (!formStructure.form.title.trim()) {
      console.error("Form title is required")
      toast({
        title: "Validation Error",
        description: "Form title is required",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    setError(null)

    try {
      console.log("Getting current user...")
      // Get current user ID
      const userId = await DatabaseService.getCurrentUserId()
      console.log("Current user ID:", userId)

      if (!userId) {
        throw new Error("You must be logged in to save forms")
      }

      let savedForm: Form

      if (formId && formStructure.form.created_at) {
        console.log("Updating existing form...")
        // Update existing form
        savedForm = await DatabaseService.updateForm(formId, {
          ...formStructure.form,
          updated_at: new Date().toISOString(),
        })
        console.log("Form updated successfully:", savedForm)

        toast({
          title: "Success",
          description: "Form updated successfully",
        })
      } else {
        console.log("Creating new form...")
        // Create new form
        const formToCreate = {
          ...formStructure.form,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        console.log("Form data to create:", formToCreate)

        savedForm = await DatabaseService.createForm(formToCreate)
        console.log("Form created successfully:", savedForm)

        toast({
          title: "Success",
          description: "Form created successfully",
        })
      }

      // Update the form structure with the saved form data
      setFormStructure((prev) => (prev ? { ...prev, form: savedForm } : null))

      onSave?.(savedForm)
    } catch (error) {
      console.error("Error saving form:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save form. Please try again."
      setError(errorMessage)
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addPage = () => {
    if (!formStructure) return

    const newPage: FormPage & { sections: (FormSection & { fields: FormField[] })[] } = {
      id: crypto.randomUUID(),
      form_id: formStructure.form.id,
      title: `Page ${formStructure.pages.length + 1}`,
      description: "",
      page_order: formStructure.pages.length + 1,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sections: [],
    }

    setFormStructure((prev) =>
      prev
        ? {
            ...prev,
            pages: [...prev.pages, newPage],
          }
        : null,
    )
  }

  const addSection = (pageId: string) => {
    if (!formStructure) return

    const page = formStructure.pages.find((p) => p.id === pageId)
    if (!page) return

    const newSection: FormSection & { fields: FormField[] } = {
      id: crypto.randomUUID(),
      page_id: pageId,
      title: `Section ${page.sections.length + 1}`,
      description: "",
      section_order: page.sections.length + 1,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fields: [],
    }

    setFormStructure((prev) =>
      prev
        ? {
            ...prev,
            pages: prev.pages.map((p) => (p.id === pageId ? { ...p, sections: [...p.sections, newSection] } : p)),
          }
        : null,
    )
  }

  const addField = (sectionId: string, fieldType: FieldType, width: FieldWidth = "full") => {
    if (!formStructure) return

    const section = formStructure.pages.flatMap((p) => p.sections).find((s) => s.id === sectionId)
    if (!section) return

    const newField: FormField = {
      id: crypto.randomUUID(),
      section_id: sectionId,
      field_type: fieldType,
      label: `New ${fieldType} field`,
      placeholder: "",
      help_text: "",
      required: false,
      width,
      field_order: section.fields.length + 1,
      options: fieldType === "select" || fieldType === "radio" || fieldType === "checkbox" ? [] : undefined,
      validation: [],
      conditional_visibility: { enabled: false },
      calculated_config: { enabled: false },
      lookup_config: { enabled: false, dataSource: "static" },
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setFormStructure((prev) =>
      prev
        ? {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              sections: page.sections.map((s) => (s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s)),
            })),
          }
        : null,
    )

    // Auto-select the new field for editing
    setSelectedField(newField)
    setSelectedSection(null)
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
                fields: section.fields.map((field) =>
                  field.id === fieldId ? { ...field, ...updates, updated_at: new Date().toISOString() } : field,
                ),
              })),
            })),
          }
        : null,
    )

    // Update selected field if it's the one being updated
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
    }
  }

  const duplicateField = (fieldId: string) => {
    if (!formStructure) return

    const field = formStructure.pages
      .flatMap((p) => p.sections)
      .flatMap((s) => s.fields)
      .find((f) => f.id === fieldId)

    if (!field) return

    const duplicatedField: FormField = {
      ...field,
      id: crypto.randomUUID(),
      label: `${field.label} (Copy)`,
      field_order: field.field_order + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setFormStructure((prev) =>
      prev
        ? {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              sections: page.sections.map((section) => ({
                ...section,
                fields: section.fields.includes(field)
                  ? [
                      ...section.fields.slice(0, field.field_order),
                      duplicatedField,
                      ...section.fields.slice(field.field_order),
                    ]
                  : section.fields,
              })),
            })),
          }
        : null,
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedItem(event.active.data.current)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Handle field type drag from palette
    if (activeData?.type === "field-type" && overData?.type === "section") {
      addField(overData.sectionId, activeData.fieldType, "full")
    }

    setDraggedItem(null)
  }

  // Get all available fields for conditional logic and calculations
  const getAllFields = (): FormField[] => {
    if (!formStructure) return []
    return formStructure.pages.flatMap((page) => page.sections.flatMap((section) => section.fields))
  }

  const currentPage = formStructure?.pages[currentPageIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading form...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!formStructure) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>No form data available</p>
      </div>
    )
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold">{formStructure.form.title}</h1>
              <p className="text-sm text-muted-foreground">
                Form Builder {formStructure.form.status && `• ${formStructure.form.status}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={previewMode} onCheckedChange={setPreviewMode} />
              <Label htmlFor="preview-mode" className="text-sm">
                Preview Mode
              </Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab("settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button onClick={saveForm} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Form"}
            </Button>
          </div>
        </div>

        {/* Page Navigation */}
        {!previewMode && (
          <PageNavigation
            pages={formStructure.pages}
            currentPageIndex={currentPageIndex}
            onPageChange={setCurrentPageIndex}
            onAddPage={addPage}
          />
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Field Palette Sidebar */}
          {!previewMode && (
            <div className="w-80 border-r bg-gray-50 overflow-y-auto">
              <FieldPalette />
            </div>
          )}

          {/* Main Canvas */}
          <div className="flex-1 overflow-y-auto">
            {previewMode ? (
              <FormPreview formStructure={formStructure} currentPageIndex={currentPageIndex} />
            ) : (
              <FormCanvas
                page={currentPage}
                onAddSection={addSection}
                onSelectField={setSelectedField}
                onSelectSection={setSelectedSection}
                onUpdateField={updateField}
                onDeleteField={deleteField}
                onDuplicateField={duplicateField}
              />
            )}
          </div>

          {/* Properties Panel */}
          {!previewMode && (
            <div className="w-80 border-l bg-white overflow-y-auto">
              {selectedField ? (
                <FieldEditor
                  field={selectedField}
                  availableFields={getAllFields().filter((f) => f.id !== selectedField.id)}
                  onUpdate={(updates) => updateField(selectedField.id, updates)}
                  onClose={() => setSelectedField(null)}
                />
              ) : selectedSection ? (
                <SectionEditor
                  section={selectedSection}
                  onUpdate={(updates) => {
                    // Implement section update logic
                  }}
                  onClose={() => setSelectedSection(null)}
                />
              ) : (
                <FormSettingsPanel form={formStructure.form} onUpdate={updateForm} />
              )}
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {draggedItem && (
          <div className="bg-white border rounded-lg p-2 shadow-lg">
            <Badge variant="secondary">{draggedItem.fieldType || draggedItem.type}</Badge>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

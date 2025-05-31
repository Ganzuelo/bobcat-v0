"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Save, Settings, FilePlus, LayoutTemplate, Download, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { FormStructure } from "@/lib/database-types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Import components
import { FieldPalette } from "./field-palette"
import { FormCanvas } from "./form-canvas"
import { FormPreview } from "./form-preview"
import { PageNavigation } from "./page-navigation"
import { FormSettingsModal } from "./form-settings-modal"
import { FieldPropertiesModal } from "./field-properties-modal"
import { EditPageModal } from "./edit-page-modal"
import { EditSectionModal } from "./edit-section-modal"
import { useFieldOperations } from "@/hooks/use-field-operations"

interface FormBuilderProps {
  formId?: string
  onSave?: (form: any) => void
}

export function FormBuilderV2({ formId, onSave }: FormBuilderProps) {
  const [previewMode, setPreviewMode] = useState(false)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [fieldPropertiesModal, setFieldPropertiesModal] = useState<{
    isOpen: boolean
    field: any | null
  }>({
    isOpen: false,
    field: null,
  })

  // Add state for page and section editing
  const [editPageModal, setEditPageModal] = useState<{
    isOpen: boolean
    page: any | null
  }>({
    isOpen: false,
    page: null,
  })

  const [editSectionModal, setEditSectionModal] = useState<{
    isOpen: boolean
    section: any | null
  }>({
    isOpen: false,
    section: null,
  })

  const { toast } = useToast()

  // Initialize form structure
  const [formStructure, setFormStructure] = useState<FormStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Initialize basic form structure
  useEffect(() => {
    const initializeForm = () => {
      try {
        const basicFormStructure: FormStructure = {
          form: {
            id: formId || crypto.randomUUID(),
            title: "New Form",
            description: "A new form created with the form builder",
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
              form_id: formId || crypto.randomUUID(),
              title: "Page 1",
              description: "",
              page_order: 1,
              settings: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              sections: [
                {
                  id: crypto.randomUUID(),
                  page_id: crypto.randomUUID(),
                  title: "Section 1",
                  description: "",
                  section_order: 1,
                  settings: {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  fields: [],
                },
              ],
            },
          ],
          rules: [],
        }

        setFormStructure(basicFormStructure)
        setLoading(false)
      } catch (error) {
        console.error("Error initializing form:", error)
        setLoading(false)
      }
    }

    initializeForm()
  }, [formId])

  // Use field operations
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

  const handleEditField = (field: any) => {
    setFieldPropertiesModal({
      isOpen: true,
      field,
    })
  }

  const handleCloseFieldProperties = () => {
    setFieldPropertiesModal({
      isOpen: false,
      field: null,
    })
  }

  const handleSaveFieldProperties = (fieldId: string, updates: any) => {
    updateField(fieldId, updates)
    setFieldPropertiesModal({
      isOpen: false,
      field: null,
    })
  }

  // Add handlers for page editing
  const handleEditPage = (page: any) => {
    console.log("🔧 handleEditPage called with:", page)
    setEditPageModal({
      isOpen: true,
      page,
    })
  }

  const handleSavePage = (pageData: { title: string; description?: string }) => {
    console.log("🔧 handleSavePage called with:", pageData)
    console.log("🔧 Current editPageModal.page:", editPageModal.page)
    console.log("🔧 Current formStructure:", formStructure)

    if (!formStructure || !editPageModal.page) {
      console.error("❌ Missing formStructure or editPageModal.page")
      return
    }

    const updatedPages = formStructure.pages.map((page) => {
      if (page.id === editPageModal.page.id) {
        console.log("🔧 Updating page:", page.id, "with new title:", pageData.title)
        return {
          ...page,
          title: pageData.title,
          description: pageData.description || "",
          updated_at: new Date().toISOString(),
        }
      }
      return page
    })

    const newFormStructure = {
      ...formStructure,
      pages: updatedPages,
    }

    console.log("🔧 Setting new form structure:", newFormStructure)
    setFormStructure(newFormStructure)

    setEditPageModal({
      isOpen: false,
      page: null,
    })

    toast({
      title: "Page Updated",
      description: `Page renamed to "${pageData.title}"`,
    })
  }

  // Add handlers for section editing
  const handleEditSection = (section: any) => {
    console.log("🔧 handleEditSection called with:", section)
    setEditSectionModal({
      isOpen: true,
      section,
    })
  }

  const handleSaveSection = (sectionData: { title: string; description?: string }) => {
    console.log("🔧 handleSaveSection called with:", sectionData)
    console.log("🔧 Current editSectionModal.section:", editSectionModal.section)
    console.log("🔧 Current formStructure:", formStructure)

    if (!formStructure || !editSectionModal.section) {
      console.error("❌ Missing formStructure or editSectionModal.section")
      return
    }

    const updatedPages = formStructure.pages.map((page) => ({
      ...page,
      sections: page.sections?.map((section) => {
        if (section.id === editSectionModal.section.id) {
          console.log("🔧 Updating section:", section.id, "with new title:", sectionData.title)
          return {
            ...section,
            title: sectionData.title,
            description: sectionData.description || "",
            updated_at: new Date().toISOString(),
          }
        }
        return section
      }),
    }))

    const newFormStructure = {
      ...formStructure,
      pages: updatedPages,
    }

    console.log("🔧 Setting new form structure:", newFormStructure)
    setFormStructure(newFormStructure)

    setEditSectionModal({
      isOpen: false,
      section: null,
    })

    toast({
      title: "Section Updated",
      description: `Section renamed to "${sectionData.title}"`,
    })
  }

  const getAllFields = () => {
    if (!formStructure) return []

    const allFields: any[] = []
    formStructure.pages.forEach((page) => {
      page.sections?.forEach((section) => {
        if (section.fields) {
          allFields.push(...section.fields)
        }
      })
    })

    return allFields.filter((f) => f.id !== fieldPropertiesModal.field?.id)
  }

  const handleSaveForm = async () => {
    setSaving(true)
    try {
      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Success",
        description: "Form saved successfully",
      })
      onSave?.(formStructure?.form)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddField = (fieldType: string) => {
    console.log("Adding field:", fieldType)

    if (!formStructure?.pages?.[currentPageIndex]?.sections?.[0]) {
      toast({
        title: "Error",
        description: "No section available to add field to",
        variant: "destructive",
      })
      return
    }

    const sectionId = formStructure.pages[currentPageIndex].sections[0].id
    addField(sectionId, fieldType)

    toast({
      title: "Field Added",
      description: `Added ${fieldType} field to the form`,
    })
  }

  const handleAddPage = (pageData: { title: string; description?: string }) => {
    if (!formStructure) return

    const newPageId = crypto.randomUUID()
    const newSectionId = crypto.randomUUID()

    const newPage = {
      id: newPageId,
      form_id: formStructure.form.id,
      title: pageData.title,
      description: pageData.description || "",
      page_order: formStructure.pages.length + 1,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sections: [
        {
          id: newSectionId,
          page_id: newPageId,
          title: "Section 1",
          description: "",
          section_order: 1,
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          fields: [],
        },
      ],
    }

    setFormStructure({
      ...formStructure,
      pages: [...formStructure.pages, newPage],
    })

    setCurrentPageIndex(formStructure.pages.length)

    toast({
      title: "Page Added",
      description: `Added "${pageData.title}" to your form`,
    })
  }

  const handleAddSection = (sectionData: { title: string; description?: string }) => {
    if (!formStructure?.pages?.[currentPageIndex]) return

    const currentPage = formStructure.pages[currentPageIndex]
    const newSectionId = crypto.randomUUID()

    const newSection = {
      id: newSectionId,
      page_id: currentPage.id,
      title: sectionData.title,
      description: sectionData.description || "",
      section_order: (currentPage.sections?.length || 0) + 1,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fields: [],
    }

    const updatedPages = formStructure.pages.map((page) =>
      page.id === currentPage.id ? { ...page, sections: [...(page.sections || []), newSection] } : page,
    )

    setFormStructure({
      ...formStructure,
      pages: updatedPages,
    })

    toast({
      title: "Section Added",
      description: `Added "${sectionData.title}" to ${currentPage.title}`,
    })
  }

  const handleImport = (importedForm: FormStructure) => {
    setFormStructure(importedForm)
    toast({
      title: "Form Imported",
      description: "Form has been imported successfully",
    })
  }

  const handleUpdateForm = (updates: Partial<any>) => {
    if (!formStructure) return

    setFormStructure({
      ...formStructure,
      form: { ...formStructure.form, ...updates },
    })
  }

  const handleReorderPages = (reorderedPages: any[]) => {
    if (!formStructure) return

    const updatedPages = reorderedPages.map((page, index) => ({
      ...page,
      page_order: index + 1,
    }))

    setFormStructure({
      ...formStructure,
      pages: updatedPages,
    })
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading form builder...</div>
      </div>
    )
  }

  // Show error state if no form structure
  if (!formStructure) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Failed to load form structure</div>
      </div>
    )
  }

  const pages = formStructure.pages || []

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <h1 className="text-xl font-semibold">{formStructure.form.title || "Untitled Form"}</h1>
          </div>
        </div>
        <div className="flex gap-1">
          <TooltipProvider>
            {/* Export/Import Dropdown */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export/Import</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    // Handle export - we'll need to extract this from EnhancedFormImportExport
                    const dataStr = JSON.stringify(formStructure, null, 2)
                    const dataBlob = new Blob([dataStr], { type: "application/json" })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement("a")
                    link.href = url
                    link.download = `${formStructure?.form.title || "form"}.json`
                    link.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    // Handle import - trigger file input
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = ".json"
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          try {
                            const importedForm = JSON.parse(e.target?.result as string)
                            handleImport(importedForm)
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Invalid JSON file",
                              variant: "destructive",
                            })
                          }
                        }
                        reader.readAsText(file)
                      }
                    }
                    input.click()
                  }}
                >
                  Import JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>

            {/* Preview Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={previewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    console.log("Preview button clicked, current mode:", previewMode)
                    setPreviewMode(!previewMode)
                  }}
                >
                  {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{previewMode ? "Exit Preview" : "Preview"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Add Section Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => handleAddSection({ title: "New Section" })}>
                  <LayoutTemplate className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Section</p>
              </TooltipContent>
            </Tooltip>

            {/* Add Page Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddPage({ title: `Page ${pages.length + 1}` })}
                >
                  <FilePlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Page</p>
              </TooltipContent>
            </Tooltip>

            {/* Save Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSaveForm} disabled={saving} size="sm">
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{saving ? "Saving..." : "Save Form"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Page Navigation */}
      <PageNavigation
        pages={pages}
        currentPageIndex={currentPageIndex}
        onPageChange={setCurrentPageIndex}
        onAddPage={() => handleAddPage({ title: `Page ${pages.length + 1}` })}
        onReorderPages={handleReorderPages}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Builder Palette - Hide in preview mode */}
        {!previewMode && <FieldPalette onAddField={handleAddField} />}

        {/* Main Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          {previewMode ? (
            <FormPreview formStructure={formStructure} currentPageIndex={currentPageIndex} />
          ) : (
            <FormCanvas
              formStructure={formStructure}
              onEditField={handleEditField}
              onDeleteField={deleteField}
              onMoveFieldUp={moveFieldUp}
              onMoveFieldDown={moveFieldDown}
              onEditPage={handleEditPage}
              onEditSection={handleEditSection}
              currentPageIndex={currentPageIndex}
            />
          )}
        </div>
      </div>

      {/* Form Settings Modal */}
      <FormSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        form={formStructure.form}
        onUpdate={handleUpdateForm}
      />

      {/* Field Properties Modal */}
      <FieldPropertiesModal
        field={fieldPropertiesModal.field}
        isOpen={fieldPropertiesModal.isOpen}
        onClose={handleCloseFieldProperties}
        onSave={handleSaveFieldProperties}
        otherFields={getAllFields()}
      />

      {/* Edit Page Modal */}
      {editPageModal.page && (
        <EditPageModal
          open={editPageModal.isOpen}
          onOpenChange={(open) =>
            setEditPageModal({
              isOpen: open,
              page: open ? editPageModal.page : null,
            })
          }
          page={editPageModal.page}
          onSave={handleSavePage}
        />
      )}

      {/* Edit Section Modal */}
      {editSectionModal.section && (
        <EditSectionModal
          open={editSectionModal.isOpen}
          onOpenChange={(open) =>
            setEditSectionModal({
              isOpen: open,
              section: open ? editSectionModal.section : null,
            })
          }
          section={editSectionModal.section}
          onSave={handleSaveSection}
        />
      )}
    </div>
  )
}

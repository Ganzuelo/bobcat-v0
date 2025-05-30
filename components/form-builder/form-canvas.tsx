"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ChevronUp, ChevronDown, SquarePen } from "lucide-react"
import type { FormStructure, FormField } from "@/lib/form-types"
import { getGridColClass, getWidthLabel } from "@/lib/form-builder-utils"
import { FieldRenderer } from "./field-renderer"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

interface FormCanvasProps {
  formStructure: FormStructure
  currentPageIndex: number
  onEditField: (field: FormField) => void
  onDeleteField: (fieldId: string) => void
  onMoveFieldUp: (fieldId: string) => void
  onMoveFieldDown: (fieldId: string) => void
  onEditPage?: (page: any) => void
  onEditSection?: (section: any) => void
  onUpdatePage?: (pageId: string, updates: { title: string; description?: string }) => void
  onUpdateSection?: (sectionId: string, updates: { title: string; description?: string }) => void
  onDeleteSection?: (sectionId: string) => void
}

export function FormCanvas({
  formStructure,
  currentPageIndex,
  onEditField,
  onDeleteField,
  onMoveFieldUp,
  onMoveFieldDown,
  onEditPage,
  onEditSection,
  onUpdatePage,
  onUpdateSection,
  onDeleteSection,
}: FormCanvasProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: "section" | "page"
    id: string
    title: string
  }>({
    open: false,
    type: "section",
    id: "",
    title: "",
  })

  // Add defensive checks to prevent undefined errors
  if (!formStructure) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              <p>Loading form structure...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!formStructure.pages || formStructure.pages.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              <p>No pages available. Please create a page first.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ensure currentPageIndex is valid
  const safePageIndex = Math.min(Math.max(0, currentPageIndex), formStructure.pages.length - 1)
  const currentPage = formStructure.pages[safePageIndex]

  if (!currentPage) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              <p>Page data not available.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleEditPage = () => {
    console.log("Edit page clicked:", currentPage)
    if (onEditPage) {
      onEditPage(currentPage)
    }
  }

  const handleEditSection = (section: any) => {
    console.log("Edit section clicked:", section)
    if (onEditSection) {
      onEditSection(section)
    }
  }

  const handleDeleteSection = (sectionId: string, sectionTitle: string) => {
    setDeleteDialog({
      open: true,
      type: "section",
      id: sectionId,
      title: sectionTitle || "Untitled Section",
    })
  }

  const confirmDeleteSection = async () => {
    if (onDeleteSection && deleteDialog.id) {
      await onDeleteSection(deleteDialog.id)
    }
    setDeleteDialog({ open: false, type: "section", id: "", title: "" })
  }

  // Helper function to handle field movement
  const handleMoveField = (fieldId: string, direction: "up" | "down") => {
    console.log(`Moving field ${fieldId} ${direction}`)
    if (direction === "up") {
      onMoveFieldUp(fieldId)
    } else {
      onMoveFieldDown(fieldId)
    }
  }

  // Ensure sections is an array
  const sections = Array.isArray(currentPage.sections) ? currentPage.sections : []

  if (sections.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{currentPage.title || "Untitled Page"}</h2>
                {currentPage.description && (
                  <p className="text-sm text-muted-foreground mt-1">{currentPage.description}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleEditPage} title="Edit page">
                <SquarePen className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              <p>No sections available. Please create a section first.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{currentPage.title || "Untitled Page"}</h2>
              {currentPage.description && (
                <p className="text-sm text-muted-foreground mt-1">{currentPage.description}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleEditPage} title="Edit page">
              <SquarePen className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Sections */}
      {sections.map((section) => {
        if (!section) return null

        // Ensure fields is an array
        const fields = Array.isArray(section.fields) ? section.fields : []

        return (
          <Card key={section.id} className="overflow-hidden">
            {/* Section Header */}
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium">{section.title || "Untitled Section"}</h3>
                  </div>
                  {section.description && <p className="text-sm text-muted-foreground mt-1">{section.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {fields.length || 0} fields
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleEditSection(section)} title="Edit section">
                    <SquarePen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSection(section.id, section.title)}
                    title="Delete section"
                    className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              {fields.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  <p>No fields in this section. Add fields from the Builder Palette.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-min">
                  {fields.map((field, index) => {
                    if (!field) return null

                    const gridColClass = getGridColClass(field.width || "full")
                    const isFirst = index === 0
                    const isLast = index === fields.length - 1

                    return (
                      <div key={field.id || `field-${index}`} className={`${gridColClass} min-w-0`}>
                        <Card className="group hover:shadow-md transition-shadow border-2 hover:border-blue-300 h-full">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Field Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{field.label || "Untitled Field"}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {field.field_type || "unknown"}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {getWidthLabel(field.width)}
                                      </Badge>
                                      {field.required && (
                                        <Badge variant="destructive" className="text-xs">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => field.id && handleMoveField(field.id, "up")}
                                    disabled={isFirst || !field.id}
                                    title="Move up"
                                    className="h-8 w-8 p-0"
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => field.id && handleMoveField(field.id, "down")}
                                    disabled={isLast || !field.id}
                                    title="Move down"
                                    className="h-8 w-8 p-0"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditField(field)}
                                    title="Edit field"
                                    disabled={!field}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => field.id && onDeleteField(field.id)}
                                    title="Delete field"
                                    disabled={!field.id}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Field Preview */}
                              <div className="space-y-2">
                                <FieldRenderer field={field} isPreviewMode={false} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title={`Delete ${deleteDialog.type}`}
        description={`Are you sure you want to delete this ${deleteDialog.type}?`}
        itemName={deleteDialog.title}
        onConfirm={confirmDeleteSection}
        variant={deleteDialog.type as "section" | "page"}
      />
    </div>
  )
}

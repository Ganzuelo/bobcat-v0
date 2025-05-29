"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ChevronUp, ChevronDown, Settings, Edit2 } from "lucide-react"
import type { FormStructure, FormField } from "@/lib/form-types"
import { getGridColClass, getWidthLabel } from "@/lib/form-builder-utils"
import { FieldRenderer } from "./field-renderer"
import { EditPageModal } from "./edit-page-modal"
import { EditSectionModal } from "./edit-section-modal"

interface FormCanvasProps {
  formStructure: FormStructure
  currentPageIndex: number
  onEditField: (field: FormField) => void
  onDeleteField: (fieldId: string) => void
  onMoveFieldUp: (fieldId: string) => void
  onMoveFieldDown: (fieldId: string) => void
  onEditSection?: (sectionId: string) => void
  onUpdatePage?: (pageId: string, updates: { title: string; description?: string }) => void
  onUpdateSection?: (sectionId: string, updates: { title: string; description?: string }) => void
}

export function FormCanvas({
  formStructure,
  currentPageIndex,
  onEditField,
  onDeleteField,
  onMoveFieldUp,
  onMoveFieldDown,
  onEditSection,
  onUpdatePage,
  onUpdateSection,
}: FormCanvasProps) {
  const [editPageModal, setEditPageModal] = useState<{ open: boolean; page: any }>({
    open: false,
    page: null,
  })
  const [editSectionModal, setEditSectionModal] = useState<{ open: boolean; section: any }>({
    open: false,
    section: null,
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

  const currentPage = formStructure.pages[currentPageIndex]

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
    setEditPageModal({ open: true, page: currentPage })
  }

  const handleSavePage = (pageData: { title: string; description?: string }) => {
    if (onUpdatePage && currentPage.id) {
      onUpdatePage(currentPage.id, pageData)
    }
  }

  const handleEditSection = (section: any) => {
    setEditSectionModal({ open: true, section })
  }

  const handleSaveSection = (sectionData: { title: string; description?: string }) => {
    if (onUpdateSection && editSectionModal.section?.id) {
      onUpdateSection(editSectionModal.section.id, sectionData)
    }
  }

  if (!currentPage.sections || currentPage.sections.length === 0) {
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
                <Edit2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              <p>No sections available. Please create a section first.</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Page Modal */}
        <EditPageModal
          open={editPageModal.open}
          onOpenChange={(open) => setEditPageModal({ open, page: editPageModal.page })}
          page={editPageModal.page || currentPage}
          onSave={handleSavePage}
        />
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
              <Edit2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Sections */}
      {currentPage.sections.map((section) => {
        if (!section) return null

        return (
          <Card key={section.id} className="overflow-hidden">
            {/* Section Header */}
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium">{section.title || "Untitled Section"}</h3>
                    {onEditSection && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSection(section.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {section.description && <p className="text-sm text-muted-foreground mt-1">{section.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {section.fields?.length || 0} fields
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleEditSection(section)} title="Edit section">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              {!section.fields || section.fields.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  <p>No fields in this section. Add fields from the Builder Palette.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-min">
                  {section.fields.map((field, index) => {
                    if (!field) return null

                    const gridColClass = getGridColClass(field.width || "full")
                    const isFirst = index === 0
                    const isLast = index === section.fields.length - 1

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
                                    onClick={() => field.id && onMoveFieldUp(field.id)}
                                    disabled={isFirst || !field.id}
                                    title="Move up"
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => field.id && onMoveFieldDown(field.id)}
                                    disabled={isLast || !field.id}
                                    title="Move down"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditField(field)}
                                    title="Edit field"
                                    disabled={!field}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => field.id && onDeleteField(field.id)}
                                    title="Delete field"
                                    disabled={!field.id}
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

      {/* Edit Modals */}
      <EditPageModal
        open={editPageModal.open}
        onOpenChange={(open) => setEditPageModal({ open, page: editPageModal.page })}
        page={editPageModal.page || currentPage}
        onSave={handleSavePage}
      />

      <EditSectionModal
        open={editSectionModal.open}
        onOpenChange={(open) => setEditSectionModal({ open, section: editSectionModal.section })}
        section={editSectionModal.section || { title: "", description: "" }}
        onSave={handleSaveSection}
      />
    </div>
  )
}

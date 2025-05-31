"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus } from "lucide-react"
import { SortableField } from "./sortable-field"
import { formSaveService } from "@/lib/form-save-service"
import { useToast } from "@/hooks/use-toast"

interface FormCanvasProps {
  formStructure: any
  onEditField: (field: any) => void
  onDeleteField: (fieldId: string) => void
  onMoveFieldUp: (fieldId: string) => void
  onMoveFieldDown: (fieldId: string) => void
  onEditPage: (page: any) => void
  onEditSection: (section: any) => void
  currentPageIndex: number
}

export function FormCanvas({
  formStructure,
  onEditField,
  onDeleteField,
  onMoveFieldUp,
  onMoveFieldDown,
  onEditPage,
  onEditSection,
  currentPageIndex,
}: FormCanvasProps) {
  const [reorderingSection, setReorderingSection] = useState<string | null>(null)
  const { toast } = useToast()

  if (!formStructure?.pages?.[currentPageIndex]) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No page selected or page not found</p>
      </div>
    )
  }

  const currentPage = formStructure.pages[currentPageIndex]

  const handleFieldReorder = async (sectionId: string, fieldId: string, direction: "up" | "down") => {
    setReorderingSection(sectionId)

    try {
      const section = currentPage.sections?.find((s: any) => s.id === sectionId)
      if (!section?.fields) return

      const currentIndex = section.fields.findIndex((f: any) => f.id === fieldId)
      if (currentIndex === -1) return

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= section.fields.length) return

      // Create new field order
      const reorderedFields = [...section.fields]
      const [movedField] = reorderedFields.splice(currentIndex, 1)
      reorderedFields.splice(newIndex, 0, movedField)

      // Update field_order for all fields
      const fieldIds = reorderedFields.map((field: any) => field.id)

      // Save the new order to database
      const result = await formSaveService.reorderFields(sectionId, fieldIds)

      if (result.success) {
        // Update local state by calling the parent handlers
        if (direction === "up") {
          onMoveFieldUp(fieldId)
        } else {
          onMoveFieldDown(fieldId)
        }

        toast({
          title: "Field Reordered",
          description: "Field order has been updated successfully",
        })
      } else {
        throw new Error(result.errors?.[0] || "Failed to reorder fields")
      }
    } catch (error) {
      console.error("Error reordering field:", error)
      toast({
        title: "Reorder Failed",
        description: error instanceof Error ? error.message : "Failed to reorder field",
        variant: "destructive",
      })
    } finally {
      setReorderingSection(null)
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return

    try {
      onDeleteField(fieldId)
      toast({
        title: "Field Deleted",
        description: "Field has been removed from the form",
      })
    } catch (error) {
      console.error("Error deleting field:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete field",
        variant: "destructive",
      })
    }
  }

  const handleDuplicateField = (fieldId: string) => {
    const section = currentPage.sections?.find((s: any) => s.fields?.some((f: any) => f.id === fieldId))

    if (!section) return

    const field = section.fields.find((f: any) => f.id === fieldId)
    if (!field) return

    // Create a duplicate field with new ID
    const duplicatedField = {
      ...field,
      id: crypto.randomUUID(),
      label: `${field.label} (Copy)`,
      field_order: section.fields.length,
    }

    // Add to the section (this would need to be handled by parent component)
    console.log("Duplicate field:", duplicatedField)
    toast({
      title: "Field Duplicated",
      description: "Field has been duplicated",
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{currentPage.title}</h2>
              {currentPage.description && <p className="text-sm text-gray-600 mt-1">{currentPage.description}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={() => onEditPage(currentPage)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Page
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Sections */}
      {currentPage.sections?.map((section: any) => (
        <Card key={section.id} className="border-2 border-dashed border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{section.title}</h3>
                {section.description && <p className="text-sm text-gray-600 mt-1">{section.description}</p>}
                <Badge variant="secondary" className="mt-2">
                  {section.fields?.length || 0} fields
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEditSection(section)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Section
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add field to this section
                    console.log("Add field to section:", section.id)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {section.fields && section.fields.length > 0 ? (
              <div className="space-y-4">
                {section.fields
                  .sort((a: any, b: any) => (a.field_order || 0) - (b.field_order || 0))
                  .map((field: any, index: number) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      onEdit={onEditField}
                      onUpdate={() => {}} // Not used in this implementation
                      onDelete={handleDeleteField}
                      onDuplicate={handleDuplicateField}
                      onMoveUp={(fieldId) => handleFieldReorder(section.id, fieldId, "up")}
                      onMoveDown={(fieldId) => handleFieldReorder(section.id, fieldId, "down")}
                      canMoveUp={index > 0}
                      canMoveDown={index < section.fields.length - 1}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No fields in this section</p>
                <p className="text-sm">Drag fields from the palette to get started</p>
              </div>
            )}

            {reorderingSection === section.id && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">Updating field order...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )) || (
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="text-center py-8 text-gray-500">
            <p>No sections in this page</p>
            <p className="text-sm">Add a section to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

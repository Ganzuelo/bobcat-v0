"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit } from "lucide-react"
import type { FormData, FormField } from "@/lib/types"

interface FormCanvasProps {
  formData: FormData | null | undefined
  currentPageIndex: number
  onFieldEdit?: (field: FormField) => void
  onFieldDelete?: (fieldId: string) => void
  onSectionAdd?: (pageIndex: number) => void
  onSectionDelete?: (pageIndex: number, sectionIndex: number) => void
  onFieldAdd?: (pageIndex: number, sectionIndex: number) => void
  onPageChange?: (pageIndex: number) => void
  onReorderPages?: (fromIndex: number, toIndex: number) => void
}

export function FormCanvas({
  formData,
  currentPageIndex = 0,
  onFieldEdit,
  onFieldDelete,
  onSectionAdd,
  onSectionDelete,
  onFieldAdd,
}: FormCanvasProps) {
  if (!formData || !formData.pages || formData.pages.length === 0) {
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No form data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPage = formData.pages[currentPageIndex]
  if (!currentPage) {
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No page data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sections = currentPage.sections || []

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Page Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{currentPage.title || `Page ${currentPageIndex + 1}`}</h2>
              {currentPage.description && <p className="text-sm text-gray-600 mt-1">{currentPage.description}</p>}
            </div>
            <Button onClick={() => onSectionAdd?.(currentPageIndex)} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Sections */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No sections in this page</p>
              <Button onClick={() => onSectionAdd?.(currentPageIndex)} className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            </CardContent>
          </Card>
        ) : (
          sections.map((section, sectionIndex) => (
            <Card key={section.id || sectionIndex} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{section.title || `Section ${sectionIndex + 1}`}</h3>
                    {section.description && <p className="text-sm text-gray-600 mt-1">{section.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onFieldAdd?.(currentPageIndex, sectionIndex)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Field
                    </Button>
                    <Button
                      onClick={() => onSectionDelete?.(currentPageIndex, sectionIndex)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!section.fields || section.fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No fields in this section</p>
                    <Button
                      onClick={() => onFieldAdd?.(currentPageIndex, sectionIndex)}
                      className="mt-4"
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Field
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {section.fields.map((field, fieldIndex) => (
                      <Card key={field.id || fieldIndex} className="relative group">
                        <CardContent className="p-4">
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onFieldEdit?.(field)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onFieldDelete?.(field.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {field.label || "Untitled Field"}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Type: {field.field_type || "text"} | ID: {field.id}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

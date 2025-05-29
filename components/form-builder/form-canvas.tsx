"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { FieldRenderer } from "./field-renderer"
import { PageNavigation } from "./page-navigation"
import type { FormData, FormPage, FormSection, FormField } from "@/lib/types"
import {
  safeArray,
  safeObject,
  safeString,
  safeNumber,
  safeId,
  safeEventHandler,
  devWarn,
  devAssert,
} from "@/lib/null-safety"

interface FormCanvasProps {
  formData: FormData | null | undefined
  currentPageIndex: number
  onFieldEdit: ((field: FormField) => void) | null | undefined
  onFieldDelete: ((fieldId: string) => void) | null | undefined
  onSectionAdd: ((pageIndex: number) => void) | null | undefined
  onSectionDelete: ((pageIndex: number, sectionIndex: number) => void) | null | undefined
  onFieldAdd: ((pageIndex: number, sectionIndex: number) => void) | null | undefined
  onPageChange: ((pageIndex: number) => void) | null | undefined
  onReorderPages: ((fromIndex: number, toIndex: number) => void) | null | undefined
}

export function FormCanvas({
  formData,
  currentPageIndex,
  onFieldEdit,
  onFieldDelete,
  onSectionAdd,
  onSectionDelete,
  onFieldAdd,
  onPageChange,
  onReorderPages,
}: FormCanvasProps) {
  // Validate and sanitize props
  const safeFormData = safeObject(formData) as FormData
  const safeCurrentPageIndex = safeNumber(currentPageIndex, 0)
  const pages = safeArray<FormPage>(safeFormData.pages, [])

  // Development warnings
  devWarn(!!formData, "FormCanvas: formData is null or undefined")
  devWarn(pages.length > 0, "FormCanvas: No pages found in form data")
  devWarn(
    safeCurrentPageIndex >= 0 && safeCurrentPageIndex < pages.length,
    `FormCanvas: currentPageIndex (${safeCurrentPageIndex}) is out of bounds for ${pages.length} pages`,
  )

  // Safe event handlers
  const handleFieldEdit = safeEventHandler(onFieldEdit, "FormCanvas.onFieldEdit")
  const handleFieldDelete = safeEventHandler(onFieldDelete, "FormCanvas.onFieldDelete")
  const handleSectionAdd = safeEventHandler(onSectionAdd, "FormCanvas.onSectionAdd")
  const handleSectionDelete = safeEventHandler(onSectionDelete, "FormCanvas.onSectionDelete")
  const handleFieldAdd = safeEventHandler(onFieldAdd, "FormCanvas.onFieldAdd")
  const handlePageChange = safeEventHandler(onPageChange, "FormCanvas.onPageChange")
  const handleReorderPages = safeEventHandler(onReorderPages, "FormCanvas.onReorderPages")

  // Get current page safely
  const currentPage = pages[safeCurrentPageIndex] || null

  if (!currentPage) {
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No page data available</p>
            <p className="text-sm text-gray-400 mt-2">
              Page index: {safeCurrentPageIndex} of {pages.length} pages
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Safely extract page data
  const pageTitle = safeString(currentPage.title, `Page ${safeCurrentPageIndex + 1}`)
  const pageDescription = safeString(currentPage.description, "")
  const sections = safeArray<FormSection>(currentPage.sections, [])

  devAssert(typeof currentPage === "object", "FormCanvas: currentPage should be an object")

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Page Navigation */}
      <div className="mb-6">
        <PageNavigation
          pages={pages}
          currentPageIndex={safeCurrentPageIndex}
          onPageChange={(index) => handlePageChange(index)}
          onReorderPages={(from, to) => handleReorderPages(from, to)}
        />
      </div>

      {/* Page Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{pageTitle}</h2>
              {pageDescription && <p className="text-sm text-gray-600 mt-1">{pageDescription}</p>}
            </div>
            <Button
              onClick={() => handleSectionAdd(safeCurrentPageIndex)}
              size="sm"
              className="flex items-center gap-2"
            >
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
              <Button onClick={() => handleSectionAdd(safeCurrentPageIndex)} className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            </CardContent>
          </Card>
        ) : (
          sections.map((section, sectionIndex) => {
            // Safely extract section data
            const sectionObj = safeObject(section) as FormSection
            const sectionTitle = safeString(sectionObj.title, `Section ${sectionIndex + 1}`)
            const sectionDescription = safeString(sectionObj.description, "")
            const sectionFields = safeArray<FormField>(sectionObj.fields, [])
            const sectionId = safeId(sectionObj.id, `section_${sectionIndex}`)

            devWarn(!!sectionObj.id, `FormCanvas: Section at index ${sectionIndex} missing ID`)

            return (
              <Card key={sectionId} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{sectionTitle}</h3>
                      {sectionDescription && <p className="text-sm text-gray-600 mt-1">{sectionDescription}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleFieldAdd(safeCurrentPageIndex, sectionIndex)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Field
                      </Button>
                      <Button
                        onClick={() => handleSectionDelete(safeCurrentPageIndex, sectionIndex)}
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
                  {sectionFields.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No fields in this section</p>
                      <Button
                        onClick={() => handleFieldAdd(safeCurrentPageIndex, sectionIndex)}
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
                      {sectionFields.map((field, fieldIndex) => {
                        const fieldObj = safeObject(field) as FormField
                        const fieldId = safeId(fieldObj.id, `field_${sectionIndex}_${fieldIndex}`)

                        devWarn(
                          !!fieldObj.id,
                          `FormCanvas: Field at section ${sectionIndex}, field ${fieldIndex} missing ID`,
                        )

                        return (
                          <FieldRenderer
                            key={fieldId}
                            field={fieldObj}
                            onEdit={() => handleFieldEdit(fieldObj)}
                            onDelete={() => handleFieldDelete(fieldId)}
                          />
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

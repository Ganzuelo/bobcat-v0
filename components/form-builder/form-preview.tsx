"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Info } from "lucide-react"
import type { FormStructure } from "@/lib/form-types"
import { getGridColClass } from "@/lib/form-builder-utils"
import { FieldRenderer } from "./field-renderer"

interface FormPreviewProps {
  formStructure: FormStructure
  currentPageIndex: number
}

export function FormPreview({ formStructure, currentPageIndex }: FormPreviewProps) {
  // Use the passed currentPageIndex to get the current page
  const currentPage = formStructure.pages[currentPageIndex]

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Form Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{formStructure.form.title}</h1>
        {formStructure.form.description && <p className="text-gray-600 text-lg">{formStructure.form.description}</p>}
      </div>

      {/* Page Title */}
      {currentPage && (
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">{currentPage.title}</h2>
          {currentPage.description && <p className="text-gray-600 mt-1">{currentPage.description}</p>}
        </div>
      )}

      {/* Form Content - Render All Sections */}
      {currentPage && currentPage.sections && currentPage.sections.length > 0 ? (
        <div className="space-y-8">
          {currentPage.sections
            .sort((a, b) => a.section_order - b.section_order)
            .map((section) => (
              <Card key={section.id} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  {section.description && <p className="text-gray-600">{section.description}</p>}
                </CardHeader>
                <CardContent>
                  {section.fields && section.fields.length > 0 ? (
                    <form className="space-y-6">
                      <div className="grid grid-cols-12 gap-4">
                        {section.fields
                          .sort((a, b) => a.field_order - b.field_order)
                          .map((field) => {
                            const gridColClass = getGridColClass(field.width || "full")
                            return (
                              <div key={field.id} className={`${gridColClass} min-w-[120px] w-full`}>
                                <div className="space-y-2 w-full">
                                  {field.field_type !== "checkbox" && (
                                    <Label
                                      htmlFor={field.id}
                                      className="text-sm font-medium text-gray-700 w-full flex items-center gap-1"
                                    >
                                      {field.label}
                                      {field.required && <span className="text-red-500 ml-1">*</span>}
                                      {field.guidance && (
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <button
                                              type="button"
                                              className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                                              aria-label="Field guidance"
                                            >
                                              <Info className="h-4 w-4" />
                                            </button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-80 p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Info className="h-4 w-4 text-primary" />
                                              <h4 className="font-semibold text-sm">Field Guidance</h4>
                                            </div>
                                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                              {field.guidance}
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                      )}
                                    </Label>
                                  )}
                                  {field.help_text && (
                                    <p className="text-xs text-gray-500 mb-1 w-full">{field.help_text}</p>
                                  )}
                                  <div className="w-full">
                                    <FieldRenderer field={field} isPreviewMode={true} />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>No fields in this section yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

          {/* Form Actions - Only show at the bottom of the last section */}
          <div className="flex justify-end mt-8 pt-6 border-t">
            <div className="flex gap-3">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
              <Button type="submit" size="lg">
                Submit Form
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center py-12 text-gray-500">
              <p>No sections available on this page.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

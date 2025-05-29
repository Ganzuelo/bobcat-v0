"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { FormStructure } from "@/lib/form-types"
import { getPreviewGridColClass } from "@/lib/form-width-utils"
import { FieldRenderer } from "./field-renderer"

interface FormPreviewProps {
  formStructure: FormStructure
}

export function FormPreview({ formStructure }: FormPreviewProps) {
  const currentPage = formStructure.pages[0]
  const currentSection = currentPage?.sections[0]

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Form Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{formStructure.form.title}</h1>
        {formStructure.form.description && <p className="text-gray-600 text-lg">{formStructure.form.description}</p>}
      </div>

      {/* Form Content */}
      {currentSection && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">{currentSection.title}</CardTitle>
            {currentSection.description && <p className="text-gray-600">{currentSection.description}</p>}
          </CardHeader>
          <CardContent>
            {currentSection.fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No fields in this form yet.</p>
              </div>
            ) : (
              <form className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  {currentSection.fields.map((field) => {
                    const gridColClass = getPreviewGridColClass(field.width || "full")
                    return (
                      <div key={field.id} className={`${gridColClass} min-w-0`}>
                        <div className="space-y-2 min-w-[120px]">
                          {field.field_type !== "checkbox" && (
                            <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                          )}
                          {field.help_text && <p className="text-xs text-gray-500 mb-1">{field.help_text}</p>}
                          <div className="w-full min-w-[100px]">
                            <FieldRenderer field={field} isPreviewMode={true} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Form Actions */}
                {currentSection.fields.length > 0 && (
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
                )}
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

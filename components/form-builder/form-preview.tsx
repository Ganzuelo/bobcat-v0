"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { FieldRenderer } from "./field-renderer"
import { getGridColClass } from "@/lib/form-builder-utils"
import type { FormStructure } from "@/lib/form-types"

interface FormPreviewProps {
  formStructure: FormStructure
  currentPageIndex?: number
  onSubmit?: (data: any) => void
}

export function FormPreview({ formStructure, currentPageIndex = 0, onSubmit }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [currentPage, setCurrentPage] = useState(currentPageIndex)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Ensure formStructure and pages exist
  if (!formStructure || !formStructure.pages || formStructure.pages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              <p>No form data available to preview.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ensure currentPage is valid
  const safeCurrentPage = Math.min(Math.max(0, currentPage), formStructure.pages.length - 1)
  const page = formStructure.pages[safeCurrentPage]

  // Ensure page exists
  if (!page) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              <p>Page not found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ensure sections exist
  const sections = Array.isArray(page.sections) ? page.sections : []

  const handlePrevPage = () => {
    if (safeCurrentPage > 0) {
      setCurrentPage(safeCurrentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (safeCurrentPage < formStructure.pages.length - 1) {
      setCurrentPage(safeCurrentPage + 1)
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))

    // Clear error for this field if it exists
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const handleSubmit = () => {
    // Validate required fields
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    formStructure.pages.forEach((page) => {
      page.sections?.forEach((section) => {
        section.fields?.forEach((field) => {
          if (field.required && !formData[field.id]) {
            newErrors[field.id] = "This field is required"
            hasErrors = true
          }
        })
      })
    })

    if (hasErrors) {
      setErrors(newErrors)
      return
    }

    // Submit the form data
    if (onSubmit) {
      onSubmit(formData)
    } else {
      console.log("Form submitted:", formData)
    }
  }

  const isLastPage = safeCurrentPage === formStructure.pages.length - 1

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        {/* Form Header */}
        <CardHeader>
          <CardTitle>{formStructure.form.title || "Form Preview"}</CardTitle>
          {formStructure.form.description && <CardDescription>{formStructure.form.description}</CardDescription>}
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Page Header */}
          {page.title && (
            <div>
              <h2 className="text-xl font-semibold">{page.title}</h2>
              {page.description && <p className="text-sm text-muted-foreground mt-1">{page.description}</p>}
            </div>
          )}

          {/* Sections */}
          {sections.map((section) => {
            if (!section) return null

            // Ensure fields is an array
            const fields = Array.isArray(section.fields) ? section.fields : []

            return (
              <div key={section.id} className="space-y-4">
                {/* Section Header */}
                {(section.title || section.description) && (
                  <div className="mb-4">
                    {section.title && <h3 className="text-lg font-medium">{section.title}</h3>}
                    {section.description && <p className="text-sm text-muted-foreground mt-1">{section.description}</p>}
                  </div>
                )}

                {/* Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                  {fields.map((field) => {
                    if (!field) return null

                    const gridColClass = getGridColClass(field.width || "full")

                    return (
                      <div key={field.id} className={gridColClass}>
                        <FieldRenderer
                          field={field}
                          value={formData[field.id]}
                          onChange={(value) => handleFieldChange(field.id, value)}
                          error={errors[field.id]}
                          isPreviewMode={true}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handlePrevPage} disabled={safeCurrentPage === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {isLastPage ? (
              <Button onClick={handleSubmit}>Submit</Button>
            ) : (
              <Button onClick={handleNextPage}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

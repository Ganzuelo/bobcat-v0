"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FIELD_WIDTH_CONFIG } from "@/lib/form-types"
import type { FormStructure, FormField } from "@/lib/form-types"

interface FormPreviewProps {
  formStructure: FormStructure
  currentPageIndex: number
}

export function FormPreview({ formStructure, currentPageIndex }: FormPreviewProps) {
  const currentPage = formStructure.pages[currentPageIndex]

  const renderField = (field: FormField) => {
    const widthClass = FIELD_WIDTH_CONFIG[field.width].gridCols

    const fieldElement = () => {
      switch (field.field_type) {
        case "text":
        case "email":
        case "password":
        case "phone":
        case "url":
          return (
            <Input
              type={field.field_type === "email" ? "email" : field.field_type === "password" ? "password" : "text"}
              placeholder={field.placeholder}
            />
          )
        case "textarea":
          return <Textarea placeholder={field.placeholder} />
        case "select":
          return (
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        case "radio":
          return (
            <RadioGroup>
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )
        case "checkbox":
          if (field.options && field.options.length > 1) {
            return (
              <div className="space-y-2">
                {field.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox id={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </div>
            )
          } else {
            return (
              <div className="flex items-center space-x-2">
                <Checkbox id={field.id} />
                <Label htmlFor={field.id}>{field.label}</Label>
              </div>
            )
          }
        default:
          return <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">{field.field_type}</div>
      }
    }

    return (
      <div key={field.id} className={widthClass}>
        <div className="space-y-2">
          {field.field_type !== "checkbox" && (
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          {field.help_text && <p className="text-sm text-gray-600">{field.help_text}</p>}
          {fieldElement()}
        </div>
      </div>
    )
  }

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No page to preview</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Form Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{formStructure.form.title}</h1>
          {formStructure.form.description && <p className="text-gray-600">{formStructure.form.description}</p>}
        </div>

        {/* Page Header */}
        <Card>
          <CardHeader>
            <CardTitle>{currentPage.title}</CardTitle>
            {currentPage.description && <p className="text-gray-600">{currentPage.description}</p>}
          </CardHeader>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {currentPage.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                {section.description && <p className="text-gray-600">{section.description}</p>}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-4">{section.fields.map((field) => renderField(field))}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" disabled={currentPageIndex === 0}>
            Previous
          </Button>
          <Button disabled={currentPageIndex === formStructure.pages.length - 1}>
            {currentPageIndex === formStructure.pages.length - 1 ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}

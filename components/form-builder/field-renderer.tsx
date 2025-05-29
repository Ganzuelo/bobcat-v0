"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2 } from "lucide-react"
import type { FormField } from "@/lib/types"
import {
  safeString,
  safeBoolean,
  safeArray,
  safeObject,
  safeId,
  safeEventHandler,
  safeProp,
  devWarn,
  devAssert,
} from "@/lib/null-safety"

interface FieldRendererProps {
  field: FormField | null | undefined
  onEdit: (() => void) | null | undefined
  onDelete: (() => void) | null | undefined
}

export function FieldRenderer({ field, onEdit, onDelete }: FieldRendererProps) {
  // Validate and sanitize props
  const safeField = safeObject(field) as FormField

  // Development warnings
  devWarn(!!field, "FieldRenderer: field is null or undefined")
  devAssert(typeof safeField === "object", "FieldRenderer: field should be an object")

  // Safe event handlers
  const handleEdit = safeEventHandler(onEdit, "FieldRenderer.onEdit")
  const handleDelete = safeEventHandler(onDelete, "FieldRenderer.onDelete")

  // Extract field properties safely
  const fieldId = safeId(safeField.id, "field")
  const fieldType = safeString(safeField.field_type, "text")
  const label = safeString(safeField.label, "Untitled Field")
  const placeholder = safeString(safeField.placeholder, "")
  const helpText = safeString(safeField.help_text, "")
  const isRequired = safeBoolean(safeField.required, false)
  const isReadonly = safeBoolean(safeField.readonly, false)
  const defaultValue = safeString(safeField.default_value, "")
  const uadFieldId = safeString(safeField.uad_field_id, "")

  // Handle options for select/radio/checkbox fields
  const options = safeArray(safeField.options, [])
  const safeOptions = options.map((option, index) => {
    const optionObj = safeObject(option)
    return {
      value: safeString(safeProp(optionObj, "value", `option_${index}`)),
      label: safeString(safeProp(optionObj, "label", `Option ${index + 1}`)),
    }
  })

  devWarn(fieldId.length > 0, "FieldRenderer: Field missing valid ID")
  devWarn(label.length > 0, "FieldRenderer: Field missing label")

  // Render field based on type
  const renderFieldInput = () => {
    const commonProps = {
      id: fieldId,
      placeholder,
      disabled: isReadonly,
      defaultValue,
      className: "w-full",
    }

    switch (fieldType) {
      case "text":
      case "email":
      case "tel":
      case "url":
        return <Input type={fieldType} {...commonProps} />

      case "number":
        return <Input type="number" {...commonProps} />

      case "password":
        return <Input type="password" {...commonProps} />

      case "textarea":
        return <Textarea {...commonProps} rows={4} />

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={fieldId} disabled={isReadonly} defaultChecked={defaultValue === "true"} />
            <Label htmlFor={fieldId} className="text-sm font-normal">
              {label}
            </Label>
          </div>
        )

      case "radio":
        if (safeOptions.length === 0) {
          return <div className="text-sm text-gray-500 italic">No options configured for radio field</div>
        }
        return (
          <RadioGroup defaultValue={defaultValue} disabled={isReadonly}>
            {safeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${fieldId}_${option.value}`} />
                <Label htmlFor={`${fieldId}_${option.value}`} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "select":
        if (safeOptions.length === 0) {
          return <div className="text-sm text-gray-500 italic">No options configured for select field</div>
        }
        return (
          <Select defaultValue={defaultValue} disabled={isReadonly}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {safeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "file":
        return <Input type="file" {...commonProps} />

      case "date":
        return <Input type="date" {...commonProps} />

      case "time":
        return <Input type="time" {...commonProps} />

      case "datetime-local":
        return <Input type="datetime-local" {...commonProps} />

      default:
        devWarn(false, `FieldRenderer: Unknown field type: ${fieldType}`)
        return <Input type="text" {...commonProps} />
    }
  }

  return (
    <Card className="relative group">
      <CardContent className="p-4">
        {/* Field Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleEdit} className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Field Label and Info */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {uadFieldId && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">UAD: {uadFieldId}</span>
            )}
          </div>

          {helpText && <p className="text-xs text-gray-600">{helpText}</p>}
        </div>

        {/* Field Input */}
        <div className="space-y-2">
          {fieldType !== "checkbox" && (
            <Label htmlFor={fieldId} className="sr-only">
              {label}
            </Label>
          )}
          {renderFieldInput()}
        </div>

        {/* Field Metadata */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">Type: {fieldType}</span>
            {isRequired && <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>}
            {isReadonly && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Read-only</span>}
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">ID: {fieldId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

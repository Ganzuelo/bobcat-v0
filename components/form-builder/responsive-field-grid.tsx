"use client"

import type React from "react"

import type { FormField } from "@/lib/form-types"
import { getGridColClass, groupFieldsByRows } from "@/lib/form-builder-utils"
import { FieldRenderer } from "./field-renderer"
import { Label } from "@/components/ui/label"

interface ResponsiveFieldGridProps {
  fields: FormField[]
  isPreviewMode?: boolean
  onFieldClick?: (field: FormField) => void
  renderFieldWrapper?: (field: FormField, children: React.ReactNode) => React.ReactNode
}

export function ResponsiveFieldGrid({
  fields,
  isPreviewMode = false,
  onFieldClick,
  renderFieldWrapper,
}: ResponsiveFieldGridProps) {
  // Group fields by rows based on their widths for better layout
  const fieldRows = groupFieldsByRows(fields)

  return (
    <div className="space-y-4">
      {fieldRows.map((rowFields, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid grid-cols-12 gap-4">
          {rowFields.map((field) => {
            const gridColClass = getGridColClass(field.width || "full")

            const fieldContent = (
              <div className="space-y-2">
                {/* Field Label */}
                {field.field_type !== "checkbox" && (
                  <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                )}

                {/* Help Text */}
                {field.help_text && <p className="text-xs text-gray-500 mb-1">{field.help_text}</p>}

                {/* Field Input */}
                <div className="w-full">
                  <FieldRenderer field={field} isPreviewMode={isPreviewMode} />
                </div>
              </div>
            )

            const wrappedContent = renderFieldWrapper ? renderFieldWrapper(field, fieldContent) : fieldContent

            return (
              <div key={field.id} className={`${gridColClass} min-w-0`} onClick={() => onFieldClick?.(field)}>
                {wrappedContent}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import { FieldRenderer } from "@/components/form-builder/field-renderer"
import { FieldControls } from "@/components/form-builder/field-controls"

interface FieldCardProps {
  field: any
  sectionId: string
  index: number
  totalFields: number
  onFieldClick?: (field: any) => void
  onFieldsChanged: () => void
  onDeleteField?: (fieldId: string) => void
}

export function FieldCard({
  field,
  sectionId,
  index,
  totalFields,
  onFieldClick,
  onFieldsChanged,
  onDeleteField,
}: FieldCardProps) {
  const isFirst = index === 0
  const isLast = index === totalFields - 1

  return (
    <Card
      className="p-4 relative group hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onFieldClick?.(field)}
    >
      <FieldRenderer field={field} readOnly={true} />

      <FieldControls
        fieldId={field.id}
        sectionId={sectionId}
        onFieldsChanged={onFieldsChanged}
        onDeleteField={onDeleteField}
        isFirst={isFirst}
        isLast={isLast}
      />
    </Card>
  )
}

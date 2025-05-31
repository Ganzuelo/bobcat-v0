"use client"

import { useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Settings, Trash2 } from "lucide-react"
import { SortableField } from "./sortable-field"
import type { FormSection, FormField } from "@/lib/form-types"

interface SortableSectionProps {
  section: FormSection & { fields: FormField[] }
  onSelectField: (field: FormField) => void
  onSelectSection: (section: FormSection) => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onDeleteField: (fieldId: string) => void
  onDuplicateField: (fieldId: string) => void
}

export function SortableSection({
  section,
  onSelectField,
  onSelectSection,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: {
      type: "section",
      section,
    },
  })

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `section-${section.id}`,
    data: {
      type: "section",
      sectionId: section.id,
    },
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  }

  return (
    <Card ref={setNodeRef} style={style} className={`${isDragging ? "opacity-50" : ""} border-l-4 border-l-blue-500`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab hover:text-gray-600">
              <GripVertical className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{section.title || `Section ${section.section_order}`}</CardTitle>
              {section.description && <p className="text-sm text-gray-600 mt-1">{section.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{section.fields.length} fields</Badge>
            <Button variant="ghost" size="sm" onClick={() => onSelectSection(section)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={setDroppableRef}>
        {section.fields.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            <p className="mb-2">No fields in this section</p>
            <p className="text-sm">Drag field types here to add them</p>
          </div>
        ) : (
          <SortableContext items={section.fields.map((f) => f.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-12 gap-4">
              {section.fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  onSelect={onSelectField}
                  onUpdate={onUpdateField}
                  onDelete={onDeleteField}
                  onDuplicate={onDuplicateField}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </CardContent>
    </Card>
  )
}

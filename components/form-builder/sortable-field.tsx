"use client"

import { useSortable } from "@dnd-kit/core"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { GripVertical, Settings, Trash2, Copy } from "lucide-react"
import { FIELD_WIDTH_CONFIG } from "@/lib/form-types"
import type { FormField } from "@/lib/form-types"

interface SortableFieldProps {
  field: FormField
  onSelect: (field: FormField) => void
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void
  onDelete: (fieldId: string) => void
  onDuplicate: (fieldId: string) => void
}

export function SortableField({ field, onSelect, onUpdate, onDelete, onDuplicate }: SortableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: {
      type: "field",
      field,
    },
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  }

  const widthClass = FIELD_WIDTH_CONFIG[field.width].gridCols

  const renderFieldPreview = () => {
    switch (field.field_type) {
      case "text":
      case "email":
      case "password":
      case "phone":
      case "url":
        return <Input placeholder={field.placeholder || field.label} disabled />
      case "textarea":
        return <Textarea placeholder={field.placeholder || field.label} disabled />
      case "select":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
          </Select>
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox disabled />
            <label className="text-sm">{field.label}</label>
          </div>
        )
      default:
        return <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">{field.field_type}</div>
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={`${widthClass} ${isDragging ? "opacity-50" : ""}`}>
      <Card className="group hover:shadow-md transition-shadow border-2 hover:border-blue-300">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Field Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-gray-600">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{field.label}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {field.field_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {FIELD_WIDTH_CONFIG[field.width].label}
                    </Badge>
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => onSelect(field)}>
                  <Settings className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDuplicate(field.id)}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(field.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Field Preview */}
            <div className="space-y-2">
              {field.help_text && <p className="text-xs text-gray-600">{field.help_text}</p>}
              {renderFieldPreview()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

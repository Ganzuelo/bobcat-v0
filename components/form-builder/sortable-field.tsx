"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Trash2, Copy, ChevronUp, ChevronDown } from "lucide-react"
import { FieldRenderer } from "./field-renderer"

interface SortableFieldProps {
  field: any
  onEdit: (field: any) => void
  onUpdate: (fieldId: string, updates: any) => void
  onDelete: (fieldId: string) => void
  onDuplicate: (fieldId: string) => void
  onMoveUp: (fieldId: string) => void
  onMoveDown: (fieldId: string) => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export function SortableField({
  field,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SortableFieldProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleEdit = () => {
    onEdit(field)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this field?")) {
      onDelete(field.id)
    }
  }

  const handleDuplicate = () => {
    onDuplicate(field.id)
  }

  const handleMoveUp = () => {
    onMoveUp(field.id)
  }

  const handleMoveDown = () => {
    onMoveDown(field.id)
  }

  return (
    <Card
      className="relative group transition-all duration-200 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        {/* Field Actions */}
        {isHovered && (
          <div className="absolute top-2 right-2 flex gap-1 bg-white shadow-lg rounded-md p-1 border z-10">
            <Button size="sm" variant="ghost" onClick={handleEdit} className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDuplicate} className="h-8 w-8 p-0">
              <Copy className="h-4 w-4" />
            </Button>
            {canMoveUp && (
              <Button size="sm" variant="ghost" onClick={handleMoveUp} className="h-8 w-8 p-0">
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {canMoveDown && (
              <Button size="sm" variant="ghost" onClick={handleMoveDown} className="h-8 w-8 p-0">
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleDelete} className="h-8 w-8 p-0 text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Field Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{field.label || "Untitled Field"}</h4>
            <Badge variant="secondary" className="text-xs">
              {field.field_type || field.type}
            </Badge>
            {field.required && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
          </div>
        </div>

        {/* Field Preview */}
        <div className="pointer-events-none">
          <FieldRenderer field={field} value="" onChange={() => {}} />
        </div>

        {/* Field Info */}
        {field.help_text && <p className="text-sm text-gray-600 mt-2">{field.help_text}</p>}
      </CardContent>
    </Card>
  )
}

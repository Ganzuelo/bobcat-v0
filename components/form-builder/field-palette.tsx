"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"
import { getFieldTypesByCategory } from "@/lib/form-types"
import type { FieldType } from "@/lib/form-types"

interface DraggableFieldTypeProps {
  fieldType: FieldType
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

function DraggableFieldType({ fieldType, label, icon: Icon, description }: DraggableFieldTypeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `field-type-${fieldType}`,
    data: {
      type: "field-type",
      fieldType,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 border rounded-lg cursor-grab hover:bg-gray-50 transition-colors ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-gray-500 truncate">{description}</div>
        </div>
      </div>
    </div>
  )
}

export function FieldPalette() {
  const [searchTerm, setSearchTerm] = useState("")
  const fieldGroups = getFieldTypesByCategory()

  const filteredGroups = fieldGroups
    .map((group) => ({
      ...group,
      fields: group.fields.filter(
        ({ config }) =>
          config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          config.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((group) => group.fields.length > 0)

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Field Types</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search field types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredGroups.map((group) => (
          <Card key={group.category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{group.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {group.fields.map(({ type, config }) => (
                <DraggableFieldType
                  key={type}
                  fieldType={type}
                  label={config.label}
                  icon={config.icon}
                  description={config.description}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

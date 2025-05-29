"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, ChevronLeft, ChevronRight, X } from "lucide-react"
import type { FormPage, FormSection, FormField } from "@/lib/form-types"

interface SortablePageTabProps {
  page: FormPage & { sections: (FormSection & { fields: FormField[] })[] }
  index: number
  totalPages: number
  isActive: boolean
  onPageChange: (index: number) => void
  onMoveLeft: (index: number) => void
  onMoveRight: (index: number) => void
  onDeletePage?: (index: number) => void
}

const getFieldCount = (page: FormPage & { sections: (FormSection & { fields: FormField[] })[] }) => {
  if (!page.sections || !Array.isArray(page.sections)) {
    return 0
  }
  return page.sections.reduce((total, section) => {
    if (!section || !section.fields || !Array.isArray(section.fields)) {
      return total
    }
    return total + section.fields.length
  }, 0)
}

export function SortablePageTab({
  page,
  index,
  totalPages,
  isActive,
  onPageChange,
  onMoveLeft,
  onMoveRight,
  onDeletePage,
}: SortablePageTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
    data: {
      type: "page",
      page,
      index,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  }

  const isFirst = index === 0
  const isLast = index === totalPages - 1

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative flex items-center gap-1 group
        ${isDragging ? "shadow-lg" : ""}
      `}
    >
      {/* Move Left Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onMoveLeft(index)
        }}
        disabled={isFirst}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Move left"
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>

      {/* Tab Content */}
      <div
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-t-md border-b-2 transition-all cursor-pointer
          ${
            isActive
              ? "bg-white border-primary text-primary shadow-sm"
              : "bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          }
          ${isDragging ? "shadow-lg bg-white" : ""}
        `}
        onClick={() => onPageChange(index)}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded opacity-60 hover:opacity-100 transition-opacity"
          title="Drag to reorder"
        >
          <GripVertical className="h-3 w-3" />
        </div>

        {/* Page Info */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm whitespace-nowrap">{page.title || `Page ${index + 1}`}</span>
          <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
            {getFieldCount(page)}
          </Badge>
        </div>

        {/* Delete Button */}
        {totalPages > 1 && onDeletePage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDeletePage(index)
            }}
            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
            title="Delete page"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Move Right Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onMoveRight(index)
        }}
        disabled={isLast}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Move right"
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  )
}

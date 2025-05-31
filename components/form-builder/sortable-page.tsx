"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, ChevronUp, ChevronDown, Settings } from "lucide-react"
import type { FormPage, FormSection, FormField } from "@/lib/form-types"

interface SortablePageProps {
  page: FormPage & { sections: (FormSection & { fields: FormField[] })[] }
  index: number
  totalPages: number
  isActive: boolean
  onPageChange: (index: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onEditPage?: (page: FormPage) => void
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

export function SortablePage({
  page,
  index,
  totalPages,
  isActive,
  onPageChange,
  onMoveUp,
  onMoveDown,
  onEditPage,
}: SortablePageProps) {
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
  }

  const isFirst = index === 0
  const isLast = index === totalPages - 1

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-2 rounded-md border transition-all
        ${isActive ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}
        ${isDragging ? "shadow-lg z-50" : ""}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded opacity-60 hover:opacity-100 transition-opacity"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Page Content */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(index)}
        className={`
          flex-1 justify-start h-auto p-2 text-left
          ${isActive ? "text-primary-foreground hover:text-primary-foreground" : ""}
        `}
      >
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{page.title || `Page ${index + 1}`}</div>
            {page.description && (
              <div
                className={`text-xs truncate mt-1 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}
              >
                {page.description}
              </div>
            )}
          </div>
          <Badge variant={isActive ? "secondary" : "outline"} className="text-xs shrink-0">
            {getFieldCount(page)} fields
          </Badge>
        </div>
      </Button>

      {/* Move Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onMoveUp(index)
          }}
          disabled={isFirst}
          title="Move up"
          className="h-8 w-8 p-0"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onMoveDown(index)
          }}
          disabled={isLast}
          title="Move down"
          className="h-8 w-8 p-0"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
        {onEditPage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEditPage(page)
            }}
            title="Edit page"
            className="h-8 w-8 p-0"
          >
            <Settings className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

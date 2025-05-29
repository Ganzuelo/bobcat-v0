"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { FormPage, FormSection, FormField } from "@/lib/form-types"

interface PageTabProps {
  page: FormPage & { sections: (FormSection & { fields: FormField[] })[] }
  index: number
  totalPages: number
  isActive: boolean
  onPageChange: (index: number) => void
  onMoveLeft: (index: number) => void
  onMoveRight: (index: number) => void
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

export function PageTab({ page, index, totalPages, isActive, onPageChange, onMoveLeft, onMoveRight }: PageTabProps) {
  const isFirst = index === 0
  const isLast = index === totalPages - 1

  return (
    <div className="relative flex items-center gap-1 group">
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

      {/* Page Tab Button */}
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(index)}
        className="relative flex items-center gap-1.5 px-2.5 py-1.5 h-auto"
      >
        {/* Page Title */}
        <span className="font-medium text-sm whitespace-nowrap">{page.title || `Page ${index + 1}`}</span>

        {/* Field Count Badge */}
        <Badge variant={isActive ? "secondary" : "outline"} className="text-xs shrink-0">
          {getFieldCount(page)}
        </Badge>
      </Button>

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

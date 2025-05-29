"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import type { FormPage, FormSection, FormField } from "@/lib/form-types"

interface PageNavigationProps {
  pages: (FormPage & { sections: (FormSection & { fields: FormField[] })[] })[]
  currentPageIndex: number
  onPageChange: (index: number) => void
  onAddPage: () => void
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

export function PageNavigation({ pages, currentPageIndex, onPageChange, onAddPage }: PageNavigationProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {pages.map((page, index) => {
            const isActive = index === currentPageIndex
            return (
              <Button
                key={page.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(index)}
                className="relative"
              >
                {page.title}
                <Badge variant={isActive ? "secondary" : "outline"} className="text-xs shrink-0">
                  {getFieldCount(page)}
                </Badge>
              </Button>
            )
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.min(pages.length - 1, currentPageIndex + 1))}
          disabled={currentPageIndex === pages.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button variant="outline" size="sm" onClick={onAddPage}>
        <Plus className="h-4 w-4 mr-2" />
        Add Page
      </Button>
    </div>
  )
}

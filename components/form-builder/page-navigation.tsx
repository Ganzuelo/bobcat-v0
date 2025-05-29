"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { FormPage } from "@/lib/types"

interface PageNavigationProps {
  pages: FormPage[]
  currentPageIndex: number
  onPageChange?: (pageIndex: number) => void
  onReorderPages?: (fromIndex: number, toIndex: number) => void
}

export function PageNavigation({ pages, currentPageIndex, onPageChange, onReorderPages }: PageNavigationProps) {
  if (!pages || pages.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-sm">No pages available</p>
      </div>
    )
  }

  if (pages.length === 1) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <span className="text-blue-800 font-medium">{pages[0]?.title || "Page 1"}</span>
      </div>
    )
  }

  const canMoveLeft = currentPageIndex > 0
  const canMoveRight = currentPageIndex < pages.length - 1

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onReorderPages?.(currentPageIndex, currentPageIndex - 1)}
        disabled={!canMoveLeft}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Move Left
      </Button>

      <div className="flex items-center gap-2 flex-1 justify-center">
        {pages.map((page, index) => (
          <Button
            key={page.id || index}
            variant={index === currentPageIndex ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange?.(index)}
            className="min-w-[100px]"
          >
            {page.title || `Page ${index + 1}`}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onReorderPages?.(currentPageIndex, currentPageIndex + 1)}
        disabled={!canMoveRight}
        className="flex items-center gap-2"
      >
        Move Right
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

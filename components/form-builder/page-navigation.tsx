"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Page {
  id: string
  title: string
  page_order?: number
  sections?: any[]
}

interface PageNavigationProps {
  pages: Page[]
  currentPageIndex: number
  onPageChange: (index: number) => void
  onAddPage: () => void
  onReorderPages?: (pages: Page[]) => void
}

export function PageNavigation({
  pages,
  currentPageIndex,
  onPageChange,
  onAddPage,
  onReorderPages,
}: PageNavigationProps) {
  // Ensure currentPageIndex is valid
  const [safeCurrentPageIndex, setSafeCurrentPageIndex] = useState(0)

  // Update safe index when props change
  useEffect(() => {
    if (pages && pages.length > 0) {
      const safeIndex = Math.min(Math.max(0, currentPageIndex), pages.length - 1)
      setSafeCurrentPageIndex(safeIndex)
    } else {
      setSafeCurrentPageIndex(0)
    }
  }, [currentPageIndex, pages])

  // Ensure pages is an array
  const safePages = Array.isArray(pages) ? pages : []

  const handlePrevPage = () => {
    if (safeCurrentPageIndex > 0) {
      onPageChange(safeCurrentPageIndex - 1)
    }
  }

  const handleNextPage = () => {
    if (safeCurrentPageIndex < safePages.length - 1) {
      onPageChange(safeCurrentPageIndex + 1)
    }
  }

  const handleMoveLeft = (pageIndex: number) => {
    console.log("Moving page left:", pageIndex)
    if (!onReorderPages || pageIndex <= 0) return
    console.log("handleMoveLeft called:", pageIndex, "onReorderPages:", !!onReorderPages)

    const newPages = [...safePages]
    const temp = newPages[pageIndex]
    newPages[pageIndex] = newPages[pageIndex - 1]
    newPages[pageIndex - 1] = temp

    // Update page_order properties
    const updatedPages = newPages.map((page, idx) => ({
      ...page,
      page_order: idx + 1,
    }))

    onReorderPages(updatedPages)

    // If we moved the current page, update the current page index
    if (pageIndex === safeCurrentPageIndex) {
      onPageChange(safeCurrentPageIndex - 1)
    }
  }

  const handleMoveRight = (pageIndex: number) => {
    console.log("Moving page right:", pageIndex)
    if (!onReorderPages || pageIndex >= safePages.length - 1) return
    console.log("handleMoveRight called:", pageIndex, "onReorderPages:", !!onReorderPages)

    const newPages = [...safePages]
    const temp = newPages[pageIndex]
    newPages[pageIndex] = newPages[pageIndex + 1]
    newPages[pageIndex + 1] = temp

    // Update page_order properties
    const updatedPages = newPages.map((page, idx) => ({
      ...page,
      page_order: idx + 1,
    }))

    onReorderPages(updatedPages)

    // If we moved the current page, update the current page index
    if (pageIndex === safeCurrentPageIndex) {
      onPageChange(safeCurrentPageIndex + 1)
    }
  }

  // If no pages, show just the add button
  if (safePages.length === 0) {
    return (
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex-1"></div>
        <Button size="sm" onClick={onAddPage} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Page
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-2 border-b bg-gray-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevPage}
        disabled={safeCurrentPageIndex <= 0}
        className="shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center overflow-x-auto mx-1 no-scrollbar">
        {safePages.map((page, index) => {
          const isActive = index === safeCurrentPageIndex
          const fieldCount = page.sections?.reduce((acc, section) => acc + (section.fields?.length || 0), 0) || 0

          return (
            <div key={page.id} className="relative group mx-0.5">
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(index)}
                className="px-2 py-1 h-auto flex items-center gap-1.5"
              >
                <span className="truncate max-w-[120px]">{page.title || `Page ${index + 1}`}</span>
                <Badge variant={isActive ? "secondary" : "outline"} className="ml-1 text-xs">
                  {fieldCount}
                </Badge>
              </Button>

              {/* Move buttons - show on hover */}
              {onReorderPages && (
                <div
                  className={cn(
                    "absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    "flex -mr-1 bg-background shadow-sm rounded-sm",
                  )}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveLeft(index)
                    }}
                    disabled={index === 0}
                    title="Move left"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveRight(index)
                    }}
                    disabled={index === safePages.length - 1}
                    title="Move right"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextPage}
          disabled={safeCurrentPageIndex >= safePages.length - 1}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={onAddPage} className="flex items-center gap-1 shrink-0">
          <Plus className="h-4 w-4" />
          Add Page
        </Button>
      </div>
    </div>
  )
}

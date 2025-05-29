"use client"

import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import type { FormPage, FormSection, FormField } from "@/lib/form-types"
import { PageTab } from "./page-tab"

interface PageNavigationProps {
  pages: (FormPage & { sections: (FormSection & { fields: FormField[] })[] })[]
  currentPageIndex: number
  onPageChange: (index: number) => void
  onAddPage: () => void
  onReorderPages?: (pages: (FormPage & { sections: (FormSection & { fields: FormField[] })[] })[]) => void
}

export function PageNavigation({
  pages,
  currentPageIndex,
  onPageChange,
  onAddPage,
  onReorderPages,
}: PageNavigationProps) {
  const handleMoveLeft = (index: number) => {
    console.log("handleMoveLeft called:", index, "onReorderPages:", !!onReorderPages) // Debug log

    if (index > 0 && onReorderPages) {
      const newPages = [...pages]

      // Swap the page with the one to its left
      const temp = newPages[index]
      newPages[index] = newPages[index - 1]
      newPages[index - 1] = temp

      // Update page_order for all pages
      const updatedPages = newPages.map((page, idx) => ({
        ...page,
        page_order: idx + 1,
      }))

      console.log("Calling onReorderPages with updated pages") // Debug log
      onReorderPages(updatedPages)

      // Update current page index
      if (index === currentPageIndex) {
        onPageChange(index - 1)
      } else if (index - 1 === currentPageIndex) {
        onPageChange(index)
      }
    }
  }

  const handleMoveRight = (index: number) => {
    console.log("handleMoveRight called:", index, "onReorderPages:", !!onReorderPages) // Debug log

    if (index < pages.length - 1 && onReorderPages) {
      const newPages = [...pages]

      // Swap the page with the one to its right
      const temp = newPages[index]
      newPages[index] = newPages[index + 1]
      newPages[index + 1] = temp

      // Update page_order for all pages
      const updatedPages = newPages.map((page, idx) => ({
        ...page,
        page_order: idx + 1,
      }))

      console.log("Calling onReorderPages with updated pages") // Debug log
      onReorderPages(updatedPages)

      // Update current page index
      if (index === currentPageIndex) {
        onPageChange(index + 1)
      } else if (index + 1 === currentPageIndex) {
        onPageChange(index)
      }
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      {/* Navigation Arrows and Page Tabs */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          className="mr-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Tabs */}
        <div className="flex items-center">
          {pages.map((page, index) => (
            <PageTab
              key={page.id}
              page={page}
              index={index}
              totalPages={pages.length}
              isActive={index === currentPageIndex}
              onPageChange={onPageChange}
              onMoveLeft={handleMoveLeft}
              onMoveRight={handleMoveRight}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.min(pages.length - 1, currentPageIndex + 1))}
          disabled={currentPageIndex === pages.length - 1}
          className="ml-1"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Add Page Button */}
      <Button variant="outline" size="sm" onClick={onAddPage}>
        <Plus className="h-4 w-4 mr-2" />
        Add Page
      </Button>
    </div>
  )
}

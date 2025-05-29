"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { FormPage } from "@/lib/types"
import { safeArray, safeNumber, safeString, safeEventHandler, devWarn, devAssert } from "@/lib/null-safety"

interface PageNavigationProps {
  pages: FormPage[] | null | undefined
  currentPageIndex: number
  onPageChange: ((pageIndex: number) => void) | null | undefined
  onReorderPages: ((fromIndex: number, toIndex: number) => void) | null | undefined
}

export function PageNavigation({ pages, currentPageIndex, onPageChange, onReorderPages }: PageNavigationProps) {
  // Validate and sanitize props
  const safePages = safeArray<FormPage>(pages, [])
  const safeCurrentPageIndex = safeNumber(currentPageIndex, 0)

  // Development warnings
  devWarn(!!pages, "PageNavigation: pages is null or undefined")
  devWarn(safePages.length > 0, "PageNavigation: No pages provided")
  devWarn(
    safeCurrentPageIndex >= 0 && safeCurrentPageIndex < safePages.length,
    `PageNavigation: currentPageIndex (${safeCurrentPageIndex}) is out of bounds for ${safePages.length} pages`,
  )

  // Safe event handlers
  const handlePageChange = safeEventHandler(onPageChange, "PageNavigation.onPageChange")
  const handleReorderPages = safeEventHandler(onReorderPages, "PageNavigation.onReorderPages")

  devAssert(Array.isArray(safePages), "PageNavigation: pages should be an array")

  if (safePages.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-sm">No pages available</p>
      </div>
    )
  }

  if (safePages.length === 1) {
    const page = safePages[0]
    const pageTitle = safeString(page?.title, "Page 1")

    return (
      <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <span className="text-blue-800 font-medium">{pageTitle}</span>
      </div>
    )
  }

  const canMoveLeft = safeCurrentPageIndex > 0
  const canMoveRight = safeCurrentPageIndex < safePages.length - 1

  const handleMoveLeft = () => {
    if (canMoveLeft) {
      handleReorderPages(safeCurrentPageIndex, safeCurrentPageIndex - 1)
    }
  }

  const handleMoveRight = () => {
    if (canMoveRight) {
      handleReorderPages(safeCurrentPageIndex, safeCurrentPageIndex + 1)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
      {/* Left Arrow */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleMoveLeft}
        disabled={!canMoveLeft}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Move Left
      </Button>

      {/* Page Tabs */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        {safePages.map((page, index) => {
          const pageObj = page || {}
          const pageTitle = safeString(pageObj.title, `Page ${index + 1}`)
          const isActive = index === safeCurrentPageIndex

          return (
            <Button
              key={`page_${index}`}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(index)}
              className={`min-w-[100px] ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {pageTitle}
            </Button>
          )
        })}
      </div>

      {/* Right Arrow */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleMoveRight}
        disabled={!canMoveRight}
        className="flex items-center gap-2"
      >
        Move Right
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

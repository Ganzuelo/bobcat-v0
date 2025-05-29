"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToHorizontalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import type { FormPage, FormSection, FormField } from "@/lib/form-types"
import { SortablePageTab } from "./sortable-page-tab"

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
  const [isDragging, setIsDragging] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = pages.findIndex((page) => page.id === active.id)
      const newIndex = pages.findIndex((page) => page.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedPages = arrayMove(pages, oldIndex, newIndex)

        // Update page_order for all pages
        const updatedPages = reorderedPages.map((page, index) => ({
          ...page,
          page_order: index + 1,
        }))

        onReorderPages?.(updatedPages)

        // Update current page index if the current page was moved
        if (oldIndex === currentPageIndex) {
          onPageChange(newIndex)
        } else if (oldIndex < currentPageIndex && newIndex >= currentPageIndex) {
          onPageChange(currentPageIndex - 1)
        } else if (oldIndex > currentPageIndex && newIndex <= currentPageIndex) {
          onPageChange(currentPageIndex + 1)
        }
      }
    }
  }

  const handleMoveLeft = (index: number) => {
    if (index > 0) {
      const reorderedPages = arrayMove(pages, index, index - 1)
      const updatedPages = reorderedPages.map((page, idx) => ({
        ...page,
        page_order: idx + 1,
      }))

      onReorderPages?.(updatedPages)

      // Update current page index
      if (index === currentPageIndex) {
        onPageChange(index - 1)
      } else if (index - 1 === currentPageIndex) {
        onPageChange(index)
      }
    }
  }

  const handleMoveRight = (index: number) => {
    if (index < pages.length - 1) {
      const reorderedPages = arrayMove(pages, index, index + 1)
      const updatedPages = reorderedPages.map((page, idx) => ({
        ...page,
        page_order: idx + 1,
      }))

      onReorderPages?.(updatedPages)

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
      {/* Navigation Arrows */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Tabs */}
        <div className="flex items-center gap-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
          >
            <SortableContext items={pages.map((p) => p.id)} strategy={horizontalListSortingStrategy}>
              <div className="flex items-center gap-2">
                {pages.map((page, index) => (
                  <SortablePageTab
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
            </SortableContext>
          </DndContext>
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

      {/* Add Page Button */}
      <Button variant="outline" size="sm" onClick={onAddPage}>
        <Plus className="h-4 w-4 mr-2" />
        Add Page
      </Button>
    </div>
  )
}

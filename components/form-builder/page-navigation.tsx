"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import type { FormPage, FormSection, FormField } from "@/lib/form-types"
import { SortablePage } from "./sortable-page"

interface PageNavigationProps {
  pages: (FormPage & { sections: (FormSection & { fields: FormField[] })[] })[]
  currentPageIndex: number
  onPageChange: (index: number) => void
  onAddPage: () => void
  onReorderPages?: (pages: (FormPage & { sections: (FormSection & { fields: FormField[] })[] })[]) => void
  onEditPage?: (page: FormPage) => void
}

export function PageNavigation({
  pages,
  currentPageIndex,
  onPageChange,
  onAddPage,
  onReorderPages,
  onEditPage,
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

  const handleMoveUp = (index: number) => {
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

  const handleMoveDown = (index: number) => {
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
    <div className="flex flex-col gap-4 p-4 border-b bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Pages</h3>
        <Button variant="outline" size="sm" onClick={onAddPage}>
          <Plus className="h-4 w-4 mr-2" />
          Add Page
        </Button>
      </div>

      {/* Pages List */}
      <div className="space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {pages.map((page, index) => (
              <SortablePage
                key={page.id}
                page={page}
                index={index}
                totalPages={pages.length}
                isActive={index === currentPageIndex}
                onPageChange={onPageChange}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onEditPage={onEditPage}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Page Counter */}
      <div className="text-xs text-muted-foreground text-center">
        Page {currentPageIndex + 1} of {pages.length}
      </div>
    </div>
  )
}

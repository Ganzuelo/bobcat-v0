"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { SortableSection } from "./sortable-section"
import type { FormPage, FormSection, FormField } from "@/lib/form-types"

interface FormCanvasProps {
  page?: FormPage & { sections: (FormSection & { fields: FormField[] })[] }
  onAddSection: (pageId: string) => void
  onSelectField: (field: FormField) => void
  onSelectSection: (section: FormSection) => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onDeleteField: (fieldId: string) => void
  onDuplicateField: (fieldId: string) => void
}

export function FormCanvas({
  page,
  onAddSection,
  onSelectField,
  onSelectSection,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
}: FormCanvasProps) {
  const { setNodeRef } = useDroppable({
    id: "form-canvas",
  })

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No page selected</p>
          <p className="text-sm">Select a page to start building your form</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} className="p-6 min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{page.title}</CardTitle>
                {page.description && <p className="text-sm text-gray-600 mt-1">{page.description}</p>}
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Sections */}
        <SortableContext items={page.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {page.sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onSelectField={onSelectField}
                onSelectSection={onSelectSection}
                onUpdateField={onUpdateField}
                onDeleteField={onDeleteField}
                onDuplicateField={onDuplicateField}
              />
            ))}
          </div>
        </SortableContext>

        {/* Add Section Button */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="flex items-center justify-center py-8">
            <Button variant="ghost" onClick={() => onAddSection(page.id)} className="text-gray-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import type { FormSection } from "@/lib/form-types"

interface SectionEditorProps {
  section: FormSection
  onUpdate: (updates: Partial<FormSection>) => void
  onClose: () => void
}

export function SectionEditor({ section, onUpdate, onClose }: SectionEditorProps) {
  const [localSection, setLocalSection] = useState(section)

  const handleUpdate = (updates: Partial<FormSection>) => {
    const updatedSection = { ...localSection, ...updates }
    setLocalSection(updatedSection)
    onUpdate(updates)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Section Properties</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Basic Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">Title</Label>
              <Input
                id="section-title"
                value={localSection.title || ""}
                onChange={(e) => handleUpdate({ title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section-description">Description</Label>
              <Textarea
                id="section-description"
                value={localSection.description || ""}
                onChange={(e) => handleUpdate({ description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

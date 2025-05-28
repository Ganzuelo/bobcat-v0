"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from 'lucide-react'
import type { FormField } from "@/lib/form-types"
import { FIELD_WIDTH_OPTIONS } from "@/lib/form-width-utils"

interface BasicTabProps {
  field: FormField
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
}

export function BasicTab({ field, onUpdateField }: BasicTabProps) {
  return (
    <div className="space-y-4 mt-0">
      <div>
        <Label htmlFor="field-label">Label *</Label>
        <Input
          id="field-label"
          value={field.label || ""}
          onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
          placeholder="Enter field label"
        />
      </div>

      <div>
        <Label htmlFor="field-placeholder">Placeholder</Label>
        <Input
          id="field-placeholder"
          value={field.placeholder || ""}
          onChange={(e) => onUpdateField(field.id, { placeholder: e.target.value })}
          placeholder="Enter placeholder text"
        />
      </div>

      <div>
        <Label htmlFor="field-help">Help Text</Label>
        <Textarea
          id="field-help"
          value={field.help_text || ""}
          onChange={(e) => onUpdateField(field.id, { help_text: e.target.value })}
          placeholder="Provide additional guidance"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="field-width">Field Width</Label>
        <select
          id="field-width"
          value={field.width || "full"}
          onChange={(e) => onUpdateField(field.id, { width: e.target.value as any })}
          className="w-full p-2 border rounded-md"
        >
          {FIELD_WIDTH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Options for select, checkbox, radio fields */}
      {(field.field_type === "select" || field.field_type === "checkbox" || field.field_type === "radio") && (
        <div>
          <Label>Options</Label>
          <div className="space-y-2 mt-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={option.label || ""}
                  onChange={(e) => {
                    const newOptions = [...(field.options || [])]
                    newOptions[index] = { ...option, label: e.target.value }
                    onUpdateField(field.id, { options: newOptions })
                  }}
                />
                <Input
                  placeholder="Value"
                  value={option.value || ""}
                  onChange={(e) => {
                    const newOptions = [...(field.options || [])]
                    newOptions[index] = { ...option, value: e.target.value }
                    onUpdateField(field.id, { options: newOptions })
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newOptions = field.options?.filter((_, i) => i !== index) || []
                    onUpdateField(field.id, { options: newOptions })
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newOptions = [...(field.options || []), { label: "New Option", value: `option_${Date.now()}` }]
                onUpdateField(field.id, { options: newOptions })
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

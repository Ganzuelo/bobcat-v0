"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Code, Settings } from "lucide-react"
import type { FormField } from "@/lib/form-types"
import type { AdvancedState } from "@/lib/field-editor-types"
import { Card } from "@/components/ui/card"

interface AdvancedTabProps {
  advancedState: AdvancedState
  updateAdvancedState: (updates: Partial<AdvancedState>) => void
  otherFields: FormField[]
  toggleFieldDependency: (fieldId: string) => void
  newAttributeKey: string
  setNewAttributeKey: (value: string) => void
  newAttributeValue: string
  setNewAttributeValue: (value: string) => void
  addCustomAttribute: () => void
  removeCustomAttribute: (index: number) => void
  updateCustomAttribute: (index: number, key: string, value: string) => void
}

export function AdvancedTab({
  advancedState,
  updateAdvancedState,
  otherFields,
  toggleFieldDependency,
  newAttributeKey,
  setNewAttributeKey,
  newAttributeValue,
  setNewAttributeValue,
  addCustomAttribute,
  removeCustomAttribute,
  updateCustomAttribute,
}: AdvancedTabProps) {
  return (
    <div className="space-y-4 mt-0">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5" />
        <div>
          <h3 className="font-medium">Power User Settings</h3>
          <p className="text-sm text-muted-foreground">Advanced configuration options for developers</p>
        </div>
      </div>

      {/* Visibility Mode */}
      <div>
        <Label htmlFor="visibility-mode">Visibility Mode</Label>
        <Select
          value={advancedState.visibilityMode}
          onValueChange={(value) => updateAdvancedState({ visibilityMode: value })}
        >
          <SelectTrigger id="visibility-mode">
            <SelectValue placeholder="Select visibility mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visible">Visible</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
            <SelectItem value="readonly">Read Only</SelectItem>
            <SelectItem value="developer-only">Developer Only</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">Controls how this field appears in the form interface</p>
      </div>

      {/* Calculated Field */}
      <div>
        <Label htmlFor="calculated-field">Calculated Field</Label>
        <div className="relative">
          <Code className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="calculated-field"
            value={advancedState.calculatedField}
            onChange={(e) => updateAdvancedState({ calculatedField: e.target.value })}
            placeholder="e.g., {loan_amount} / {property_value} * 100"
            className="pl-10"
            rows={3}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Formula to calculate this field's value. Use {"{field_key}"} to reference other fields.
        </p>
      </div>

      {/* Custom onChange Logic */}
      <div>
        <Label htmlFor="custom-onchange">Custom onChange Logic</Label>
        <div className="relative">
          <Code className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="custom-onchange"
            value={advancedState.customOnChangeLogic}
            onChange={(e) => updateAdvancedState({ customOnChangeLogic: e.target.value })}
            placeholder="// JavaScript code executed when field value changes&#10;console.log('Field changed:', value);"
            className="pl-10 font-mono text-sm"
            rows={4}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          JavaScript code executed when this field's value changes. Available variables: value, field, form.
        </p>
      </div>

      {/* Depends On Fields */}
      <div>
        <Label>Depends On Fields</Label>
        <div className="space-y-2 mt-2">
          {otherFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other fields available</p>
          ) : (
            <div className="space-y-2">
              {otherFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`depends-${field.id}`}
                    checked={advancedState.dependsOnFields.includes(field.id)}
                    onCheckedChange={() => toggleFieldDependency(field.id)}
                  />
                  <Label htmlFor={`depends-${field.id}`} className="text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Select fields that this field depends on for calculations or validation
        </p>
      </div>

      {/* Custom Attributes */}
      <div>
        <Label>Custom Attributes</Label>
        <div className="space-y-3 mt-2">
          {/* Existing attributes */}
          {advancedState.customAttributes.map((attr, index) => (
            <Card key={index} className="p-3">
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Key"
                    value={attr.key}
                    onChange={(e) => updateCustomAttribute(index, e.target.value, attr.value)}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Value"
                    value={attr.value}
                    onChange={(e) => updateCustomAttribute(index, attr.key, e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeCustomAttribute(index)} className="mt-1">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {/* Add new attribute */}
          <Card className="p-3 border-dashed">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Attribute key"
                  value={newAttributeKey}
                  onChange={(e) => setNewAttributeKey(e.target.value)}
                />
                <Input
                  placeholder="Attribute value"
                  value={newAttributeValue}
                  onChange={(e) => setNewAttributeValue(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addCustomAttribute}
                disabled={!newAttributeKey.trim() || !newAttributeValue.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Add custom key-value pairs for specialized field behavior or integration
        </p>
      </div>
    </div>
  )
}

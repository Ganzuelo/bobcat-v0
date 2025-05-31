"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tag, X } from "lucide-react"
import type { FormField } from "@/lib/form-types"
import { XmlMappingSection } from "./xml-mapping-section"

interface MetadataTabProps {
  field: FormField
  onChange: (fieldId: string, updates: Partial<FormField>) => void
}

export function MetadataTab({ field, onChange }: MetadataTabProps) {
  // Initialize metadata state from field
  const [metadataState, setMetadataState] = useState({
    uad_field_id: field.metadata?.uad_field_id || "",
    fieldKey: field.metadata?.fieldKey || field.id || "",
    dataType: field.metadata?.dataType || "text",
    uadFieldName: field.metadata?.uadFieldName || "",
    tags: field.metadata?.tags || [],
    xml: field.metadata?.xml || {
      fieldId: "",
      path: "",
      required: false,
      format: "text",
    },
  })

  const [tagInput, setTagInput] = useState("")
  const [xmlMappingOpen, setXmlMappingOpen] = useState(false)

  // Update metadata state when field changes
  useEffect(() => {
    setMetadataState({
      uad_field_id: field.metadata?.uad_field_id || "",
      fieldKey: field.metadata?.fieldKey || field.id || "",
      dataType: field.metadata?.dataType || "text",
      uadFieldName: field.metadata?.uadFieldName || "",
      tags: field.metadata?.tags || [],
      xml: field.metadata?.xml || {
        fieldId: "",
        path: "",
        required: false,
        format: "text",
      },
    })
  }, [field])

  const updateMetadataState = (updates: Partial<typeof metadataState>) => {
    const newMetadataState = { ...metadataState, ...updates }
    setMetadataState(newMetadataState)

    // Update the field with new metadata
    onChange(field.id, {
      metadata: {
        ...field.metadata,
        ...updates,
      },
    })
  }

  const updateXmlMappingState = (updates: Partial<typeof metadataState.xml>) => {
    const newXmlState = { ...metadataState.xml, ...updates }
    updateMetadataState({ xml: newXmlState })
  }

  const addTag = () => {
    if (tagInput.trim() && !metadataState.tags.includes(tagInput.trim())) {
      const newTags = [...metadataState.tags, tagInput.trim()]
      updateMetadataState({ tags: newTags })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    const newTags = metadataState.tags.filter((t) => t !== tag)
    updateMetadataState({ tags: newTags })
  }

  return (
    <div className="space-y-4 mt-0">
      {/* UAD Field ID Display - Read Only */}
      {metadataState.uad_field_id && (
        <div className="pb-2 border-b border-gray-100">
          <Label className="text-sm text-muted-foreground">UAD Field ID</Label>
          <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md border">
            <span className="text-sm font-mono text-gray-700">{metadataState.uad_field_id}</span>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="field-key">Field Key / ID</Label>
        <Input
          id="field-key"
          value={metadataState.fieldKey}
          onChange={(e) => updateMetadataState({ fieldKey: e.target.value })}
          placeholder="e.g., property_address, loan_amount"
        />
        <p className="text-xs text-muted-foreground mt-1">Unique identifier used in code and data exports</p>
      </div>

      <div>
        <Label htmlFor="data-type">Data Type</Label>
        <Select value={metadataState.dataType} onValueChange={(value) => updateMetadataState({ dataType: value })}>
          <SelectTrigger id="data-type">
            <SelectValue placeholder="Select data type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="enum">Enum</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">The data type used when exporting or processing this field</p>
      </div>

      <div>
        <Label htmlFor="uad-field-name">UAD Field Name</Label>
        <Input
          id="uad-field-name"
          value={metadataState.uadFieldName}
          onChange={(e) => updateMetadataState({ uadFieldName: e.target.value })}
          placeholder="e.g., Subject.City, Comp1.GLA"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Maps to official URAR/UAD field codes for export and compliance
        </p>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="space-y-2 mt-2">
          {/* Current tags */}
          {metadataState.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {metadataState.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add new tag */}
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Enter tag"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
              <Tag className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Add tags to categorize fields or group them by behavior</p>
        </div>
      </div>

      {/* XML Mapping Section */}
      <XmlMappingSection
        xmlMappingState={metadataState.xml}
        updateXmlMappingState={updateXmlMappingState}
        xmlMappingOpen={xmlMappingOpen}
        setXmlMappingOpen={setXmlMappingOpen}
      />
    </div>
  )
}

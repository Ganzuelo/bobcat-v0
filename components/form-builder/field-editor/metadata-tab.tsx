"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tag, X } from "lucide-react"
import type { MetadataState } from "@/lib/field-editor-types"
import { XmlMappingSection } from "./xml-mapping-section"

interface MetadataTabProps {
  metadataState: MetadataState
  updateMetadataState: (updates: Partial<MetadataState>) => void
  updateXmlMappingState: (updates: Partial<MetadataState["xml"]>) => void
  tagInput: string
  setTagInput: (value: string) => void
  addTag: () => void
  removeTag: (tag: string) => void
  xmlMappingOpen: boolean
  setXmlMappingOpen: (open: boolean) => void
}

export function MetadataTab({
  metadataState,
  updateMetadataState,
  updateXmlMappingState,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  xmlMappingOpen,
  setXmlMappingOpen,
}: MetadataTabProps) {
  return (
    <div className="space-y-4 mt-0">
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

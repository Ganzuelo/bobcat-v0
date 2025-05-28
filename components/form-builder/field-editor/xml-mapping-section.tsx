"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { XmlMappingState } from "@/lib/field-editor-types"

interface XmlMappingSectionProps {
  xmlMappingState: XmlMappingState
  updateXmlMappingState: (updates: Partial<XmlMappingState>) => void
  xmlMappingOpen: boolean
  setXmlMappingOpen: (open: boolean) => void
}

export function XmlMappingSection({
  xmlMappingState,
  updateXmlMappingState,
  xmlMappingOpen,
  setXmlMappingOpen,
}: XmlMappingSectionProps) {
  return (
    <Collapsible open={xmlMappingOpen} onOpenChange={setXmlMappingOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">XML Mapping</h3>
            <Badge variant="outline" className="text-xs">
              UAD 3.6
            </Badge>
          </div>
          {xmlMappingOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <p className="text-sm text-muted-foreground">
          Configure how this field maps to UAD 3.6 XML delivery specifications
        </p>

        <div>
          <Label htmlFor="mismo-path">MISMO Path</Label>
          <Input
            id="mismo-path"
            value={xmlMappingState.path}
            onChange={(e) => updateXmlMappingState({ path: e.target.value })}
            placeholder="e.g., Appraisal.Subject.PropertyAddress.City"
          />
          <p className="text-xs text-muted-foreground mt-1">Full XML path in the MISMO/UAD structure</p>
        </div>

        <div>
          <Label htmlFor="mismo-field-id">MISMO Field ID</Label>
          <Input
            id="mismo-field-id"
            value={xmlMappingState.fieldId}
            onChange={(e) => updateXmlMappingState({ fieldId: e.target.value })}
            placeholder="e.g., SubjectCity"
          />
          <p className="text-xs text-muted-foreground mt-1">MISMO standard field identifier</p>
        </div>

        <div>
          <Label htmlFor="expected-format">Expected Format</Label>
          <Select value={xmlMappingState.format} onValueChange={(value) => updateXmlMappingState({ format: value })}>
            <SelectTrigger id="expected-format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="numeric">Numeric</SelectItem>
              <SelectItem value="decimal">Decimal</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="date">Date (YYYY-MM-DD)</SelectItem>
              <SelectItem value="datetime">DateTime (ISO 8601)</SelectItem>
              <SelectItem value="MM/YYYY">MM/YYYY</SelectItem>
              <SelectItem value="YYYY">YYYY</SelectItem>
              <SelectItem value="C1-C6">C1-C6 (Condition Rating)</SelectItem>
              <SelectItem value="Q1-Q6">Q1-Q6 (Quality Rating)</SelectItem>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="custom">Custom Format</SelectItem>
            </SelectContent>
          </Select>
          {xmlMappingState.format === "custom" && (
            <Input
              className="mt-2"
              value={xmlMappingState.format}
              onChange={(e) => updateXmlMappingState({ format: e.target.value })}
              placeholder="Enter custom format specification"
            />
          )}
          <p className="text-xs text-muted-foreground mt-1">Expected data format for XML export validation</p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="delivery-required"
            checked={xmlMappingState.required}
            onCheckedChange={(checked) => updateXmlMappingState({ required: !!checked })}
          />
          <Label htmlFor="delivery-required">Delivery Required</Label>
          <p className="text-xs text-muted-foreground">This field is mandatory in XML output</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

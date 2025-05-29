"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Database, Globe, Settings, Info, TestTube, ArrowRight } from "lucide-react"
import type { PrefillConfig } from "@/lib/form-types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface PrefillTabProps {
  prefillConfig: PrefillConfig
  updatePrefillConfig: (updates: Partial<PrefillConfig>) => void
  onTestPrefill: () => void
  carryforwardConfig: CarryforwardState
  updateCarryforwardConfig: (updates: Partial<CarryforwardState>) => void
  availableFields: Array<{ id: string; label: string; field_type: string }>
}

export interface CarryforwardState {
  enabled: boolean
  source: string | null
  mode: "default" | "live"
}

export function PrefillTab({
  prefillConfig,
  updatePrefillConfig,
  onTestPrefill,
  carryforwardConfig,
  updateCarryforwardConfig,
  availableFields,
}: PrefillTabProps) {
  const [fieldMapKey, setFieldMapKey] = useState("")
  const [fieldMapValue, setFieldMapValue] = useState("")

  // Add field mapping
  const addFieldMapping = () => {
    if (fieldMapKey.trim() && fieldMapValue.trim()) {
      const newFieldMap = {
        ...prefillConfig.fieldMap,
        [fieldMapKey.trim()]: fieldMapValue.trim(),
      }
      updatePrefillConfig({ fieldMap: newFieldMap })
      setFieldMapKey("")
      setFieldMapValue("")
    }
  }

  // Remove field mapping
  const removeFieldMapping = (key: string) => {
    const newFieldMap = { ...prefillConfig.fieldMap }
    delete newFieldMap[key]
    updatePrefillConfig({ fieldMap: newFieldMap })
  }

  // Get source icon
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "api":
        return <Globe className="h-4 w-4" />
      case "internal":
        return <Settings className="h-4 w-4" />
      case "lookup":
        return <Database className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  // Get source description
  const getSourceDescription = (source: string) => {
    switch (source) {
      case "api":
        return "Fetch data from external API endpoints"
      case "internal":
        return "Use data from internal application context"
      case "lookup":
        return "Use predefined lookup tables and static data"
      default:
        return "Select a data source"
    }
  }

  // Get carry forward preview text
  const getCarryforwardPreview = () => {
    if (!carryforwardConfig.enabled || !carryforwardConfig.source) {
      return "No carry forward configured"
    }

    const sourceField = availableFields.find((f) => f.id === carryforwardConfig.source)
    const fieldName = sourceField?.label || `field_${carryforwardConfig.source.substring(0, 8)}`
    const mode = carryforwardConfig.mode === "live" ? "Live mirroring" : "Default only"

    return `${mode} from '${fieldName}'`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ArrowRight className="h-5 w-5" />
        <div>
          <h3 className="font-medium">Data Sources</h3>
          <p className="text-sm text-muted-foreground">
            Configure how this field gets populated with data from various sources
          </p>
        </div>
      </div>

      {/* Carry Forward Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          <span className="font-medium text-sm">Carry Forward</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="carryforward-enabled">Enable Carry Forward</Label>
            <p className="text-xs text-muted-foreground">Copy data from another field in this form</p>
          </div>
          <Switch
            id="carryforward-enabled"
            checked={carryforwardConfig.enabled}
            onCheckedChange={(enabled) => updateCarryforwardConfig({ enabled })}
          />
        </div>

        {carryforwardConfig.enabled && (
          <div className="space-y-3 pl-6 border-l-2 border-muted">
            {/* Source Field */}
            <div className="space-y-2">
              <Label htmlFor="source-field">Source Field</Label>
              <Select
                value={carryforwardConfig.source}
                onValueChange={(value) => updateCarryforwardConfig({ source: value })}
              >
                <SelectTrigger id="source-field">
                  <SelectValue placeholder="Select source field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.label || `Field ${field.id.substring(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select the field from which to carry forward data</p>
            </div>

            {/* Carry Mode */}
            <div className="space-y-3">
              <Label>Carry Mode</Label>
              <RadioGroup
                value={carryforwardConfig.mode}
                onValueChange={(value) => updateCarryforwardConfig({ mode: value })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="mode-default" />
                  <Label htmlFor="mode-default" className="cursor-pointer text-sm">
                    Default only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="live" id="mode-live" />
                  <Label htmlFor="mode-live" className="cursor-pointer text-sm">
                    Live mirror
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Default only: Copy value once when form loads. Live mirror: Update in real-time as source changes.
              </p>
            </div>

            {/* Preview */}
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs font-medium mb-1">Preview:</p>
              <p className="text-xs text-muted-foreground italic">{getCarryforwardPreview()}</p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Dynamic Prefill Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span className="font-medium text-sm">Dynamic Prefill</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="prefill-enabled">Enable Dynamic Prefill</Label>
            <p className="text-xs text-muted-foreground">Automatically populate this field with external data</p>
          </div>
          <Switch
            id="prefill-enabled"
            checked={prefillConfig.enabled}
            onCheckedChange={(enabled) => updatePrefillConfig({ enabled })}
          />
        </div>

        {prefillConfig.enabled && (
          <div className="space-y-4 pl-6 border-l-2 border-muted">
            {/* Data Source */}
            <div className="space-y-3">
              <Label>Data Source</Label>
              <Select value={prefillConfig.source} onValueChange={(source) => updatePrefillConfig({ source })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Internal Context</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="api">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>External API</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="lookup">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>Lookup Table</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {getSourceIcon(prefillConfig.source)}
                {getSourceDescription(prefillConfig.source)}
              </p>
            </div>

            {/* Source-specific Configuration */}
            {prefillConfig.source === "internal" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="context-key">Context Key</Label>
                  <Input
                    id="context-key"
                    value={prefillConfig.key || ""}
                    onChange={(e) => updatePrefillConfig({ key: e.target.value })}
                    placeholder="e.g., user.email, form.subject_id"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use dot notation to access nested properties (user.name, form.borrower_id)
                  </p>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs font-medium mb-2">Available Context Keys:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <Badge variant="outline">user.id</Badge>
                    <Badge variant="outline">user.email</Badge>
                    <Badge variant="outline">user.name</Badge>
                    <Badge variant="outline">user.organization_id</Badge>
                    <Badge variant="outline">form.subject_id</Badge>
                    <Badge variant="outline">form.property_id</Badge>
                    <Badge variant="outline">form.borrower_id</Badge>
                    <Badge variant="outline">form.appraiser_id</Badge>
                  </div>
                </div>
              </div>
            )}

            {prefillConfig.source === "api" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input
                    id="api-endpoint"
                    value={prefillConfig.endpoint || ""}
                    onChange={(e) => updatePrefillConfig({ endpoint: e.target.value })}
                    placeholder="https://api.example.com/borrower/:id"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Full URL to the API endpoint. Use :id for dynamic parameters.
                  </p>
                </div>

                <div>
                  <Label htmlFor="retry-attempts">Retry Attempts</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    min="1"
                    max="10"
                    value={prefillConfig.retryAttempts || 3}
                    onChange={(e) => updatePrefillConfig({ retryAttempts: Number.parseInt(e.target.value) || 3 })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Number of retry attempts if the API call fails</p>
                </div>
              </div>
            )}

            {prefillConfig.source === "lookup" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="lookup-key">Lookup Table</Label>
                  <Select value={prefillConfig.key || ""} onValueChange={(key) => updatePrefillConfig({ key })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lookup table" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_roles">User Roles</SelectItem>
                      <SelectItem value="property_types">Property Types</SelectItem>
                      <SelectItem value="states">US States</SelectItem>
                      <SelectItem value="appraisal_purposes">Appraisal Purposes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select from predefined lookup tables with common data
                  </p>
                </div>
              </div>
            )}

            {/* Field Mapping */}
            {(prefillConfig.source === "api" || prefillConfig.source === "lookup") && (
              <div className="space-y-3">
                <Label>Field Mapping</Label>
                <p className="text-xs text-muted-foreground">Map response fields to form fields (optional)</p>

                {/* Existing mappings */}
                {prefillConfig.fieldMap && Object.keys(prefillConfig.fieldMap).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(prefillConfig.fieldMap).map(([sourceField, targetField]) => (
                      <div key={sourceField} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Badge variant="outline">{sourceField}</Badge>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Badge variant="outline">{targetField}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFieldMapping(sourceField)}
                          className="ml-auto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new mapping */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Source field"
                      value={fieldMapKey}
                      onChange={(e) => setFieldMapKey(e.target.value)}
                    />
                    <Input
                      placeholder="Target field ID"
                      value={fieldMapValue}
                      onChange={(e) => setFieldMapValue(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addFieldMapping}
                    disabled={!fieldMapKey.trim() || !fieldMapValue.trim()}
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Mapping
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  If no mapping is provided, the entire response will be used as the field value
                </p>
              </div>
            )}

            {/* Advanced Settings */}
            <div className="space-y-3">
              <Label>Advanced Settings</Label>

              <div>
                <Label htmlFor="fallback-value">Fallback Value</Label>
                <Input
                  id="fallback-value"
                  value={prefillConfig.fallbackValue?.toString() || ""}
                  onChange={(e) => updatePrefillConfig({ fallbackValue: e.target.value })}
                  placeholder="Default value if prefill fails"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Value to use if the prefill operation fails or returns no data
                </p>
              </div>

              <div>
                <Label htmlFor="cache-timeout">Cache Timeout (seconds)</Label>
                <Input
                  id="cache-timeout"
                  type="number"
                  min="0"
                  max="3600"
                  value={prefillConfig.cacheTimeout || 300}
                  onChange={(e) => updatePrefillConfig({ cacheTimeout: Number.parseInt(e.target.value) || 300 })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How long to cache the prefilled data (0 = no caching)
                </p>
              </div>
            </div>

            {/* Test Button */}
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={onTestPrefill} className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                Test Prefill Configuration
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Database, Globe, Settings, Info, TestTube, Copy, ArrowRight } from "lucide-react"
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

  return (
    <div className="space-y-6">
      {/* Carry Forward Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Copy className="h-4 w-4" />
            Copy from Another Field
          </CardTitle>
          <CardDescription>Copy data from another field in this form when the form loads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="carryforward-enabled" className="text-sm font-medium">
                Enable Copy Forward
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Automatically copy data from another field</p>
            </div>
            <Switch
              id="carryforward-enabled"
              checked={carryforwardConfig.enabled}
              onCheckedChange={(enabled) => updateCarryforwardConfig({ enabled })}
            />
          </div>

          {carryforwardConfig.enabled && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="source-field">Source Field</Label>
                <Select
                  value={carryforwardConfig.source || ""}
                  onValueChange={(value) => updateCarryforwardConfig({ source: value })}
                >
                  <SelectTrigger id="source-field">
                    <SelectValue placeholder="Select field to copy from" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.label || `Field ${field.id.substring(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Copy Mode</Label>
                <RadioGroup
                  value={carryforwardConfig.mode}
                  onValueChange={(value: "default" | "live") => updateCarryforwardConfig({ mode: value })}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="mode-default" />
                    <Label htmlFor="mode-default" className="cursor-pointer text-sm font-normal">
                      Copy once when form loads
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="live" id="mode-live" />
                    <Label htmlFor="mode-live" className="cursor-pointer text-sm font-normal">
                      Mirror changes in real-time
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {carryforwardConfig.source && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs font-medium mb-1">Preview:</p>
                  <p className="text-xs text-muted-foreground">
                    {carryforwardConfig.mode === "live" ? "Live mirroring" : "Copy once"} from '
                    {availableFields.find((f) => f.id === carryforwardConfig.source)?.label || "Selected field"}'
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* External Data Source Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            External Data Source
          </CardTitle>
          <CardDescription>Automatically populate this field with data from external sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="prefill-enabled" className="text-sm font-medium">
                Enable External Prefill
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Fetch data from APIs, databases, or lookup tables</p>
            </div>
            <Switch
              id="prefill-enabled"
              checked={prefillConfig.enabled}
              onCheckedChange={(enabled) => updatePrefillConfig({ enabled })}
            />
          </div>

          {prefillConfig.enabled && (
            <div className="space-y-4 pt-2">
              {/* Data Source Selection */}
              <div className="space-y-2">
                <Label>Data Source Type</Label>
                <Select
                  value={prefillConfig.source}
                  onValueChange={(source: "api" | "internal" | "lookup") => updatePrefillConfig({ source })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Internal Context</div>
                          <div className="text-xs text-muted-foreground">User data, form context</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="api">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <div>
                          <div className="font-medium">External API</div>
                          <div className="text-xs text-muted-foreground">REST endpoints, web services</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="lookup">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Lookup Table</div>
                          <div className="text-xs text-muted-foreground">Predefined data sets</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                    <p className="text-xs text-muted-foreground mt-1">Use dot notation to access nested properties</p>
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs font-medium mb-2">Available Context:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <Badge variant="outline" className="text-xs">
                        user.id
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        user.email
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        user.name
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        form.subject_id
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        form.property_id
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        form.borrower_id
                      </Badge>
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
                    <p className="text-xs text-muted-foreground mt-1">Use :id for dynamic parameters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
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
                    </div>
                    <div>
                      <Label htmlFor="cache-timeout">Cache (seconds)</Label>
                      <Input
                        id="cache-timeout"
                        type="number"
                        min="0"
                        max="3600"
                        value={prefillConfig.cacheTimeout || 300}
                        onChange={(e) => updatePrefillConfig({ cacheTimeout: Number.parseInt(e.target.value) || 300 })}
                      />
                    </div>
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
                  </div>
                </div>
              )}

              {/* Field Mapping */}
              {(prefillConfig.source === "api" || prefillConfig.source === "lookup") && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Field Mapping</Label>
                    <p className="text-xs text-muted-foreground">Map response fields to form fields (optional)</p>
                  </div>

                  {/* Existing mappings */}
                  {prefillConfig.fieldMap && Object.keys(prefillConfig.fieldMap).length > 0 && (
                    <div className="space-y-2">
                      {Object.entries(prefillConfig.fieldMap).map(([sourceField, targetField]) => (
                        <div key={sourceField} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Badge variant="outline" className="text-xs">
                            {sourceField}
                          </Badge>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            {targetField}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFieldMapping(sourceField)}
                            className="ml-auto h-6 w-6 p-0"
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
                        className="text-sm"
                      />
                      <Input
                        placeholder="Target field ID"
                        value={fieldMapValue}
                        onChange={(e) => setFieldMapValue(e.target.value)}
                        className="text-sm"
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
                </div>
              )}

              {/* Fallback Value */}
              <div>
                <Label htmlFor="fallback-value">Fallback Value</Label>
                <Input
                  id="fallback-value"
                  value={prefillConfig.fallbackValue?.toString() || ""}
                  onChange={(e) => updatePrefillConfig({ fallbackValue: e.target.value })}
                  placeholder="Default value if prefill fails"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used when the data source is unavailable or returns no data
                </p>
              </div>

              {/* Test Button */}
              <Button variant="outline" onClick={onTestPrefill} className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                Test Configuration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

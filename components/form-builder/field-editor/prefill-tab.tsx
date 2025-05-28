"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Database, Globe, Settings, Info, TestTube } from "lucide-react"
import type { PrefillConfig } from "@/lib/form-types"

interface PrefillTabProps {
  prefillConfig: PrefillConfig
  updatePrefillConfig: (updates: Partial<PrefillConfig>) => void
  onTestPrefill: () => void
}

export function PrefillTab({ prefillConfig, updatePrefillConfig, onTestPrefill }: PrefillTabProps) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5" />
        <div>
          <h3 className="font-medium">Dynamic Prefill</h3>
          <p className="text-sm text-muted-foreground">Automatically populate field values from various data sources</p>
        </div>
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="prefill-enabled">Enable Prefill</Label>
          <p className="text-xs text-muted-foreground">Automatically populate this field with data</p>
        </div>
        <Switch
          id="prefill-enabled"
          checked={prefillConfig.enabled}
          onCheckedChange={(enabled) => updatePrefillConfig({ enabled })}
        />
      </div>

      {prefillConfig.enabled && (
        <>
          <Separator />

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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Internal Context</CardTitle>
                <CardDescription>Access data from the current user session or form context</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          )}

          {prefillConfig.source === "api" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">External API</CardTitle>
                <CardDescription>Fetch data from external REST API endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          )}

          {prefillConfig.source === "lookup" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Lookup Table</CardTitle>
                <CardDescription>Use predefined lookup tables for static data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          )}

          {/* Field Mapping */}
          {(prefillConfig.source === "api" || prefillConfig.source === "lookup") && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Field Mapping</CardTitle>
                <CardDescription>Map response fields to form fields (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          )}

          {/* Advanced Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Test Button */}
          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={onTestPrefill} className="w-full">
              <TestTube className="h-4 w-4 mr-2" />
              Test Prefill Configuration
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

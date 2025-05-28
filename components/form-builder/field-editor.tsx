"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus, Trash2, Lightbulb, Calculator, Database } from "lucide-react"
import { FIELD_WIDTH_CONFIG, VALIDATION_PATTERNS, URAR_FIELD_TEMPLATES, getFieldTypeConfig } from "@/lib/form-types"
import {
  CARDINALITY_OPTIONS,
  CONDITIONALITY_OPTIONS,
  OUTPUT_FORMAT_OPTIONS,
  VALIDATION_OPERATORS,
  LOGICAL_OPERATORS,
  DATA_SOURCES,
  URAR_CATEGORIES,
} from "@/lib/form-constants"
import type { FormField, FieldOption, ValidationRule } from "@/lib/form-types"

interface FieldEditorProps {
  field: FormField
  availableFields?: FormField[]
  onUpdate: (updates: Partial<FormField>) => void
  onClose: () => void
}

export function FieldEditor({ field, availableFields = [], onUpdate, onClose }: FieldEditorProps) {
  const [localField, setLocalField] = useState(field)
  const [activeTab, setActiveTab] = useState("basic")
  const [urarSuggestions, setUrarSuggestions] = useState<string[]>([])

  const fieldConfig = getFieldTypeConfig(localField.field_type)

  useEffect(() => {
    // Generate URAR suggestions based on field label
    const suggestions = Object.keys(URAR_FIELD_TEMPLATES).filter(
      (key) =>
        key.toLowerCase().includes(localField.label.toLowerCase()) ||
        localField.label.toLowerCase().includes(key.replace(/_/g, " ")),
    )
    setUrarSuggestions(suggestions)
  }, [localField.label])

  const handleUpdate = (updates: Partial<FormField>) => {
    const updatedField = { ...localField, ...updates }
    setLocalField(updatedField)
    onUpdate(updates)
  }

  const addOption = () => {
    const newOption: FieldOption = {
      label: "New Option",
      value: `option_${Date.now()}`,
      disabled: false,
    }
    handleUpdate({
      options: [...(localField.options || []), newOption],
    })
  }

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const updatedOptions = [...(localField.options || [])]
    updatedOptions[index] = { ...updatedOptions[index], ...updates }
    handleUpdate({ options: updatedOptions })
  }

  const removeOption = (index: number) => {
    const updatedOptions = [...(localField.options || [])]
    updatedOptions.splice(index, 1)
    handleUpdate({ options: updatedOptions })
  }

  const addValidationRule = () => {
    const newRule: ValidationRule = {
      type: "required",
      value: true,
      message: "This field is required",
    }
    handleUpdate({
      validation: [...(localField.validation || []), newRule],
    })
  }

  const updateValidationRule = (index: number, updates: Partial<ValidationRule>) => {
    const updatedRules = [...(localField.validation || [])]
    updatedRules[index] = { ...updatedRules[index], ...updates }
    handleUpdate({ validation: updatedRules })
  }

  const removeValidationRule = (index: number) => {
    const updatedRules = [...(localField.validation || [])]
    updatedRules.splice(index, 1)
    handleUpdate({ validation: updatedRules })
  }

  const addCondition = () => {
    const newCondition = {
      fieldId: "",
      operator: "equals" as const,
      value: "",
      logicalOperator: "AND" as const,
    }

    const currentConditions = localField.conditional_visibility?.conditions || []
    handleUpdate({
      conditional_visibility: {
        ...localField.conditional_visibility,
        enabled: true,
        conditions: [...currentConditions, newCondition],
      },
    })
  }

  const updateCondition = (index: number, updates: any) => {
    const conditions = [...(localField.conditional_visibility?.conditions || [])]
    conditions[index] = { ...conditions[index], ...updates }
    handleUpdate({
      conditional_visibility: {
        ...localField.conditional_visibility,
        conditions,
      },
    })
  }

  const removeCondition = (index: number) => {
    const conditions = [...(localField.conditional_visibility?.conditions || [])]
    conditions.splice(index, 1)
    handleUpdate({
      conditional_visibility: {
        ...localField.conditional_visibility,
        conditions,
      },
    })
  }

  const applyUrarTemplate = (templateKey: string) => {
    const template = URAR_FIELD_TEMPLATES[templateKey]
    if (template) {
      handleUpdate({
        label: template.label || localField.label,
        field_type: template.field_type || localField.field_type,
        required: template.required !== undefined ? template.required : localField.required,
        metadata: {
          ...localField.metadata,
          ...template.metadata,
        },
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold">Field Properties</h3>
          <p className="text-sm text-muted-foreground">{fieldConfig.label} Field</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-6 mx-4 mt-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="conditional">Logic</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="calculated">Calculated</TabsTrigger>
            <TabsTrigger value="lookup">Lookup</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Basic Settings Tab */}
            <TabsContent value="basic" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Basic Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="field-label">Label *</Label>
                    <Input
                      id="field-label"
                      value={localField.label}
                      onChange={(e) => handleUpdate({ label: e.target.value })}
                      placeholder="Enter field label"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-placeholder">Placeholder</Label>
                    <Input
                      id="field-placeholder"
                      value={localField.placeholder || ""}
                      onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-help">Help Text</Label>
                    <Textarea
                      id="field-help"
                      value={localField.help_text || ""}
                      onChange={(e) => handleUpdate({ help_text: e.target.value })}
                      placeholder="Provide additional guidance for users"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={localField.required}
                      onCheckedChange={(checked) => handleUpdate({ required: checked })}
                    />
                    <Label>Required field</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-width">Field Width</Label>
                    <Select value={localField.width} onValueChange={(value: any) => handleUpdate({ width: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FIELD_WIDTH_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label} ({config.percentage})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Options (for select, radio, checkbox fields) */}
              {fieldConfig.supportsOptions && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Options</CardTitle>
                      <Button variant="outline" size="sm" onClick={addOption}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {localField.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Label"
                          value={option.label}
                          onChange={(e) => updateOption(index, { label: e.target.value })}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Value"
                          value={option.value}
                          onChange={(e) => updateOption(index, { value: e.target.value })}
                          className="flex-1"
                        />
                        <Switch
                          checked={!option.disabled}
                          onCheckedChange={(checked) => updateOption(index, { disabled: !checked })}
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(!localField.options || localField.options.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">No options added yet</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Validation Tab */}
            <TabsContent value="validation" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Validation Rules</CardTitle>
                    <Button variant="outline" size="sm" onClick={addValidationRule}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Rule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {localField.validation?.map((rule, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Select
                            value={rule.type}
                            onValueChange={(value: any) => updateValidationRule(index, { type: value })}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="required">Required</SelectItem>
                              <SelectItem value="min">Minimum</SelectItem>
                              <SelectItem value="max">Maximum</SelectItem>
                              <SelectItem value="minLength">Min Length</SelectItem>
                              <SelectItem value="maxLength">Max Length</SelectItem>
                              <SelectItem value="pattern">Pattern</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm" onClick={() => removeValidationRule(index)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {(rule.type === "min" ||
                          rule.type === "max" ||
                          rule.type === "minLength" ||
                          rule.type === "maxLength") && (
                          <Input
                            type="number"
                            placeholder="Value"
                            value={(rule.value as number) || ""}
                            onChange={(e) => updateValidationRule(index, { value: Number.parseInt(e.target.value) })}
                          />
                        )}

                        {rule.type === "pattern" && (
                          <div className="space-y-2">
                            <Input
                              placeholder="Regular expression pattern"
                              value={rule.pattern || ""}
                              onChange={(e) => updateValidationRule(index, { pattern: e.target.value })}
                            />
                            <Select onValueChange={(value) => updateValidationRule(index, { pattern: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Or select a common pattern" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={VALIDATION_PATTERNS.EMAIL.source}>Email</SelectItem>
                                <SelectItem value={VALIDATION_PATTERNS.PHONE.source}>Phone</SelectItem>
                                <SelectItem value={VALIDATION_PATTERNS.URL.source}>URL</SelectItem>
                                <SelectItem value={VALIDATION_PATTERNS.ZIP_CODE.source}>ZIP Code</SelectItem>
                                <SelectItem value={VALIDATION_PATTERNS.SSN.source}>SSN</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {rule.type === "custom" && (
                          <Textarea
                            placeholder="Custom validation function (JavaScript)"
                            value={rule.customFunction || ""}
                            onChange={(e) => updateValidationRule(index, { customFunction: e.target.value })}
                            rows={3}
                          />
                        )}

                        <Input
                          placeholder="Error message"
                          value={rule.message || ""}
                          onChange={(e) => updateValidationRule(index, { message: e.target.value })}
                        />
                      </div>
                    </Card>
                  ))}
                  {(!localField.validation || localField.validation.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No validation rules added</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conditional Logic Tab */}
            <TabsContent value="conditional" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conditional Visibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={localField.conditional_visibility?.enabled || false}
                      onCheckedChange={(checked) =>
                        handleUpdate({
                          conditional_visibility: {
                            ...localField.conditional_visibility,
                            enabled: checked,
                          },
                        })
                      }
                    />
                    <Label>Enable conditional visibility</Label>
                  </div>

                  {localField.conditional_visibility?.enabled && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Conditions</Label>
                        <Button variant="outline" size="sm" onClick={addCondition}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Condition
                        </Button>
                      </div>

                      {localField.conditional_visibility?.conditions?.map((condition, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Condition {index + 1}</span>
                              <Button variant="ghost" size="sm" onClick={() => removeCondition(index)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <Select
                                value={condition.fieldId}
                                onValueChange={(value) => updateCondition(index, { fieldId: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableFields.map((field) => (
                                    <SelectItem key={field.id} value={field.id}>
                                      {field.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={condition.operator}
                                onValueChange={(value) => updateCondition(index, { operator: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {VALIDATION_OPERATORS.map((op) => (
                                    <SelectItem key={op.value} value={op.value}>
                                      {op.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Input
                                placeholder="Value"
                                value={(condition.value as string) || ""}
                                onChange={(e) => updateCondition(index, { value: e.target.value })}
                              />
                            </div>

                            {index < (localField.conditional_visibility?.conditions?.length || 0) - 1 && (
                              <Select
                                value={condition.logicalOperator}
                                onValueChange={(value) => updateCondition(index, { logicalOperator: value })}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {LOGICAL_OPERATORS.map((op) => (
                                    <SelectItem key={op.value} value={op.value}>
                                      {op.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-6 mt-0">
              {/* URAR Suggestions */}
              {urarSuggestions.length > 0 && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">URAR Field Suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {urarSuggestions.map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            onClick={() => applyUrarTemplate(suggestion)}
                          >
                            {suggestion.replace(/_/g, " ")}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">URAR Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Report Field ID</Label>
                    <Input
                      value={localField.metadata?.reportFieldId || ""}
                      onChange={(e) =>
                        handleUpdate({
                          metadata: {
                            ...localField.metadata,
                            reportFieldId: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., 1004"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>MISMO Field ID</Label>
                    <Input
                      value={localField.metadata?.mismoFieldId || ""}
                      onChange={(e) =>
                        handleUpdate({
                          metadata: {
                            ...localField.metadata,
                            mismoFieldId: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., SubjectPropertyAddress"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cardinality</Label>
                    <Select
                      value={localField.metadata?.cardinality || ""}
                      onValueChange={(value) =>
                        handleUpdate({
                          metadata: {
                            ...localField.metadata,
                            cardinality: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cardinality" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARDINALITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Conditionality</Label>
                    <Select
                      value={localField.metadata?.conditionality || ""}
                      onValueChange={(value) =>
                        handleUpdate({
                          metadata: {
                            ...localField.metadata,
                            conditionality: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select conditionality" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONALITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select
                      value={localField.metadata?.outputFormat || ""}
                      onValueChange={(value) =>
                        handleUpdate({
                          metadata: {
                            ...localField.metadata,
                            outputFormat: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select output format" />
                      </SelectTrigger>
                      <SelectContent>
                        {OUTPUT_FORMAT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={localField.metadata?.category || ""}
                      onValueChange={(value) =>
                        handleUpdate({
                          metadata: {
                            ...localField.metadata,
                            category: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {URAR_CATEGORIES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Documentation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Documentation</Label>
                    <Textarea
                      value={localField.metadata?.documentation || ""}
                      onChange={(e) =>
                        handleUpdate({
                          metadata: {
                            ...localField.metadata,
                            documentation: e.target.value,
                          },
                        })
                      }
                      placeholder="Field documentation and usage notes"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={localField.metadata?.notes || ""}
                      onChange={(e) =>
                        handleUpdate({
                          metadata: {
                            ...localField.metadata,
                            notes: e.target.value,
                          },
                        })
                      }
                      placeholder="Additional notes"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calculated Fields Tab */}
            <TabsContent value="calculated" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculated Field Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={localField.calculated_config?.enabled || false}
                      onCheckedChange={(checked) =>
                        handleUpdate({
                          calculated_config: {
                            ...localField.calculated_config,
                            enabled: checked,
                          },
                        })
                      }
                    />
                    <Label>Enable calculated field</Label>
                  </div>

                  {localField.calculated_config?.enabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Formula</Label>
                        <Textarea
                          value={localField.calculated_config?.formula || ""}
                          onChange={(e) =>
                            handleUpdate({
                              calculated_config: {
                                ...localField.calculated_config,
                                formula: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., {loan_amount} / {property_value} * 100"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500">
                          Use {"{field_id}"} to reference other fields. Supports +, -, *, /, Math functions.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Output Format</Label>
                        <Select
                          value={localField.calculated_config?.outputFormat || ""}
                          onValueChange={(value) =>
                            handleUpdate({
                              calculated_config: {
                                ...localField.calculated_config,
                                outputFormat: value,
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            {OUTPUT_FORMAT_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Decimal Precision</Label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={localField.calculated_config?.precision || 2}
                          onChange={(e) =>
                            handleUpdate({
                              calculated_config: {
                                ...localField.calculated_config,
                                precision: Number.parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Referenced Fields</Label>
                        <div className="flex flex-wrap gap-2">
                          {availableFields.map((field) => (
                            <Badge key={field.id} variant="outline" className="text-xs">
                              {field.label} ({field.id})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lookup Fields Tab */}
            <TabsContent value="lookup" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Lookup Field Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={localField.lookup_config?.enabled || false}
                      onCheckedChange={(checked) =>
                        handleUpdate({
                          lookup_config: {
                            ...localField.lookup_config,
                            enabled: checked,
                          },
                        })
                      }
                    />
                    <Label>Enable lookup field</Label>
                  </div>

                  {localField.lookup_config?.enabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Data Source</Label>
                        <Select
                          value={localField.lookup_config?.dataSource || ""}
                          onValueChange={(value: any) =>
                            handleUpdate({
                              lookup_config: {
                                ...localField.lookup_config,
                                dataSource: value,
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select data source" />
                          </SelectTrigger>
                          <SelectContent>
                            {DATA_SOURCES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {localField.lookup_config?.dataSource === "api" && (
                        <div className="space-y-2">
                          <Label>API Endpoint</Label>
                          <Input
                            value={localField.lookup_config?.endpoint || ""}
                            onChange={(e) =>
                              handleUpdate({
                                lookup_config: {
                                  ...localField.lookup_config,
                                  endpoint: e.target.value,
                                },
                              })
                            }
                            placeholder="https://api.example.com/data"
                          />
                        </div>
                      )}

                      {localField.lookup_config?.dataSource === "database" && (
                        <>
                          <div className="space-y-2">
                            <Label>Table Name</Label>
                            <Input
                              value={localField.lookup_config?.table || ""}
                              onChange={(e) =>
                                handleUpdate({
                                  lookup_config: {
                                    ...localField.lookup_config,
                                    table: e.target.value,
                                  },
                                })
                              }
                              placeholder="table_name"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Key Field</Label>
                              <Input
                                value={localField.lookup_config?.keyField || ""}
                                onChange={(e) =>
                                  handleUpdate({
                                    lookup_config: {
                                      ...localField.lookup_config,
                                      keyField: e.target.value,
                                    },
                                  })
                                }
                                placeholder="id"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Value Field</Label>
                              <Input
                                value={localField.lookup_config?.valueField || ""}
                                onChange={(e) =>
                                  handleUpdate({
                                    lookup_config: {
                                      ...localField.lookup_config,
                                      valueField: e.target.value,
                                    },
                                  })
                                }
                                placeholder="name"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label>Cache Timeout (seconds)</Label>
                        <Input
                          type="number"
                          value={localField.lookup_config?.cacheTimeout || 300}
                          onChange={(e) =>
                            handleUpdate({
                              lookup_config: {
                                ...localField.lookup_config,
                                cacheTimeout: Number.parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

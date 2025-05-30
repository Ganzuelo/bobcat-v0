"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react"
import type { FormField } from "@/lib/form-types"

interface ConditionalTabProps {
  field: FormField
  onChange: (fieldId: string, updates: Partial<FormField>) => void
}

interface ConditionalRule {
  id: string
  fieldId: string
  operator: string
  value: string
  logicalOperator?: "AND" | "OR"
}

export function ConditionalTab({ field, onChange }: ConditionalTabProps) {
  const [rules, setRules] = useState<ConditionalRule[]>(
    field.conditional_visibility?.conditions?.map((condition, index) => ({
      id: `rule-${index}`,
      fieldId: condition.fieldId,
      operator: condition.operator,
      value: condition.value?.toString() || "",
      logicalOperator: condition.logicalOperator,
    })) || [],
  )

  const [newRule, setNewRule] = useState<Partial<ConditionalRule>>({
    fieldId: "",
    operator: "equals",
    value: "",
  })

  const operators = [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Does Not Contain" },
    { value: "greater_than", label: "Greater Than" },
    { value: "less_than", label: "Less Than" },
    { value: "is_empty", label: "Is Empty" },
    { value: "is_not_empty", label: "Is Not Empty" },
  ]

  const updateConditionalVisibility = (enabled: boolean, conditions?: any[]) => {
    onChange(field.id, {
      conditional_visibility: {
        enabled,
        conditions:
          conditions ||
          rules.map((rule) => ({
            fieldId: rule.fieldId,
            operator: rule.operator,
            value: rule.value,
            logicalOperator: rule.logicalOperator,
          })),
      },
    })
  }

  const addRule = () => {
    if (!newRule.fieldId || !newRule.operator) return

    const rule: ConditionalRule = {
      id: `rule-${Date.now()}`,
      fieldId: newRule.fieldId,
      operator: newRule.operator,
      value: newRule.value || "",
      logicalOperator: rules.length > 0 ? "AND" : undefined,
    }

    const newRules = [...rules, rule]
    setRules(newRules)
    updateConditionalVisibility(true, newRules)

    setNewRule({
      fieldId: "",
      operator: "equals",
      value: "",
    })
  }

  const removeRule = (ruleId: string) => {
    const newRules = rules.filter((rule) => rule.id !== ruleId)
    setRules(newRules)
    updateConditionalVisibility(newRules.length > 0, newRules)
  }

  const updateRule = (ruleId: string, updates: Partial<ConditionalRule>) => {
    const newRules = rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    setRules(newRules)
    updateConditionalVisibility(true, newRules)
  }

  const isEnabled = field.conditional_visibility?.enabled || false

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5" />
        <div>
          <h3 className="font-medium">Conditional Visibility</h3>
          <p className="text-sm text-muted-foreground">Show or hide this field based on other field values</p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="conditional-enabled">Enable Conditional Logic</Label>
          <p className="text-xs text-muted-foreground">Control when this field is visible to users</p>
        </div>
        <Switch
          id="conditional-enabled"
          checked={isEnabled}
          onCheckedChange={(enabled) => updateConditionalVisibility(enabled)}
        />
      </div>

      {isEnabled && (
        <div className="space-y-4">
          {/* Existing Rules */}
          {rules.length > 0 && (
            <div className="space-y-3">
              <Label>Visibility Rules</Label>
              {rules.map((rule, index) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {index > 0 && (
                        <Select
                          value={rule.logicalOperator || "AND"}
                          onValueChange={(value: "AND" | "OR") => updateRule(rule.id, { logicalOperator: value })}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <Input
                          placeholder="Field ID"
                          value={rule.fieldId}
                          onChange={(e) => updateRule(rule.id, { fieldId: e.target.value })}
                        />

                        <Select
                          value={rule.operator}
                          onValueChange={(value) => updateRule(rule.id, { operator: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Value"
                          value={rule.value}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          disabled={rule.operator === "is_empty" || rule.operator === "is_not_empty"}
                        />
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => removeRule(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add New Rule */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Add Visibility Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Field ID</Label>
                  <Input
                    placeholder="field-id"
                    value={newRule.fieldId || ""}
                    onChange={(e) => setNewRule({ ...newRule, fieldId: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs">Operator</Label>
                  <Select
                    value={newRule.operator || "equals"}
                    onValueChange={(value) => setNewRule({ ...newRule, operator: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Value</Label>
                  <Input
                    placeholder="comparison value"
                    value={newRule.value || ""}
                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    disabled={newRule.operator === "is_empty" || newRule.operator === "is_not_empty"}
                  />
                </div>
              </div>

              <Button
                onClick={addRule}
                disabled={!newRule.fieldId || !newRule.operator}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                Logic Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-background p-3 rounded border">
                {rules.length === 0 ? (
                  <span className="text-muted-foreground">No rules defined</span>
                ) : (
                  <div>
                    <span className="text-blue-600">Show this field when:</span>
                    <br />
                    {rules.map((rule, index) => (
                      <span key={rule.id}>
                        {index > 0 && <span className="text-purple-600 mx-2">{rule.logicalOperator}</span>}
                        <span className="text-green-600">{rule.fieldId}</span>
                        <span className="mx-1">{rule.operator.replace("_", " ")}</span>
                        {rule.operator !== "is_empty" && rule.operator !== "is_not_empty" && (
                          <span className="text-orange-600">"{rule.value}"</span>
                        )}
                        {index < rules.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

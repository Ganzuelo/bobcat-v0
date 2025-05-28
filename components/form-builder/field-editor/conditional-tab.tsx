"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import type { FormField } from "@/lib/form-types"
import type { LogicState, LogicCondition } from "@/lib/field-editor-types"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ConditionalTabProps {
  logicState: LogicState
  updateLogicState: (updates: Partial<LogicState>) => void
  otherFields: FormField[]
  updateCondition: (index: number, updates: Partial<LogicCondition>) => void
  addCondition: () => void
  removeCondition: (index: number) => void
}

export function ConditionalTab({
  logicState,
  updateLogicState,
  otherFields,
  updateCondition,
  addCondition,
  removeCondition,
}: ConditionalTabProps) {
  return (
    <div className="space-y-4 mt-0">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Conditional Visibility</h3>
            <p className="text-sm text-muted-foreground">
              Control when this field is shown based on other field values
            </p>
          </div>
          <Switch checked={logicState.enabled} onCheckedChange={(checked) => updateLogicState({ enabled: checked })} />
        </div>

        {logicState.enabled && (
          <div className="mt-4 space-y-4">
            {/* No fields message */}
            {otherFields.length === 0 && (
              <Alert>
                <AlertDescription>
                  Add other fields to the form first to create conditional logic rules.
                </AlertDescription>
              </Alert>
            )}

            {/* Conditions */}
            {otherFields.length > 0 && (
              <>
                <div className="space-y-3">
                  {logicState.conditions.map((condition, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        {/* Condition header */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Condition {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCondition(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Field selection */}
                        <div>
                          <Label htmlFor={`condition-field-${index}`}>Field</Label>
                          <Select
                            value={condition.fieldId}
                            onValueChange={(value) => updateCondition(index, { fieldId: value })}
                          >
                            <SelectTrigger id={`condition-field-${index}`}>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {otherFields.map((field) => (
                                <SelectItem key={field.id} value={field.id}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Operator selection */}
                        <div>
                          <Label htmlFor={`condition-operator-${index}`}>Operator</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) => updateCondition(index, { operator: value })}
                          >
                            <SelectTrigger id={`condition-operator-${index}`}>
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="greater_than">Greater Than</SelectItem>
                              <SelectItem value="less_than">Less Than</SelectItem>
                              <SelectItem value="is_empty">Is Empty</SelectItem>
                              <SelectItem value="is_not_empty">Is Not Empty</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Value input */}
                        {condition.operator !== "is_empty" && condition.operator !== "is_not_empty" && (
                          <div>
                            <Label htmlFor={`condition-value-${index}`}>Value</Label>
                            <Input
                              id={`condition-value-${index}`}
                              value={condition.value || ""}
                              onChange={(e) => updateCondition(index, { value: e.target.value })}
                              placeholder="Enter comparison value"
                            />
                          </div>
                        )}

                        {/* Logical operator (AND/OR) */}
                        {index < logicState.conditions.length - 1 && (
                          <div className="pt-2">
                            <RadioGroup
                              value={condition.logicalOperator || "AND"}
                              onValueChange={(value) =>
                                updateCondition(index, { logicalOperator: value as "AND" | "OR" })
                              }
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="AND" id={`and-${index}`} />
                                <Label htmlFor={`and-${index}`}>AND</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="OR" id={`or-${index}`} />
                                <Label htmlFor={`or-${index}`}>OR</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Add condition button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="w-full"
                  disabled={otherFields.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>

                {/* Help text */}
                <p className="text-xs text-muted-foreground">
                  This field will only be visible when all conditions are met.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

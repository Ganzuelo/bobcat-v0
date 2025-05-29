"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"
import type { CarryforwardState } from "@/lib/field-editor-types"
import type { FormField } from "@/lib/form-types"

interface CarryforwardTabProps {
  carryforwardConfig: CarryforwardState
  updateCarryforwardConfig: (updates: Partial<CarryforwardState>) => void
  availableFields: FormField[]
}

export function CarryforwardTab({
  carryforwardConfig,
  updateCarryforwardConfig,
  availableFields,
}: CarryforwardTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-4">Carryforward Configuration</h4>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Enable Carryforward</CardTitle>
            <CardDescription>
              Automatically populate this field with data from previous forms or sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="carryforward-enabled"
                checked={carryforwardConfig.enabled}
                onCheckedChange={(enabled) => updateCarryforwardConfig({ enabled })}
              />
              <Label htmlFor="carryforward-enabled">Enable carryforward</Label>
            </div>

            {carryforwardConfig.enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="carryforward-source">Source Field</Label>
                  <Select
                    value={carryforwardConfig.source}
                    onValueChange={(source) => updateCarryforwardConfig({ source })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source field" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.label} ({field.field_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carryforward-mode">Carryforward Mode</Label>
                  <Select value={carryforwardConfig.mode} onValueChange={(mode) => updateCarryforwardConfig({ mode })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (if empty)</SelectItem>
                      <SelectItem value="always">Always override</SelectItem>
                      <SelectItem value="ask">Ask user</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Carryforward Behavior:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>
                          <strong>Default:</strong> Only fills if field is empty
                        </li>
                        <li>
                          <strong>Always:</strong> Overwrites existing values
                        </li>
                        <li>
                          <strong>Ask:</strong> Prompts user before filling
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

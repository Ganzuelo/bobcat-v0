"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, X, AlertCircle } from "lucide-react"
import type { FormField } from "@/lib/form-types"
import type { ValidationState } from "@/lib/field-editor-types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

const COMMON_PATTERNS = [
  {
    label: "Email",
    value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    description: "Validates standard email addresses (e.g., user@example.com)",
  },
  {
    label: "US ZIP Code",
    value: "^\\d{5}(?:[-\\s]\\d{4})?$",
    description: "Validates US ZIP codes in 12345 or 12345-6789 format",
  },
  {
    label: "US Phone Number",
    value: "^\\d{10}$",
    description: "Validates 10-digit US phone numbers (e.g., 1234567890)",
  },
  {
    label: "Date (MM/DD/YYYY)",
    value: "^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/\\d{4}$",
    description: "Validates dates in MM/DD/YYYY format (e.g., 12/31/2023)",
  },
  {
    label: "Date (YYYY-MM-DD)",
    value: "^\\d{4}-\\d{2}-\\d{2}$",
    description: "Validates dates in ISO format YYYY-MM-DD (e.g., 2023-12-31)",
  },
  {
    label: "Numeric Only",
    value: "^\\d+$",
    description: "Allows only numeric digits (e.g., 12345)",
  },
  {
    label: "Alphanumeric",
    value: "^[a-zA-Z0-9]+$",
    description: "Allows only letters and numbers (e.g., ABC123)",
  },
  {
    label: "URL",
    value: "^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$",
    description: "Validates web URLs (e.g., https://example.com)",
  },
  {
    label: "Password (Strong)",
    value: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$",
    description: "Requires 8+ characters with uppercase, lowercase, and number",
  },
  {
    label: "US SSN",
    value: "^\\d{3}-\\d{2}-\\d{4}$",
    description: "Validates US Social Security Numbers (e.g., 123-45-6789)",
  },
]

interface ValidationTabProps {
  field: FormField
  validationState: ValidationState
  updateValidationState: (updates: Partial<ValidationState>) => void
  validationErrors: string[]
  allowedValuesInput: string
  setAllowedValuesInput: (value: string) => void
  addAllowedValue: () => void
  removeAllowedValue: (index: number) => void
}

export function ValidationTab({
  field,
  validationState,
  updateValidationState,
  validationErrors,
  allowedValuesInput,
  setAllowedValuesInput,
  addAllowedValue,
  removeAllowedValue,
}: ValidationTabProps) {
  // Check if field type supports certain validations
  const isNumberField = ["number", "currency", "percentage"].includes(field.field_type)
  const isTextBasedField = ["text", "textarea", "email", "password", "phone", "url"].includes(field.field_type)
  const supportsEnumValues = ["text", "select"].includes(field.field_type)

  return (
    <div className="space-y-4 mt-0">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Required Field */}
      <div className="flex items-center space-x-2">
        <Switch
          checked={validationState.required}
          onCheckedChange={(checked) => updateValidationState({ required: checked })}
        />
        <Label>Required field</Label>
      </div>

      {/* Length Validation (for text-based fields) */}
      {isTextBasedField && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-length">Minimum Length</Label>
              <Input
                id="min-length"
                type="number"
                min="0"
                value={validationState.minLength || ""}
                onChange={(e) =>
                  updateValidationState({
                    minLength: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="max-length">Maximum Length</Label>
              <Input
                id="max-length"
                type="number"
                min="0"
                value={validationState.maxLength || ""}
                onChange={(e) =>
                  updateValidationState({
                    maxLength: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="No limit"
              />
            </div>
          </div>
        </div>
      )}

      {/* Value Validation (for number fields) */}
      {isNumberField && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-value">Minimum Value</Label>
              <Input
                id="min-value"
                type="number"
                value={validationState.minValue || ""}
                onChange={(e) =>
                  updateValidationState({
                    minValue: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="No minimum"
              />
            </div>
            <div>
              <Label htmlFor="max-value">Maximum Value</Label>
              <Input
                id="max-value"
                type="number"
                value={validationState.maxValue || ""}
                onChange={(e) =>
                  updateValidationState({
                    maxValue: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="No maximum"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pattern Validation */}
      <div>
        <Label htmlFor="pattern">Pattern (Regex)</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="pattern"
                value={validationState.pattern || ""}
                onChange={(e) => updateValidationState({ pattern: e.target.value })}
                placeholder="e.g. ^\\d{5}(-\\d{4})?$"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter a regular expression pattern to validate input format</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div>
            <Label htmlFor="common-patterns" className="text-sm text-muted-foreground">
              Common Patterns
            </Label>
            <Select
              value=""
              onValueChange={(value) => {
                const pattern = COMMON_PATTERNS.find((p) => p.value === value)
                if (pattern) {
                  updateValidationState({ pattern: pattern.value })
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a common pattern..." />
              </SelectTrigger>
              <SelectContent>
                {COMMON_PATTERNS.map((pattern) => (
                  <SelectItem key={pattern.value} value={pattern.value}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-between w-full">
                            <span>{pattern.label}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">{pattern.description}</p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">{pattern.value}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Select a common pattern above or enter a custom regular expression
        </p>
      </div>

      {/* Allowed Values (Enum) */}
      {supportsEnumValues && (
        <div>
          <Label>Allowed Values</Label>
          <div className="space-y-2 mt-2">
            {/* Current allowed values */}
            {validationState.allowedValues && validationState.allowedValues.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {validationState.allowedValues.map((value, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeAllowedValue(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add new allowed value */}
            <div className="flex gap-2">
              <Input
                value={allowedValuesInput}
                onChange={(e) => setAllowedValuesInput(e.target.value)}
                placeholder="Enter allowed value"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addAllowedValue()
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={addAllowedValue} disabled={!allowedValuesInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Define specific values that are allowed for this field</p>
          </div>
        </div>
      )}
    </div>
  )
}

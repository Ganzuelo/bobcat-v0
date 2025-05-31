"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { HelpCircle, Upload, Loader2, Database } from "lucide-react"
import { SalesGrid } from "./sales-grid"
import type { FormField } from "@/lib/database-types"

interface FieldRendererProps {
  field: FormField
  value?: any
  onChange?: (value: any) => void
  error?: string
  isPreview?: boolean
  isPrefilled?: boolean
  isPrefilling?: boolean
  prefillSource?: string
}

export function FieldRenderer({
  field,
  value,
  onChange,
  error,
  isPreview = false,
  isPrefilled = false,
  isPrefilling = false,
  prefillSource,
}: FieldRendererProps) {
  // Helper function to render guidance tooltip
  const renderGuidance = () => {
    if (!field.guidance) return null

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">{field.guidance}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Helper function to render prefill indicator
  const renderPrefillIndicator = () => {
    if (!isPrefilling && !isPrefilled) return null

    return (
      <div className="flex justify-end mb-1">
        {isPrefilling && (
          <Badge variant="secondary" className="text-xs">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Loading...
          </Badge>
        )}
        {isPrefilled && prefillSource && (
          <Badge variant="outline" className="text-xs">
            <Database className="h-3 w-3 mr-1" />
            From {prefillSource}
          </Badge>
        )}
      </div>
    )
  }

  // Helper function to render the actual input field
  const renderInputField = () => {
    const fieldType = field.field_type || field.type

    switch (fieldType) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder || ""}
            disabled={!isPreview}
            className={error ? "border-red-500" : ""}
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder || ""}
            rows={3}
            disabled={!isPreview}
            className={error ? "border-red-500" : ""}
          />
        )

      case "email":
        return (
          <Input
            type="email"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder || "Enter email address"}
            disabled={!isPreview}
            className={error ? "border-red-500" : ""}
          />
        )

      case "phone":
        return (
          <Input
            type="tel"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder || "Enter phone number"}
            disabled={!isPreview}
            className={error ? "border-red-500" : ""}
          />
        )

      case "url":
        return (
          <Input
            type="url"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder || "Enter URL"}
            disabled={!isPreview}
            className={error ? "border-red-500" : ""}
          />
        )

      case "password":
        return (
          <Input
            type="password"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder || "Enter password"}
            disabled={!isPreview}
            className={error ? "border-red-500" : ""}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange?.(Number(e.target.value))}
            placeholder={field.placeholder || "Enter number"}
            disabled={!isPreview}
            className={error ? "border-red-500" : ""}
          />
        )

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={!isPreview}
            className={error ? "border-red-500" : ""}
          />
        )

      case "time":
        return (
          <Input
            type="time"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={!isPreview}
            className={error ? "border-red-500" : ""}
          />
        )

      case "select":
        return (
          <Select value={value || ""} onValueChange={onChange} disabled={!isPreview}>
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        if (field.options && field.options.length > 0) {
          // Multiple checkboxes
          return (
            <div className="space-y-3">
              {field.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}_${index}`}
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onCheckedChange={(checked) => {
                      if (!onChange) return
                      const currentValues = Array.isArray(value) ? value : []
                      if (checked) {
                        onChange([...currentValues, option.value])
                      } else {
                        onChange(currentValues.filter((v: any) => v !== option.value))
                      }
                    }}
                    disabled={!isPreview}
                  />
                  <Label htmlFor={`${field.id}_${index}`} className="text-sm font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )
        } else {
          // Single checkbox
          return (
            <div className="flex items-center space-x-2">
              <Checkbox id={field.id} checked={!!value} onCheckedChange={onChange} disabled={!isPreview} />
              <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
                {field.label}
              </Label>
            </div>
          )
        }

      case "radio":
        return (
          <RadioGroup value={value || ""} onValueChange={onChange} disabled={!isPreview} className="space-y-3">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}_${index}`} disabled={!isPreview} />
                <Label htmlFor={`${field.id}_${index}`} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "file":
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <Button variant="outline" disabled={!isPreview}>
                  Choose File
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">{field.placeholder || "Upload a file"}</p>
            </div>
            {value && (
              <div className="text-sm text-gray-600">
                Selected: {typeof value === "string" ? value : value.name || "File selected"}
              </div>
            )}
          </div>
        )

      case "hidden":
        return <div className="text-sm text-gray-500 italic">Hidden field: {field.label}</div>

      case "heading":
        const headingLevel = field.metadata?.level || 2
        const HeadingTag = `h${Math.min(Math.max(headingLevel, 1), 6)}` as keyof JSX.IntrinsicElements
        return <HeadingTag className="text-lg font-semibold text-gray-900">{field.label}</HeadingTag>

      case "paragraph":
        return <p className="text-gray-700 leading-relaxed">{field.label}</p>

      case "divider":
        return <Separator className="my-4" />

      case "spacer":
        const height = field.metadata?.height || 20
        return <div style={{ height: `${height}px` }} />

      case "sales_grid":
        // Parse the sales grid configuration from field metadata
        const gridConfig = field.metadata?.gridConfig || {
          type: "sales",
          comparableCount: 3,
          showSubject: true,
          columnLabels: {
            subject: "Subject",
            comparables: ["Comparable 1", "Comparable 2", "Comparable 3"],
          },
          rows: [
            {
              id: "view",
              label: "View",
              type: "dropdown",
              options: [
                { label: "Excellent", value: "excellent" },
                { label: "Good", value: "good" },
                { label: "Average", value: "average" },
                { label: "Poor", value: "poor" },
              ],
            },
            {
              id: "condition",
              label: "Condition",
              type: "dropdown",
              options: [
                { label: "Excellent", value: "excellent" },
                { label: "Good", value: "good" },
                { label: "Average", value: "average" },
                { label: "Poor", value: "poor" },
              ],
            },
            {
              id: "gross_living_area",
              label: "Gross Living Area",
              type: "number",
              guidance: "Enter square footage",
            },
            {
              id: "sale_price",
              label: "Sale Price",
              type: "currency",
              guidance: "Enter in dollars",
            },
          ],
        }

        return (
          <SalesGrid
            id={field.id}
            label={field.label}
            config={gridConfig}
            value={value}
            onChange={onChange}
            required={field.required}
            disabled={!isPreview}
            isPreview={isPreview}
          />
        )

      default:
        return (
          <div className="p-3 bg-gray-100 rounded border text-sm text-gray-600">
            Unsupported field type: {fieldType}
          </div>
        )
    }
  }

  // Layout fields don't need labels or containers
  const fieldType = field.field_type || field.type
  if (["heading", "paragraph", "divider", "spacer"].includes(fieldType)) {
    return (
      <div className="w-full">
        {renderPrefillIndicator()}
        {renderInputField()}
      </div>
    )
  }

  // Sales grid gets special treatment with its own label handling
  if (fieldType === "sales_grid") {
    return (
      <div className="w-full space-y-2">
        {renderPrefillIndicator()}
        {renderInputField()}
        {field.help_text && <p className="text-sm text-muted-foreground">{field.help_text}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  // Regular input fields with labels
  return (
    <div className="w-full space-y-2">
      {renderPrefillIndicator()}

      {/* Field Label with guidance */}
      {field.label && (
        <div className="flex items-center gap-2">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderGuidance()}
        </div>
      )}

      {/* Input Field */}
      {renderInputField()}

      {/* Help Text */}
      {field.help_text && <p className="text-sm text-muted-foreground">{field.help_text}</p>}

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SalesGrid } from "./sales-grid"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { InfoIcon } from "lucide-react"

// Update the FieldRendererProps interface to include error
interface FieldRendererProps {
  field: any
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  isPreview?: boolean
  error?: string
}

// Update the helper functions to include guidance
export function FieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
  isPreview = false,
  error,
}: FieldRendererProps) {
  const [fieldValue, setFieldValue] = useState(value !== undefined ? value : "")

  const handleChange = (newValue: any) => {
    setFieldValue(newValue)
    onChange?.(newValue)
  }

  // Normalize field type to lowercase for consistent comparison
  const fieldType = field.field_type?.toLowerCase() || field.type?.toLowerCase() || ""

  // Helper function to get field ID
  const getFieldId = () => field.id || `field-${Math.random().toString(36).substring(2, 9)}`

  // Helper function to check if field is required
  const isRequired = () => field.required || false

  // Helper function to get field label
  const getFieldLabel = () => field.label || "Untitled Field"

  // Helper function to get field placeholder
  const getFieldPlaceholder = () => field.placeholder || ""

  // Helper function to get field help text
  const getHelpText = () => field.help_text || field.helpText || ""

  // Helper function to get field guidance
  const getGuidance = () => field.guidance || ""

  // Helper function to get field options
  const getFieldOptions = () => field.options || []

  // Field label with guidance popover if available
  const FieldLabelWithGuidance = () => {
    const guidance = getGuidance()

    return (
      <div className="flex items-center gap-1.5">
        <Label htmlFor={getFieldId()} className="inline-flex">
          {getFieldLabel()} {isRequired() && <span className="text-red-500">*</span>}
        </Label>

        {guidance && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                aria-label="Field guidance"
              >
                <InfoIcon className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="flex gap-2">
                <InfoIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <h4 className="font-medium leading-none mb-1.5">Field Guidance</h4>
                  <p className="text-sm text-muted-foreground">{guidance}</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    )
  }

  // Debug info
  console.log("Field type:", fieldType)
  console.log("Field:", field)

  // Render field based on type
  switch (fieldType) {
    case "text":
    case "short_text":
      return (
        <div className="space-y-2">
          <FieldLabelWithGuidance />
          <Input
            id={getFieldId()}
            placeholder={getFieldPlaceholder()}
            value={fieldValue}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            required={isRequired()}
            className={error ? "border-red-500" : ""}
          />
          {getHelpText() && <p className="text-sm text-gray-500">{getHelpText()}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )

    case "textarea":
    case "long_text":
      return (
        <div className="space-y-2">
          <FieldLabelWithGuidance />
          <Textarea
            id={getFieldId()}
            placeholder={getFieldPlaceholder()}
            value={fieldValue}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            required={isRequired()}
            className={error ? "border-red-500" : ""}
          />
          {getHelpText() && <p className="text-sm text-gray-500">{getHelpText()}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )

    case "number":
      return (
        <div className="space-y-2">
          <FieldLabelWithGuidance />
          <Input
            id={getFieldId()}
            type="number"
            placeholder={getFieldPlaceholder()}
            value={fieldValue}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            required={isRequired()}
            className={error ? "border-red-500" : ""}
          />
          {getHelpText() && <p className="text-sm text-gray-500">{getHelpText()}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )

    case "checkbox":
      const options = getFieldOptions()

      // If no options are defined, render as a single checkbox
      if (!options || options.length === 0) {
        return (
          <div className="flex items-start space-x-2">
            <Checkbox id={getFieldId()} checked={!!fieldValue} onCheckedChange={handleChange} disabled={disabled} />
            <div className="space-y-1 leading-none">
              <FieldLabelWithGuidance />
              {getHelpText() && <p className="text-sm text-gray-500">{getHelpText()}</p>}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        )
      }

      // If options are defined, render as a checkbox group
      const selectedValues = Array.isArray(fieldValue) ? fieldValue : []

      const handleCheckboxGroupChange = (optionValue: string, checked: boolean) => {
        let newValues = [...selectedValues]
        if (checked) {
          if (!newValues.includes(optionValue)) {
            newValues.push(optionValue)
          }
        } else {
          newValues = newValues.filter((v) => v !== optionValue)
        }
        handleChange(newValues)
      }

      return (
        <div className="space-y-2">
          <FieldLabelWithGuidance />
          <div className="space-y-2">
            {options.map((option: any, index: number) => {
              const optionValue = option.value || option
              const optionLabel = option.label || option
              const isChecked = selectedValues.includes(optionValue)

              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${getFieldId()}-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxGroupChange(optionValue, !!checked)}
                    disabled={disabled}
                  />
                  <Label htmlFor={`${getFieldId()}-${index}`} className="text-sm font-normal">
                    {optionLabel}
                  </Label>
                </div>
              )
            })}
          </div>
          {getHelpText() && <p className="text-sm text-gray-500">{getHelpText()}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )

    case "radio":
    case "radio_group":
      return (
        <div className="space-y-2">
          <FieldLabelWithGuidance />
          <RadioGroup value={fieldValue} onValueChange={handleChange} disabled={disabled}>
            {getFieldOptions().map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value || option} id={`${getFieldId()}-${index}`} />
                <Label htmlFor={`${getFieldId()}-${index}`}>{option.label || option}</Label>
              </div>
            ))}
          </RadioGroup>
          {getHelpText() && <p className="text-sm text-gray-500">{getHelpText()}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )

    case "select":
    case "dropdown":
      return (
        <div className="space-y-2">
          <FieldLabelWithGuidance />
          <Select value={fieldValue} onValueChange={handleChange} disabled={disabled}>
            <SelectTrigger id={getFieldId()} className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={getFieldPlaceholder()} />
            </SelectTrigger>
            <SelectContent>
              {getFieldOptions().map((option: any, index: number) => (
                <SelectItem key={index} value={option.value || option}>
                  {option.label || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getHelpText() && <p className="text-sm text-gray-500">{getHelpText()}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )

    case "file":
    case "upload":
      return (
        <div className="space-y-2">
          <FieldLabelWithGuidance />
          <Input
            id={getFieldId()}
            type="file"
            onChange={(e) => {
              const files = e.target.files
              if (files && files.length > 0) {
                // For single file upload, pass the first file
                // For multiple files, pass the FileList or array
                const value = field.multiple ? Array.from(files) : files[0]
                handleChange(value)
              }
            }}
            disabled={disabled}
            required={isRequired()}
            multiple={field.multiple || false}
            accept={field.accept || field.allowedTypes || ""}
            className={error ? "border-red-500" : ""}
          />
          {field.uploadLocation && (
            <p className="text-xs text-gray-500">Files will be uploaded to: {field.uploadLocation}</p>
          )}
          {getHelpText() && <p className="text-sm text-gray-500">{getHelpText()}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )

    case "sales_grid":
    case "salesgrid":
      // Check if we have a grid configuration
      if (!field.gridConfig && !field.config?.gridConfig) {
        console.error("Sales Grid missing configuration:", field)
        return (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md">
            <p className="text-red-700">
              Sales Grid Configuration Missing (Field ID: {field.id})
              <br />
              Field Type: {fieldType}
            </p>
          </div>
        )
      }

      // Get grid configuration
      const gridConfig = field.gridConfig ||
        field.config?.gridConfig || {
          comparableCount: 3,
          showSubject: true,
          columnLabels: {
            subject: "Subject",
            comparables: ["Comparable 1", "Comparable 2", "Comparable 3"],
          },
          rows: [
            { id: "view", label: "View", type: "text" },
            { id: "condition", label: "Condition", type: "text" },
            { id: "gross_living_area", label: "Gross Living Area", type: "number" },
            { id: "sale_price", label: "Sale Price", type: "currency" },
          ],
        }

      return (
        <div className="space-y-2">
          <FieldLabelWithGuidance />
          <SalesGrid
            id={getFieldId()}
            label={getFieldLabel()}
            config={gridConfig}
            value={fieldValue}
            onChange={handleChange}
            required={isRequired()}
            disabled={disabled}
            isPreview={isPreview}
          />
          {getHelpText() && <p className="text-sm text-gray-500">{getHelpText()}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )

    case "heading":
      const headingLevel = field.level || field.headingLevel || 2
      const HeadingTag = `h${Math.min(Math.max(headingLevel, 1), 6)}` as keyof JSX.IntrinsicElements

      return (
        <div className="space-y-2">
          <HeadingTag
            className={`font-semibold ${
              headingLevel === 1
                ? "text-3xl"
                : headingLevel === 2
                  ? "text-2xl"
                  : headingLevel === 3
                    ? "text-xl"
                    : headingLevel === 4
                      ? "text-lg"
                      : headingLevel === 5
                        ? "text-base"
                        : "text-sm"
            }`}
          >
            {field.text || field.label || "Heading"}
          </HeadingTag>
        </div>
      )

    case "paragraph":
      return (
        <div className="space-y-2">
          <p className="text-base leading-relaxed">
            {field.text || field.content || field.label || "This is a paragraph of text."}
          </p>
        </div>
      )

    case "divider":
      return (
        <div className="space-y-2">
          <hr className="border-t border-gray-300 my-4" />
        </div>
      )

    case "spacer":
      const spacerHeight = field.height || field.size || "medium"
      const heightClass =
        spacerHeight === "small"
          ? "h-4"
          : spacerHeight === "medium"
            ? "h-8"
            : spacerHeight === "large"
              ? "h-16"
              : spacerHeight === "xl"
                ? "h-24"
                : "h-8" // default to medium

      return <div className={`w-full ${heightClass}`} aria-hidden="true" />

    default:
      // Check if it's a sales grid by string comparison
      if (String(fieldType).includes("sales") && String(fieldType).includes("grid")) {
        return (
          <div className="space-y-2">
            <FieldLabelWithGuidance />
            <SalesGrid
              id={getFieldId()}
              label={getFieldLabel()}
              config={
                field.gridConfig ||
                field.config?.gridConfig || {
                  comparableCount: 3,
                  showSubject: true,
                  columnLabels: {
                    subject: "Subject",
                    comparables: ["Comparable 1", "Comparable 2", "Comparable 3"],
                  },
                  rows: [
                    { id: "view", label: "View", type: "text" },
                    { id: "condition", label: "Condition", type: "text" },
                    { id: "gross_living_area", label: "Gross Living Area", type: "number" },
                    { id: "sale_price", label: "Sale Price", type: "currency" },
                  ],
                }
              }
              value={fieldValue}
              onChange={handleChange}
              required={isRequired()}
              disabled={disabled}
              isPreview={isPreview}
            />
            {getHelpText() && <p className="text-sm text-gray-500">{getHelpText()}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )
      }

      return (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
          <p className="text-yellow-700">
            Unsupported field type: {fieldType}
            <br />
            Field ID: {field.id}
          </p>
        </div>
      )
  }
}

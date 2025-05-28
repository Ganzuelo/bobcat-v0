"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { FormField } from "@/lib/form-types"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database } from "lucide-react"
import { getResponsiveWidthClasses } from "@/lib/form-width-utils"

interface FieldRendererProps {
  field: FormField
  isPreviewMode: boolean
  isPrefilled?: boolean
  isPrefilling?: boolean
  prefillSource?: string
  onValueChange?: (value: any) => void
}

export function FieldRenderer({
  field,
  isPreviewMode,
  isPrefilled = false,
  isPrefilling = false,
  prefillSource,
  onValueChange,
}: FieldRendererProps) {
  const baseClasses = isPreviewMode
    ? "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    : "bg-gray-50"

  // Prefill indicator component
  const PrefillIndicator = () => {
    if (isPrefilling) {
      return (
        <Badge variant="secondary" className="text-xs">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Loading...
        </Badge>
      )
    }

    if (isPrefilled && prefillSource) {
      return (
        <Badge variant="outline" className="text-xs">
          <Database className="h-3 w-3 mr-1" />
          From {prefillSource}
        </Badge>
      )
    }

    return null
  }

  return (
    <div className={`${getResponsiveWidthClasses(field.width || "full")}`}>
      {/* Prefill indicator - only show if there's prefill info */}
      {(isPrefilling || isPrefilled) && (
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
      )}

      {/* Field input only - no label wrapper */}
      {(() => {
        switch (field.field_type) {
          case "text":
            return (
              <Input
                placeholder={field.placeholder || field.label}
                disabled={!isPreviewMode}
                className={isPreviewMode ? baseClasses : "bg-gray-50"}
              />
            )
          case "textarea":
            return (
              <Textarea
                placeholder={field.placeholder || field.label}
                rows={3}
                disabled={!isPreviewMode}
                className={isPreviewMode ? baseClasses : "bg-gray-50"}
              />
            )
          case "email":
            return (
              <Input
                type="email"
                placeholder={field.placeholder || field.label}
                disabled={!isPreviewMode}
                className={isPreviewMode ? baseClasses : "bg-gray-50"}
              />
            )
          case "select":
            return (
              <Select disabled={!isPreviewMode}>
                <SelectTrigger className={isPreviewMode ? "w-full" : "bg-gray-50"}>
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
              return (
                <div className="space-y-3">
                  {field.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox disabled={!isPreviewMode} id={`${field.id}_${index}`} />
                      <Label htmlFor={`${field.id}_${index}`} className="text-sm font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )
            } else {
              return (
                <div className="flex items-center space-x-2">
                  <Checkbox disabled={!isPreviewMode} id={field.id} />
                  <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              )
            }
          case "radio":
            return (
              <RadioGroup disabled={!isPreviewMode} className="space-y-3">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${field.id}_${index}`} disabled={!isPreviewMode} />
                    <Label htmlFor={`${field.id}_${index}`} className="text-sm font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )
          default:
            return <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">{field.field_type}</div>
        }
      })()}
    </div>
  )
}

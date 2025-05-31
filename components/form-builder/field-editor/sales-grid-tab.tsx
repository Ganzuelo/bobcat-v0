"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Calculator, ArrowLeft, ArrowRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import type { FormField as Field } from "@/lib/database-types"
import type {
  SalesGridRow,
  SalesGridConfig,
  SalesGridFormula,
  SalesGridSummaryRow,
  SalesGridRowOption,
  SalesGridType,
} from "../sales-grid"

interface SalesGridTabProps {
  field: Field
  onChange: (fieldId: string, updates: Partial<Field>) => void
}

// Default configuration to ensure we always have valid data
const DEFAULT_SALES_CONFIG: SalesGridConfig = {
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
      unit: "sqft",
    },
    { id: "sale_price", label: "Sale Price", type: "currency", guidance: "Enter in dollars" },
    { id: "sale_date", label: "Sale Date", type: "text", guidance: "Enter sale date" },
    { id: "price_per_sf", label: "Price/SF", type: "number", guidance: "Enter price per square foot" },
  ],
  summaryRows: [],
}

const DEFAULT_RENTAL_CONFIG: SalesGridConfig = {
  type: "rental",
  comparableCount: 3,
  showSubject: true,
  columnLabels: {
    subject: "Subject",
    comparables: ["Comparable 1", "Comparable 2", "Comparable 3"],
  },
  rows: [
    {
      id: "property_type",
      label: "Property Type",
      type: "text",
    },
    {
      id: "rent_amount",
      label: "Rent Amount",
      type: "currency",
    },
    {
      id: "lease_term",
      label: "Lease Term",
      type: "text",
    },
    {
      id: "concessions",
      label: "Concessions",
      type: "text",
    },
    {
      id: "date_available",
      label: "Date Available",
      type: "text",
    },
  ],
  summaryRows: [],
}

const DEFAULT_LISTING_CONFIG: SalesGridConfig = {
  type: "listing",
  comparableCount: 3,
  showSubject: true,
  columnLabels: {
    subject: "Subject",
    comparables: ["Comparable 1", "Comparable 2", "Comparable 3"],
  },
  rows: [
    {
      id: "property_type",
      label: "Property Type",
      type: "text",
    },
    {
      id: "list_price",
      label: "List Price",
      type: "currency",
    },
    {
      id: "dom",
      label: "DOM",
      type: "number",
    },
    {
      id: "status",
      label: "Status",
      type: "text",
    },
    {
      id: "price_per_sf",
      label: "Price/SF",
      type: "number",
    },
    {
      id: "list_date",
      label: "List Date",
      type: "text",
    },
  ],
  summaryRows: [],
}

export function SalesGridTab({ field, onChange }: SalesGridTabProps) {
  // Initialize config with proper defaults and null safety
  const [config, setConfig] = useState<SalesGridConfig>(() => {
    const existingConfig = field.config?.gridConfig || field.gridConfig

    let defaultConfig: SalesGridConfig = DEFAULT_SALES_CONFIG

    if (existingConfig?.type === "rental") {
      defaultConfig = DEFAULT_RENTAL_CONFIG
    } else if (existingConfig?.type === "listing") {
      defaultConfig = DEFAULT_LISTING_CONFIG
    }

    // If no existing config, use defaults
    if (!existingConfig) {
      return defaultConfig
    }

    // Merge existing config with defaults to ensure all properties exist
    return {
      type: existingConfig.type || defaultConfig.type,
      comparableCount: Math.max(1, Math.min(6, existingConfig.comparableCount || defaultConfig.comparableCount)),
      showSubject: existingConfig.showSubject ?? defaultConfig.showSubject,
      columnLabels: {
        subject: existingConfig.columnLabels?.subject || defaultConfig.columnLabels.subject,
        comparables: existingConfig.columnLabels?.comparables || defaultConfig.columnLabels.comparables,
      },
      rows: Array.isArray(existingConfig.rows) ? existingConfig.rows : defaultConfig.rows,
      summaryRows: Array.isArray(existingConfig.summaryRows) ? existingConfig.summaryRows : defaultConfig.summaryRows,
    }
  })

  // New row state
  const [newRow, setNewRow] = useState<Partial<SalesGridRow>>({
    label: "",
    type: "text",
    unit: "",
  })

  // Ensure config.rows is always an array
  const safeRows = Array.isArray(config.rows) ? config.rows : DEFAULT_SALES_CONFIG.rows
  const safeSummaryRows = Array.isArray(config.summaryRows) ? config.summaryRows : []
  const safeComparableCount = config.comparableCount || 3

  // Update config and propagate changes
  const updateConfig = useCallback(
    (updates: Partial<SalesGridConfig>) => {
      const newConfig = { ...config, ...updates }
      setConfig(newConfig)

      // Update the field with the new configuration
      onChange(field.id, {
        config: {
          ...field.config,
          gridConfig: newConfig,
        },
        gridConfig: newConfig, // Also set at root level for compatibility
      })
    },
    [config, field.config, field.id, onChange],
  )

  // Add a new row
  const addRow = () => {
    if (!newRow.label?.trim()) return

    const row: SalesGridRow = {
      id: newRow.label.toLowerCase().replace(/\s+/g, "_"),
      label: newRow.label,
      type: newRow.type as "text" | "number" | "currency" | "percentage" | "dropdown",
      guidance: newRow.guidance,
      required: newRow.required,
      options:
        newRow.type === "dropdown"
          ? [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ]
          : undefined,
      percentageFormat: newRow.type === "percentage" ? "0.00" : undefined,
      unit: newRow.unit,
    }

    updateConfig({
      rows: [...safeRows, row],
    })

    // Reset new row form
    setNewRow({
      label: "",
      type: "text",
      unit: "",
    })
  }

  // Remove a row
  const removeRow = (rowId: string) => {
    updateConfig({
      rows: safeRows.filter((row) => row.id !== rowId),
    })
  }

  // Update a row
  const updateRow = (rowId: string, updates: Partial<SalesGridRow>) => {
    updateConfig({
      rows: safeRows.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, ...updates }

          // Add default options for dropdown type
          if (updates.type === "dropdown" && !updatedRow.options) {
            updatedRow.options = [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ]
          }

          // Add default percentage format for percentage type
          if (updates.type === "percentage" && !updatedRow.percentageFormat) {
            updatedRow.percentageFormat = "0.00"
          }

          // Clear options if not dropdown type
          if (updates.type && updates.type !== "dropdown") {
            updatedRow.options = undefined
          }

          // Clear percentage format if not percentage type
          if (updates.type && updates.type !== "percentage") {
            updatedRow.percentageFormat = undefined
          }

          return updatedRow
        }
        return row
      }),
    })
  }

  // Update row options (for dropdown type)
  const updateRowOptions = (rowId: string, options: SalesGridRowOption[]) => {
    updateRow(rowId, { options })
  }

  // Add option to a dropdown row
  const addOptionToRow = (rowId: string) => {
    const row = safeRows.find((r) => r.id === rowId)
    if (row && row.options) {
      const newOptions = [
        ...row.options,
        { label: `Option ${row.options.length + 1}`, value: `option${row.options.length + 1}` },
      ]
      updateRowOptions(rowId, newOptions)
    }
  }

  // Remove option from a dropdown row
  const removeOptionFromRow = (rowId: string, optionIndex: number) => {
    const row = safeRows.find((r) => r.id === rowId)
    if (row && row.options) {
      const newOptions = row.options.filter((_, index) => index !== optionIndex)
      updateRowOptions(rowId, newOptions)
    }
  }

  // Update a specific option in a dropdown row
  const updateRowOption = (rowId: string, optionIndex: number, updates: Partial<SalesGridRowOption>) => {
    const row = safeRows.find((r) => r.id === rowId)
    if (row && row.options) {
      const newOptions = row.options.map((option, index) =>
        index === optionIndex ? { ...option, ...updates } : option,
      )
      updateRowOptions(rowId, newOptions)
    }
  }

  // Move a row up or down
  const moveRow = (rowId: string, direction: "up" | "down") => {
    const rowIndex = safeRows.findIndex((row) => row.id === rowId)
    if (rowIndex === -1) return

    if (direction === "up" && rowIndex === 0) return
    if (direction === "down" && rowIndex === safeRows.length - 1) return

    const newRows = [...safeRows]
    const targetIndex = direction === "up" ? rowIndex - 1 : rowIndex + 1

    // Swap rows
    ;[newRows[rowIndex], newRows[targetIndex]] = [newRows[targetIndex], newRows[rowIndex]]

    updateConfig({ rows: newRows })
  }

  // Update column labels when comparable count changes
  const handleComparableCountChange = (count: number) => {
    const currentLabels = config.columnLabels?.comparables || []
    const newLabels = [...currentLabels]

    // Add more labels if needed
    while (newLabels.length < count) {
      newLabels.push(`Comparable ${newLabels.length + 1}`)
    }

    // Remove excess labels if needed
    if (newLabels.length > count) {
      newLabels.length = count
    }

    updateConfig({
      comparableCount: count,
      columnLabels: {
        ...config.columnLabels,
        comparables: newLabels,
      },
    })
  }

  // Update a specific comparable label
  const updateComparableLabel = (index: number, label: string) => {
    const newLabels = [...(config.columnLabels?.comparables || [])]
    newLabels[index] = label

    updateConfig({
      columnLabels: {
        ...config.columnLabels,
        comparables: newLabels,
      },
    })
  }

  const moveComparableColumn = (currentIndex: number, direction: "left" | "right") => {
    if (currentIndex < 0 || currentIndex >= safeComparableCount) return

    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= safeComparableCount) return

    const newLabels = [...(config.columnLabels?.comparables || [])]
    ;[newLabels[currentIndex], newLabels[newIndex]] = [newLabels[newIndex], newLabels[currentIndex]]

    updateConfig({
      columnLabels: {
        ...config.columnLabels,
        comparables: newLabels,
      },
    })
  }

  // Update a summary row
  const updateSummaryRow = (index: number, updates: Partial<SalesGridSummaryRow>) => {
    const newSummaryRows = [...safeSummaryRows]
    newSummaryRows[index] = { ...newSummaryRows[index], ...updates }
    updateConfig({ summaryRows: newSummaryRows })
  }

  // Update a summary row formula
  const updateSummaryFormula = (index: number, updates: Partial<SalesGridFormula>) => {
    const newSummaryRows = [...safeSummaryRows]
    const currentFormula = newSummaryRows[index].formula || { type: "sum", targetRows: [] }
    newSummaryRows[index].formula = { ...currentFormula, ...updates }
    updateConfig({ summaryRows: newSummaryRows })
  }

  // Toggle row selection for formula
  const toggleRowForFormula = (summaryIndex: number, rowId: string) => {
    const newSummaryRows = [...safeSummaryRows]
    const currentFormula = newSummaryRows[summaryIndex].formula || { type: "sum", targetRows: [] }
    const currentTargetRows = currentFormula.targetRows || []

    const newTargetRows = currentTargetRows.includes(rowId)
      ? currentTargetRows.filter((id) => id !== rowId)
      : [...currentTargetRows, rowId]

    newSummaryRows[summaryIndex].formula = {
      ...currentFormula,
      targetRows: newTargetRows,
    }

    updateConfig({ summaryRows: newSummaryRows })
  }

  const handleGridTypeChange = (type: SalesGridType) => {
    let defaultConfig: SalesGridConfig = DEFAULT_SALES_CONFIG

    if (type === "rental") {
      defaultConfig = DEFAULT_RENTAL_CONFIG
    } else if (type === "listing") {
      defaultConfig = DEFAULT_LISTING_CONFIG
    }

    updateConfig({
      type: type,
      rows: defaultConfig.rows,
    })
  }

  const addComparableColumn = () => {
    if (safeComparableCount >= 6) return

    const newCount = safeComparableCount + 1
    const newLabels = [...(config.columnLabels?.comparables || [])]
    newLabels.push(`Comparable ${newCount}`)

    updateConfig({
      comparableCount: newCount,
      columnLabels: {
        ...config.columnLabels,
        comparables: newLabels,
      },
    })
  }

  const removeComparableColumn = (index: number) => {
    if (safeComparableCount <= 1) return

    const newCount = safeComparableCount - 1
    const newLabels = [...(config.columnLabels?.comparables || [])]
    newLabels.splice(index, 1)

    updateConfig({
      comparableCount: newCount,
      columnLabels: {
        ...config.columnLabels,
        comparables: newLabels,
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Grid Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grid Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gridType">Grid Type</Label>
              <Select value={config.type || "sales"} onValueChange={handleGridTypeChange}>
                <SelectTrigger id="gridType">
                  <SelectValue placeholder="Select grid type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                  <SelectItem value="listing">Listing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comparableCount">How many comparables?</Label>
              <Select
                value={safeComparableCount.toString()}
                onValueChange={(value) => handleComparableCountChange(Number.parseInt(value))}
              >
                <SelectTrigger id="comparableCount">
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showSubject">Show Subject Column</Label>
                <Switch
                  id="showSubject"
                  checked={config.showSubject}
                  onCheckedChange={(checked) => updateConfig({ showSubject: checked })}
                />
              </div>
            </div>
          </div>

          {/* Column Labels */}
          <div className="space-y-3">
            <Label>Column Labels</Label>

            {config.showSubject && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-32">Subject:</span>
                <Input
                  value={config.columnLabels?.subject || "Subject"}
                  onChange={(e) =>
                    updateConfig({
                      columnLabels: {
                        ...config.columnLabels,
                        subject: e.target.value,
                      },
                    })
                  }
                  placeholder="Subject"
                />
              </div>
            )}

            {Array.from({ length: safeComparableCount }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium w-32">Comparable {index + 1}:</span>
                <Input
                  value={config.columnLabels?.comparables?.[index] || `Comparable ${index + 1}`}
                  onChange={(e) => updateComparableLabel(index, e.target.value)}
                  placeholder={`Comparable ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveComparableColumn(index, "left")}
                  disabled={index === 0}
                  className="h-6 w-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveComparableColumn(index, "right")}
                  disabled={index === safeComparableCount - 1}
                  className="h-6 w-6"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeComparableColumn(index)}
                  disabled={safeComparableCount <= 1}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {safeComparableCount < 6 && (
              <Button variant="outline" size="sm" onClick={addComparableColumn}>
                <Plus className="h-4 w-4 mr-1" />
                Add Comparable
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Row Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Row Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Rows */}
          <div className="space-y-3">
            {safeRows.map((row, index) => (
              <div key={row.id} className="space-y-3 border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveRow(row.id, "up")}
                      disabled={index === 0}
                      className="h-6 w-6"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveRow(row.id, "down")}
                      disabled={index === safeRows.length - 1}
                      className="h-6 w-6"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <Input
                      value={row.label}
                      onChange={(e) => updateRow(row.id, { label: e.target.value })}
                      placeholder="Row Label"
                    />

                    <Select
                      value={row.type || "text"}
                      onValueChange={(value: "text" | "number" | "currency" | "percentage" | "dropdown") =>
                        updateRow(row.id, { type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={row.guidance || ""}
                      onChange={(e) => updateRow(row.id, { guidance: e.target.value })}
                      placeholder="Guidance (optional)"
                    />

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={row.required || false}
                        onCheckedChange={(checked) => updateRow(row.id, { required: checked })}
                      />
                      <Label className="text-sm">Required</Label>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(row.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {(row.type === "number" || row.type === "currency") && (
                  <div className="ml-12 p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Unit of Measurement</Label>
                      <div className="flex gap-2">
                        <Select
                          value={row.unit ? "custom" : "none"}
                          onValueChange={(value) => {
                            if (value === "none") {
                              updateRow(row.id, { unit: undefined })
                            } else if (value !== "custom") {
                              updateRow(row.id, { unit: value })
                            }
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Unit</SelectItem>
                            <SelectItem value="sqft">Square Feet (sqft)</SelectItem>
                            <SelectItem value="ac">Acres (ac)</SelectItem>
                            <SelectItem value="ft">Feet (ft)</SelectItem>
                            <SelectItem value="%">Percent (%)</SelectItem>
                            <SelectItem value="units">Units</SelectItem>
                            <SelectItem value="beds">Beds</SelectItem>
                            <SelectItem value="baths">Baths</SelectItem>
                            <SelectItem value="custom">Custom...</SelectItem>
                          </SelectContent>
                        </Select>

                        {row.unit && (
                          <Input
                            value={row.unit}
                            onChange={(e) => {
                              // Sanitize input to prevent HTML injection
                              const sanitized = e.target.value.replace(/[<>]/g, "")
                              updateRow(row.id, { unit: sanitized })
                            }}
                            placeholder="Custom unit"
                            className="flex-1"
                            maxLength={10}
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Unit will appear next to the input field</p>
                    </div>
                  </div>
                )}

                {/* Percentage Format Configuration */}
                {row.type === "percentage" && (
                  <div className="ml-12 p-3 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium mb-2 block">Decimal Format</Label>
                    <Select
                      value={row.percentageFormat || "0.00"}
                      onValueChange={(value: "0" | "0.0" | "0.00" | "0.000") =>
                        updateRow(row.id, { percentageFormat: value })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 (e.g., 25%)</SelectItem>
                        <SelectItem value="0.0">0.0 (e.g., 25.0%)</SelectItem>
                        <SelectItem value="0.00">0.00 (e.g., 25.00%)</SelectItem>
                        <SelectItem value="0.000">0.000 (e.g., 25.000%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Dropdown Options Configuration */}
                {row.type === "dropdown" && (
                  <div className="ml-12 p-3 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Dropdown Options</Label>
                      <Button variant="outline" size="sm" onClick={() => addOptionToRow(row.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {row.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <Input
                            value={option.label}
                            onChange={(e) => updateRowOption(row.id, optionIndex, { label: e.target.value })}
                            placeholder="Option Label"
                            className="flex-1"
                          />
                          <Input
                            value={option.value}
                            onChange={(e) => updateRowOption(row.id, optionIndex, { value: e.target.value })}
                            placeholder="Option Value"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOptionFromRow(row.id, optionIndex)}
                            disabled={row.options?.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Add New Row */}
          <div className="space-y-3">
            <h4 className="font-medium">Add New Row</h4>
            <div className="grid grid-cols-4 gap-3">
              <Input
                value={newRow.label || ""}
                onChange={(e) => setNewRow({ ...newRow, label: e.target.value })}
                placeholder="Row Label"
              />

              <Select
                value={newRow.type || "text"}
                onValueChange={(value: "text" | "number" | "currency" | "percentage" | "dropdown") =>
                  setNewRow({ ...newRow, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={newRow.guidance || ""}
                onChange={(e) => setNewRow({ ...newRow, guidance: e.target.value })}
                placeholder="Guidance (optional)"
              />

              <div className="flex items-center gap-2">
                <Switch
                  checked={newRow.required || false}
                  onCheckedChange={(checked) => setNewRow({ ...newRow, required: checked })}
                />
                <Label className="text-sm">Required</Label>
              </div>
            </div>

            <Button onClick={addRow} disabled={!newRow.label?.trim()} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Rows */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary Rows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={safeSummaryRows.length > 0}
                onCheckedChange={(checked) => {
                  if (checked && safeSummaryRows.length === 0) {
                    updateConfig({
                      summaryRows: [
                        {
                          id: "net_adjustments",
                          label: "Net Adjustments",
                          formula: {
                            type: "sum",
                            targetRows: ["gross_living_area", "sale_price"],
                            applyTo: "comparables",
                          },
                        },
                        {
                          id: "adjusted_price",
                          label: "Adjusted Sales Price",
                          formula: {
                            type: "custom",
                            targetRows: ["sale_price", "net_adjustments"],
                            customFormula: "sale_price + net_adjustments",
                            applyTo: "comparables",
                          },
                        },
                      ],
                    })
                  } else if (!checked) {
                    updateConfig({ summaryRows: [] })
                  }
                }}
              />
              <Label>Show summary rows</Label>
            </div>

            {safeSummaryRows.length > 0 && (
              <div className="space-y-3 mt-3">
                {safeSummaryRows.map((row, index) => (
                  <div key={row.id} className="space-y-3 border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Input
                        value={row.label}
                        onChange={(e) => updateSummaryRow(index, { label: e.target.value })}
                        placeholder="Summary Row Label"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newSummaryRows = safeSummaryRows.filter((_, i) => i !== index)
                          updateConfig({ summaryRows: newSummaryRows })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="mb-2 block">Formula Type</Label>
                        <Select
                          value={row.formula?.type || "sum"}
                          onValueChange={(value: "sum" | "average" | "min" | "max" | "custom") =>
                            updateSummaryFormula(index, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sum">Sum</SelectItem>
                            <SelectItem value="average">Average</SelectItem>
                            <SelectItem value="min">Minimum</SelectItem>
                            <SelectItem value="max">Maximum</SelectItem>
                            <SelectItem value="custom">Custom Formula</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="mb-2 block">Apply To</Label>
                        <Select
                          value={row.formula?.applyTo || "all"}
                          onValueChange={(value: "all" | "comparables" | "specific") =>
                            updateSummaryFormula(index, { applyTo: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Columns</SelectItem>
                            <SelectItem value="comparables">Comparables Only</SelectItem>
                            <SelectItem value="specific">Specific Columns</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {row.formula?.type === "custom" && (
                      <div>
                        <Label className="mb-2 block">Custom Formula</Label>
                        <Input
                          value={row.formula?.customFormula || ""}
                          onChange={(e) => updateSummaryFormula(index, { customFormula: e.target.value })}
                          placeholder="e.g., sale_price + net_adjustments"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use row IDs as variables (e.g., sale_price + gross_living_area)
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="mb-2 block">Target Rows</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <Calculator className="mr-2 h-4 w-4" />
                            {row.formula?.targetRows?.length || 0} row(s) selected
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-medium">Select Rows for Calculation</h4>
                            <Separator />
                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                              {safeRows
                                .filter(
                                  (configRow) =>
                                    configRow.type === "number" ||
                                    configRow.type === "currency" ||
                                    configRow.type === "percentage",
                                )
                                .map((configRow) => (
                                  <div key={configRow.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`row-${index}-${configRow.id}`}
                                      checked={row.formula?.targetRows?.includes(configRow.id)}
                                      onCheckedChange={() => toggleRowForFormula(index, configRow.id)}
                                    />
                                    <Label htmlFor={`row-${index}-${configRow.id}`} className="text-sm">
                                      {configRow.label} ({configRow.type})
                                    </Label>
                                  </div>
                                ))}
                              {safeRows.filter(
                                (r) => r.type === "number" || r.type === "currency" || r.type === "percentage",
                              ).length === 0 && (
                                <p className="text-sm text-muted-foreground">No numeric rows available</p>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    const newSummaryRows = [...safeSummaryRows]
                    newSummaryRows.push({
                      id: `summary_${Date.now()}`,
                      label: "New Summary Row",
                      formula: {
                        type: "sum",
                        targetRows: [],
                        applyTo: "comparables",
                      },
                    })
                    updateConfig({ summaryRows: newSummaryRows })
                  }}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Summary Row
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r">
                    Property
                  </th>
                  {config.showSubject && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {config.columnLabels?.subject || "Subject"}
                    </th>
                  )}
                  {Array.from({ length: safeComparableCount }).map((_, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {config.columnLabels?.comparables?.[index] || `Comparable ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r">
                      {row.label}
                      {row.required && <span className="text-red-500 ml-1">*</span>}
                    </td>
                    {config.showSubject && (
                      <td className="px-2 py-2">
                        <div className="h-8 bg-gray-100 rounded flex items-center px-2 text-xs text-gray-500">
                          {row.type === "dropdown"
                            ? "Select..."
                            : row.type === "currency"
                              ? row.unit
                                ? `$0.00 ${row.unit}`
                                : "$0.00"
                              : row.type === "percentage"
                                ? row.percentageFormat === "0"
                                  ? "0%"
                                  : row.percentageFormat === "0.0"
                                    ? "0.0%"
                                    : row.percentageFormat === "0.000"
                                      ? "0.000%"
                                      : "0.00%"
                                : row.type === "number"
                                  ? row.unit
                                    ? `0 ${row.unit}`
                                    : "0"
                                  : "Text"}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {safeSummaryRows.map((summaryRow) => (
                  <tr key={summaryRow.id} className="bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 z-10 border-r">
                      {summaryRow.label}
                    </td>
                    {config.showSubject && (
                      <td className="px-2 py-2">
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </td>
                    )}
                    {Array.from({ length: safeComparableCount }).map((_, index) => (
                      <td key={index} className="px-2 py-2">
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

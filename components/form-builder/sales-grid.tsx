"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HelpCircle, Plus, ArrowLeft, ArrowRight, X } from "lucide-react"

export interface SalesGridRowOption {
  label: string
  value: string
}

export interface SalesGridRow {
  id: string
  label: string
  guidance?: string
  type?: "text" | "number" | "currency" | "percentage" | "dropdown"
  required?: boolean
  options?: SalesGridRowOption[] // For dropdown type
  percentageFormat?: "0" | "0.0" | "0.00" | "0.000" // For percentage type
  unit?: string // Add unit property for number and currency types
}

export interface SalesGridFormula {
  type: "sum" | "average" | "min" | "max" | "custom"
  targetRows?: string[] // Row IDs to include in calculation
  customFormula?: string // For custom formulas
  applyTo?: "all" | "comparables" | "specific" // Where to apply the formula
  specificColumns?: number[] // Specific column indices (0-based)
}

export interface SalesGridSummaryRow {
  id: string
  label: string
  formula?: SalesGridFormula
}

export type SalesGridType = "sales" | "rental" | "listing"

export interface SalesGridConfig {
  type?: SalesGridType
  comparableCount: number
  showSubject: boolean
  columnLabels: {
    subject: string
    comparables: string[]
  }
  rows: SalesGridRow[]
  summaryRows?: SalesGridSummaryRow[]
}

export interface SalesGridData {
  subject: Record<string, string>
  comparables: Record<string, string>[]
}

export interface SalesGridProps {
  id: string
  label: string
  config: SalesGridConfig
  value?: SalesGridData
  onChange?: (value: SalesGridData) => void
  required?: boolean
  disabled?: boolean
  isPreview?: boolean
}

export function SalesGrid({
  id,
  label,
  config,
  value,
  onChange,
  required = false,
  disabled = false,
  isPreview = false,
}: SalesGridProps) {
  // Ensure config has proper defaults
  const safeConfig = {
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
        type: "dropdown" as const,
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
        type: "dropdown" as const,
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
        type: "number" as const,
        guidance: "Enter square footage",
      },
      { id: "sale_price", label: "Sale Price", type: "currency" as const, guidance: "Enter in dollars" },
    ],
    summaryRows: [],
    ...config,
  }

  // Initialize with default data if none provided
  const [data, setData] = useState<SalesGridData>(() => {
    if (value) return value

    // Create default data structure
    const defaultData: SalesGridData = {
      subject: {},
      comparables: Array(safeConfig.comparableCount || 3).fill({}),
    }

    return defaultData
  })

  // Local state for dynamic comparable management
  const [localConfig, setLocalConfig] = useState(safeConfig)

  // Ref to track if we should call onChange
  const shouldCallOnChange = useRef(false)

  // Update data when config changes (e.g., when comparable count changes)
  useEffect(() => {
    setLocalConfig(safeConfig)

    if (!value) {
      // Adjust comparable count if needed
      if (data.comparables.length !== safeConfig.comparableCount) {
        setData((prevData) => {
          const newComparables = [...prevData.comparables]

          // Add more comparables if needed
          while (newComparables.length < safeConfig.comparableCount) {
            newComparables.push({})
          }

          // Remove excess comparables if needed
          if (newComparables.length > safeConfig.comparableCount) {
            newComparables.length = safeConfig.comparableCount
          }

          return {
            ...prevData,
            comparables: newComparables,
          }
        })
      }
    }
  }, [safeConfig.comparableCount, value])

  // Handle cell value change
  const handleCellChange = (
    rowId: string,
    columnType: "subject" | "comparable",
    comparableIndex = 0,
    value: string,
  ) => {
    setData((prevData) => {
      if (columnType === "subject") {
        const newSubject = { ...prevData.subject, [rowId]: value }
        const newData = { ...prevData, subject: newSubject }
        // Call onChange directly for cell changes
        onChange?.(newData)
        return newData
      } else {
        const newComparables = [...prevData.comparables]
        if (!newComparables[comparableIndex]) {
          newComparables[comparableIndex] = {}
        }
        newComparables[comparableIndex] = {
          ...newComparables[comparableIndex],
          [rowId]: value,
        }
        const newData = { ...prevData, comparables: newComparables }
        // Call onChange directly for cell changes
        onChange?.(newData)
        return newData
      }
    })
  }

  // Get cell value
  const getCellValue = (rowId: string, columnType: "subject" | "comparable", comparableIndex = 0): string => {
    if (columnType === "subject") {
      return data.subject[rowId] || ""
    } else {
      if (!data.comparables[comparableIndex]) return ""
      return data.comparables[comparableIndex][rowId] || ""
    }
  }

  // Format currency display
  const formatCurrency = (value: string | number): string => {
    if (value === undefined || value === null || value === "") return ""
    const numValue = typeof value === "string" ? Number.parseFloat(value) : value
    if (isNaN(numValue)) return String(value)
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numValue)
  }

  // Format percentage display with configurable decimal places
  const formatPercentage = (value: string | number, format = "0.00"): string => {
    if (value === undefined || value === null || value === "") return ""
    const numValue = typeof value === "string" ? Number.parseFloat(value) : value
    if (isNaN(numValue)) return String(value)

    // Determine decimal places from format
    let maximumFractionDigits = 2
    switch (format) {
      case "0":
        maximumFractionDigits = 0
        break
      case "0.0":
        maximumFractionDigits = 1
        break
      case "0.00":
        maximumFractionDigits = 2
        break
      case "0.000":
        maximumFractionDigits = 3
        break
    }

    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: maximumFractionDigits,
      maximumFractionDigits: maximumFractionDigits,
    }).format(numValue / 100)
  }

  // Parse numeric value from string
  const parseNumericValue = (value: string): number => {
    if (!value) return 0
    // Remove currency symbols, commas, and other non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.-]/g, "")
    return Number.parseFloat(cleanValue) || 0
  }

  // Calculate summary row values
  const calculateSummaryValue = (
    summaryRow: SalesGridSummaryRow,
    columnType: "subject" | "comparable",
    comparableIndex = 0,
  ): number => {
    if (!summaryRow.formula) return 0

    const { formula } = summaryRow
    const targetRows = formula.targetRows || []

    // If no target rows specified, return 0
    if (targetRows.length === 0) return 0

    // Get values for target rows
    const values = targetRows.map((rowId) => {
      const cellValue = getCellValue(rowId, columnType, comparableIndex)
      return parseNumericValue(cellValue)
    })

    // Apply formula
    switch (formula.type) {
      case "sum":
        return values.reduce((sum, val) => sum + val, 0)
      case "average":
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
      case "min":
        return values.length > 0 ? Math.min(...values) : 0
      case "max":
        return values.length > 0 ? Math.max(...values) : 0
      case "custom":
        // For custom formulas, we'd need a formula parser
        // This is a simplified implementation
        try {
          // Simple evaluation of basic arithmetic
          // WARNING: This is not secure for production use
          // A proper formula parser should be used instead
          const rowValues: Record<string, number> = {}
          targetRows.forEach((rowId) => {
            rowValues[rowId] = parseNumericValue(getCellValue(rowId, columnType, comparableIndex))
          })

          // Replace row IDs with their values in the formula
          let evalFormula = formula.customFormula || ""
          Object.entries(rowValues).forEach(([rowId, value]) => {
            evalFormula = evalFormula.replace(new RegExp(rowId, "g"), value.toString())
          })

          // Evaluate the formula
          // eslint-disable-next-line no-eval
          return eval(evalFormula)
        } catch (error) {
          console.error("Error evaluating formula:", error)
          return 0
        }
      default:
        return 0
    }
  }

  // Render cell content
  const renderCell = (row: SalesGridRow, columnType: "subject" | "comparable", comparableIndex = 0) => {
    const cellValue = getCellValue(row.id, columnType, comparableIndex)

    // In builder mode (not preview), show placeholder
    if (!isPreview && !disabled) {
      return (
        <div className="p-2 bg-gray-50 text-gray-400 text-sm rounded">
          {row.type === "currency"
            ? "$0.00"
            : row.type === "percentage"
              ? formatPercentage("0", row.percentageFormat)
              : row.type === "number"
                ? "0"
                : row.type === "dropdown"
                  ? "Select..."
                  : "Text"}
        </div>
      )
    }

    // In preview mode, show actual inputs
    switch (row.type) {
      case "currency":
        return (
          <div className="flex items-center w-full">
            <Input
              type="text"
              value={cellValue}
              onChange={(e) => handleCellChange(row.id, columnType, comparableIndex, e.target.value)}
              placeholder="$0.00"
              disabled={disabled}
              className="w-full"
            />
            {row.unit && <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">{row.unit}</span>}
          </div>
        )
      case "number":
        return (
          <div className="flex items-center w-full">
            <Input
              type="number"
              value={cellValue}
              onChange={(e) => handleCellChange(row.id, columnType, comparableIndex, e.target.value)}
              placeholder="0"
              disabled={disabled}
              className="w-full"
            />
            {row.unit && <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">{row.unit}</span>}
          </div>
        )
      case "percentage":
        return (
          <Input
            type="text"
            value={cellValue}
            onChange={(e) => handleCellChange(row.id, columnType, comparableIndex, e.target.value)}
            placeholder={formatPercentage("0", row.percentageFormat)}
            disabled={disabled}
            className="w-full"
          />
        )
      case "dropdown":
        return (
          <Select
            value={cellValue}
            onValueChange={(value) => handleCellChange(row.id, columnType, comparableIndex, value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {row.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return (
          <Input
            type="text"
            value={cellValue}
            onChange={(e) => handleCellChange(row.id, columnType, comparableIndex, e.target.value)}
            placeholder=""
            disabled={disabled}
            className="w-full"
          />
        )
    }
  }

  // Render summary cell content
  const renderSummaryCell = (
    summaryRow: SalesGridSummaryRow,
    columnType: "subject" | "comparable",
    comparableIndex = 0,
  ) => {
    // Calculate the summary value
    const summaryValue = calculateSummaryValue(summaryRow, columnType, comparableIndex)

    // Format based on the first target row's type (if available)
    const targetRowId = summaryRow.formula?.targetRows?.[0]
    const targetRow = targetRowId ? localConfig.rows.find((row) => row.id === targetRowId) : null

    let formattedValue = String(summaryValue)
    if (targetRow?.type === "currency") {
      formattedValue = formatCurrency(summaryValue)
    } else if (targetRow?.type === "percentage") {
      formattedValue = formatPercentage(summaryValue, targetRow.percentageFormat)
    }

    return <div className="text-right font-medium">{formattedValue}</div>
  }

  // Add a new comparable column
  const addComparable = useCallback(() => {
    if (localConfig.comparableCount >= 6) return

    const newCount = localConfig.comparableCount + 1
    const newLabels = [...localConfig.columnLabels.comparables]
    newLabels.push(`Comparable ${newCount}`)

    // Update local config
    const newConfig = {
      ...localConfig,
      comparableCount: newCount,
      columnLabels: {
        ...localConfig.columnLabels,
        comparables: newLabels,
      },
    }
    setLocalConfig(newConfig)

    // Update data and call onChange
    setData((prevData) => {
      const newComparables = [...prevData.comparables, {}]
      const newData = { ...prevData, comparables: newComparables }
      // Use setTimeout to avoid setState during render
      setTimeout(() => onChange?.(newData), 0)
      return newData
    })
  }, [localConfig, onChange])

  // Remove a comparable column
  const removeComparable = useCallback(
    (index: number) => {
      if (localConfig.comparableCount <= 1) return

      const newCount = localConfig.comparableCount - 1
      const newLabels = [...localConfig.columnLabels.comparables]
      newLabels.splice(index, 1)

      // Update local config
      const newConfig = {
        ...localConfig,
        comparableCount: newCount,
        columnLabels: {
          ...localConfig.columnLabels,
          comparables: newLabels,
        },
      }
      setLocalConfig(newConfig)

      // Update data and call onChange
      setData((prevData) => {
        const newComparables = [...prevData.comparables]
        newComparables.splice(index, 1)
        const newData = { ...prevData, comparables: newComparables }
        // Use setTimeout to avoid setState during render
        setTimeout(() => onChange?.(newData), 0)
        return newData
      })
    },
    [localConfig, onChange],
  )

  // Move a comparable column left or right
  const moveComparable = useCallback(
    (index: number, direction: "left" | "right") => {
      const newIndex = direction === "left" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= localConfig.comparableCount) return

      console.log(`Moving column ${index} ${direction} to position ${newIndex}`)

      // Update both local config and data in a single operation
      setLocalConfig((prevConfig) => {
        const newLabels = [...prevConfig.columnLabels.comparables]
        const tempLabel = newLabels[index]
        newLabels[index] = newLabels[newIndex]
        newLabels[newIndex] = tempLabel

        console.log("Old labels:", prevConfig.columnLabels.comparables)
        console.log("New labels:", newLabels)

        return {
          ...prevConfig,
          columnLabels: {
            ...prevConfig.columnLabels,
            comparables: newLabels,
          },
        }
      })

      // Update data and call onChange
      setData((prevData) => {
        const newComparables = [...prevData.comparables]
        const tempData = newComparables[index]
        newComparables[index] = newComparables[newIndex]
        newComparables[newIndex] = tempData

        console.log("Old data:", prevData.comparables)
        console.log("New data:", newComparables)

        const newData = { ...prevData, comparables: newComparables }
        // Use setTimeout to avoid setState during render
        setTimeout(() => onChange?.(newData), 0)
        return newData
      })
    },
    [localConfig.comparableCount, onChange],
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-base font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r min-w-[180px]">
                Property
              </th>
              {localConfig.showSubject && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  {localConfig.columnLabels?.subject || "Subject"}
                </th>
              )}
              {Array.from({ length: localConfig.comparableCount }).map((_, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] relative group"
                >
                  <div className="flex items-center">
                    <span className="flex-1">
                      {localConfig.columnLabels?.comparables?.[index] || `Comparable ${index + 1}`}
                    </span>

                    {isPreview && !disabled && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveComparable(index, "left")}
                          disabled={index === 0}
                          className="h-6 w-6"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveComparable(index, "right")}
                          disabled={index === localConfig.comparableCount - 1}
                          className="h-6 w-6"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeComparable(index)}
                          disabled={localConfig.comparableCount <= 1}
                          className="h-6 w-6 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {isPreview && !disabled && localConfig.comparableCount < 6 && (
                <th className="px-4 py-3 w-10">
                  <Button variant="ghost" size="sm" onClick={addComparable} className="h-6 w-6" title="Add Comparable">
                    <Plus className="h-4 w-4" />
                  </Button>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {localConfig.rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r flex items-center gap-2">
                  {row.label}
                  {row.guidance && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">{row.guidance}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {row.required && <span className="text-red-500">*</span>}
                </td>
                {localConfig.showSubject && <td className="px-2 py-2">{renderCell(row, "subject")}</td>}
                {Array.from({ length: localConfig.comparableCount }).map((_, index) => (
                  <td key={index} className="px-2 py-2">
                    {renderCell(row, "comparable", index)}
                  </td>
                ))}
                {isPreview && !disabled && localConfig.comparableCount < 6 && <td></td>}
              </tr>
            ))}

            {/* Summary rows if configured */}
            {localConfig.summaryRows?.map((summaryRow) => (
              <tr key={summaryRow.id} className="bg-gray-50 font-medium">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 z-10 border-r">
                  {summaryRow.label}
                </td>
                {localConfig.showSubject && (
                  <td className="px-2 py-2">{summaryRow.formula ? renderSummaryCell(summaryRow, "subject") : ""}</td>
                )}
                {Array.from({ length: localConfig.comparableCount }).map((_, index) => (
                  <td key={index} className="px-2 py-2">
                    {summaryRow.formula ? renderSummaryCell(summaryRow, "comparable", index) : ""}
                  </td>
                ))}
                {isPreview && !disabled && localConfig.comparableCount < 6 && <td></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPreview && !disabled && localConfig.comparableCount < 6 && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={addComparable} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Comparable
          </Button>
        </div>
      )}
    </div>
  )
}

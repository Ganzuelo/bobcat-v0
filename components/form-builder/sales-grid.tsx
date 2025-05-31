"use client"

import type React from "react"
import { useState } from "react"

interface SalesGridRow {
  id: string
  label: string
  type: "text" | "number" | "boolean"
  guidance: string
}

interface SalesGridConfig {
  title: string
  description: string
  rows: SalesGridRow[]
  columnLabels: {
    main: string
    comparables: string[]
  }
  comparableCount: number
}

interface SalesGridProps {
  config: SalesGridConfig
  value: any // Replace 'any' with a more specific type if possible
  onChange?: (value: any) => void
  onConfigChange?: (config: SalesGridConfig) => void
}

const SalesGrid: React.FC<SalesGridProps> = ({ config, value, onChange, onConfigChange }) => {
  const [localConfig, setLocalConfig] = useState<SalesGridConfig>(config)

  const updateLocalConfig = (newConfig: SalesGridConfig) => {
    setLocalConfig(newConfig)
  }

  const addRow = () => {
    const newRow = {
      id: `custom_row_${Date.now()}`, // Use timestamp for uniqueness
      label: "New Row",
      type: "text" as const,
      guidance: "",
    }

    const updatedConfig = {
      ...config,
      rows: [...config.rows, newRow],
    }

    onChange?.(value) // Trigger re-render
    onConfigChange?.(updatedConfig)
  }

  const addComparable = () => {
    const newComparableIndex = config.comparableCount + 1
    const newColumnLabels = {
      ...config.columnLabels,
      comparables: [...config.columnLabels.comparables, `Comparable ${newComparableIndex}`],
    }

    const updatedConfig = {
      ...config,
      comparableCount: newComparableIndex,
      columnLabels: newColumnLabels,
    }

    onConfigChange?.(updatedConfig)
  }

  const handleRowChange = (rowId: string, field: keyof SalesGridRow, newValue: any) => {
    const updatedRows = config.rows.map((row) => (row.id === rowId ? { ...row, [field]: newValue } : row))

    const updatedConfig = {
      ...config,
      rows: updatedRows,
    }

    onConfigChange?.(updatedConfig)
  }

  const handleTitleChange = (newTitle: string) => {
    const updatedConfig = {
      ...config,
      title: newTitle,
    }
    onConfigChange?.(updatedConfig)
  }

  const handleDescriptionChange = (newDescription: string) => {
    const updatedConfig = {
      ...config,
      description: newDescription,
    }
    onConfigChange?.(updatedConfig)
  }

  return (
    <div>
      <div>
        <label htmlFor="title">Title:</label>
        <input type="text" id="title" value={config.title} onChange={(e) => handleTitleChange(e.target.value)} />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={config.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>{config.columnLabels.main}</th>
            {config.columnLabels.comparables.map((label, index) => (
              <th key={index}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {config.rows.map((row) => (
            <tr key={row.id}>
              <td>
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => handleRowChange(row.id, "label", e.target.value)}
                />
              </td>
              {config.columnLabels.comparables.map((_, index) => (
                <td key={index}>
                  {row.type === "text" && (
                    <input
                      type="text"
                      value={value?.[row.id]?.[index] || ""}
                      onChange={(e) => {
                        const newValue = e.target.value
                        const updatedValue = {
                          ...value,
                          [row.id]: {
                            ...value?.[row.id],
                            [index]: newValue,
                          },
                        }
                        onChange?.(updatedValue)
                      }}
                    />
                  )}
                  {row.type === "number" && (
                    <input
                      type="number"
                      value={value?.[row.id]?.[index] || ""}
                      onChange={(e) => {
                        const newValue = e.target.value
                        const updatedValue = {
                          ...value,
                          [row.id]: {
                            ...value?.[row.id],
                            [index]: newValue,
                          },
                        }
                        onChange?.(updatedValue)
                      }}
                    />
                  )}
                  {row.type === "boolean" && (
                    <input
                      type="checkbox"
                      checked={value?.[row.id]?.[index] || false}
                      onChange={(e) => {
                        const newValue = e.target.checked
                        const updatedValue = {
                          ...value,
                          [row.id]: {
                            ...value?.[row.id],
                            [index]: newValue,
                          },
                        }
                        onChange?.(updatedValue)
                      }}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow}>Add Row</button>
      <button onClick={addComparable}>Add Comparable</button>
    </div>
  )
}

export default SalesGrid

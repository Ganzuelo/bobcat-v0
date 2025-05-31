"use client"

import type React from "react"
import { SalesGrid } from "./sales-grid"

// Add debugging to see when this module loads
console.log("FieldRenderer module loading")

interface FieldProps {
  field: any
  values: any
  onFieldChange?: (id: string, value: any) => void
  disabled?: boolean
}

const FieldRenderer: React.FC<FieldProps> = ({ field, values, onFieldChange, disabled }) => {
  // Add debugging to see when component renders
  console.log("FieldRenderer rendering with field type:", field?.type)

  const renderField = () => {
    switch (field.type) {
      case "text":
        return (
          <div>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              type="text"
              id={field.id}
              value={values?.[field.id] || ""}
              onChange={(e) => onFieldChange?.(field.id, e.target.value)}
              disabled={disabled}
              required={field.required}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )
      case "number":
        return (
          <div>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              type="number"
              id={field.id}
              value={values?.[field.id] || ""}
              onChange={(e) => onFieldChange?.(field.id, Number.parseFloat(e.target.value))}
              disabled={disabled}
              required={field.required}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )
      case "textarea":
        return (
          <div>
            <label htmlFor={field.id}>{field.label}</label>
            <textarea
              id={field.id}
              value={values?.[field.id] || ""}
              onChange={(e) => onFieldChange?.(field.id, e.target.value)}
              disabled={disabled}
              required={field.required}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )
      case "select":
        return (
          <div>
            <label htmlFor={field.id}>{field.label}</label>
            <select
              id={field.id}
              value={values?.[field.id] || ""}
              onChange={(e) => onFieldChange?.(field.id, e.target.value)}
              disabled={disabled}
              required={field.required}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select an option</option>
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )
      case "checkbox":
        return (
          <div>
            <label>
              <input
                type="checkbox"
                id={field.id}
                checked={values?.[field.id] || false}
                onChange={(e) => onFieldChange?.(field.id, e.target.checked)}
                disabled={disabled}
                required={field.required}
                className="mr-2 leading-tight"
              />
              {field.label}
            </label>
          </div>
        )
      case "radio":
        return (
          <div>
            <p>{field.label}</p>
            {field.options?.map((option: any) => (
              <label key={option.value} className="block">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={values?.[field.id] === option.value}
                  onChange={() => onFieldChange?.(field.id, option.value)}
                  disabled={disabled}
                  required={field.required}
                  className="mr-2 leading-tight"
                />
                {option.label}
              </label>
            ))}
          </div>
        )
      case "date":
        return (
          <div>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              type="date"
              id={field.id}
              value={values?.[field.id] || ""}
              onChange={(e) => onFieldChange?.(field.id, e.target.value)}
              disabled={disabled}
              required={field.required}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )
      case "sales_grid": {
        console.log("Rendering sales_grid with config:", field.gridConfig || field.config?.gridConfig)

        const gridConfig = field.gridConfig || field.config?.gridConfig
        if (!gridConfig) {
          return (
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              Sales Grid not configured
            </div>
          )
        }

        return (
          <SalesGrid
            id={field.id}
            label="" // Don't pass label here to avoid duplication
            config={gridConfig}
            value={values?.[field.id]}
            onChange={(value) => onFieldChange?.(field.id, value)}
            required={field.required}
            disabled={disabled}
            isPreview={true}
          />
        )
      }
      default:
        console.log("Unsupported field type:", field.type)
        return <div>Unsupported field type: {field.type}</div>
    }
  }

  return <div className="mb-4">{renderField()}</div>
}

// Export both as default AND named export to support both import styles
export default FieldRenderer
export { FieldRenderer }

console.log("FieldRenderer module loaded and exported both default and named")

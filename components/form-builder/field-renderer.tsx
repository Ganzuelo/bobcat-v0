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
  // Add comprehensive debugging
  console.log("🔍 FieldRenderer Debug Info:")
  console.log("  - field object:", field)
  console.log("  - field.type:", field?.type)
  console.log("  - field.field_type:", field?.field_type)
  console.log("  - typeof field.type:", typeof field?.type)
  console.log("  - typeof field.field_type:", typeof field?.field_type)

  const renderField = () => {
    // Check both field.type and field.field_type for compatibility
    const fieldType = field.type || field.field_type
    console.log("  - Using fieldType:", fieldType)

    switch (fieldType?.toLowerCase()) {
      case "text":
      case "email":
      case "phone":
      case "url":
      case "password":
        return (
          <div>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              type={fieldType === "password" ? "password" : fieldType === "email" ? "email" : "text"}
              id={field.id}
              value={values?.[field.id] || ""}
              onChange={(e) => onFieldChange?.(field.id, e.target.value)}
              disabled={disabled}
              required={field.required}
              placeholder={field.placeholder}
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
              placeholder={field.placeholder}
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
              placeholder={field.placeholder}
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
      case "time":
        return (
          <div>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              type="time"
              id={field.id}
              value={values?.[field.id] || ""}
              onChange={(e) => onFieldChange?.(field.id, e.target.value)}
              disabled={disabled}
              required={field.required}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )
      case "file":
        return (
          <div>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              type="file"
              id={field.id}
              onChange={(e) => onFieldChange?.(field.id, e.target.files?.[0])}
              disabled={disabled}
              required={field.required}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )
      case "hidden":
        return <input type="hidden" id={field.id} value={values?.[field.id] || field.defaultValue || ""} />
      case "heading":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-2">{field.label || field.text}</h2>
          </div>
        )
      case "paragraph":
        return (
          <div>
            <p className="text-gray-700 mb-2">{field.text || field.label}</p>
          </div>
        )
      case "divider":
        return (
          <div>
            <hr className="my-4 border-gray-300" />
          </div>
        )
      case "spacer":
        return (
          <div style={{ height: field.height === "small" ? "10px" : field.height === "large" ? "40px" : "20px" }} />
        )
      case "sales_grid":
        console.log("🔍 Rendering sales_grid with field:", field)
        console.log("🔍 gridConfig:", field.gridConfig || field.config?.gridConfig)

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
      default:
        console.error("❌ Unsupported field type:", fieldType, "for field:", field)
        return (
          <div className="p-4 border border-red-300 bg-red-50 rounded text-red-700">
            Unsupported field type: {fieldType}
            <br />
            <small>Field object: {JSON.stringify(field, null, 2)}</small>
          </div>
        )
    }
  }

  return <div className="mb-4">{renderField()}</div>
}

// Export both as default AND named export to support both import styles
export default FieldRenderer
export { FieldRenderer }

console.log("FieldRenderer module loaded and exported both default and named")

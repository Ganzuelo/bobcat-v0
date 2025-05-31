"use client"

import type React from "react"

interface FieldProps {
  field: any
  values: any
  onFieldChange?: (id: string, value: any) => void
  disabled?: boolean
}

const FieldRenderer: React.FC<FieldProps> = ({ field, values, onFieldChange, disabled }) => {
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
        return <div>Unsupported field type: {field.type}</div>
    }
  }

  return <div className="mb-4">{renderField()}</div>
}

export default FieldRenderer

import { SalesGrid } from "./sales-grid"

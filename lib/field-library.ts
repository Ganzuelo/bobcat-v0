import { v4 as uuidv4 } from "uuid"
import type { FieldType, FormField } from "@/lib/form-types"

// Add the SALES_GRID field type to the field types
export const FIELD_TYPES: FieldType[] = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
  "CHECKBOXGROUP",
  "HIDDEN",
  "HEADING",
  "PARAGRAPH",
  "DIVIDER",
  "FILE",
  "SIGNATURE",
  "SALES_GRID", // Added new field type
]

import { FIELD_TYPES as FIELD_TYPES_2 } from "@/lib/form-types"

export const fieldLibrary = {
  // Basic Fields
  [FIELD_TYPES_2.TEXT]: {
    type: FIELD_TYPES_2.TEXT,
    label: "Text Field",
    placeholder: "Enter text",
    help_text: "",
    required: false,
    width: "full",
    validation: {},
  },
  [FIELD_TYPES_2.TEXTAREA]: {
    type: FIELD_TYPES_2.TEXTAREA,
    label: "Text Area",
    placeholder: "Enter long text",
    help_text: "",
    required: false,
    width: "full",
    validation: {},
  },
  [FIELD_TYPES_2.NUMBER]: {
    type: FIELD_TYPES_2.NUMBER,
    label: "Number",
    placeholder: "Enter a number",
    help_text: "",
    required: false,
    width: "full",
    validation: {
      min: null,
      max: null,
    },
  },
  [FIELD_TYPES_2.CHECKBOX]: {
    type: FIELD_TYPES_2.CHECKBOX,
    label: "Checkbox",
    help_text: "",
    required: false,
    width: "full",
  },
  [FIELD_TYPES_2.RADIO]: {
    type: FIELD_TYPES_2.RADIO,
    label: "Radio Group",
    help_text: "",
    required: false,
    width: "full",
    options: ["Option 1", "Option 2", "Option 3"],
  },
  [FIELD_TYPES_2.SELECT]: {
    type: FIELD_TYPES_2.SELECT,
    label: "Dropdown",
    placeholder: "Select an option",
    help_text: "",
    required: false,
    width: "full",
    options: ["Option 1", "Option 2", "Option 3"],
  },
  [FIELD_TYPES_2.DATE]: {
    type: FIELD_TYPES_2.DATE,
    label: "Date",
    placeholder: "Select a date",
    help_text: "",
    required: false,
    width: "full",
  },
  [FIELD_TYPES_2.TIME]: {
    type: FIELD_TYPES_2.TIME,
    label: "Time",
    placeholder: "Select a time",
    help_text: "",
    required: false,
    width: "full",
  },
  [FIELD_TYPES_2.EMAIL]: {
    type: FIELD_TYPES_2.EMAIL,
    label: "Email",
    placeholder: "Enter your email",
    help_text: "",
    required: false,
    width: "full",
    validation: {
      pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
    },
  },
  [FIELD_TYPES_2.PHONE]: {
    type: FIELD_TYPES_2.PHONE,
    label: "Phone",
    placeholder: "Enter your phone number",
    help_text: "",
    required: false,
    width: "full",
  },
  [FIELD_TYPES_2.URL]: {
    type: FIELD_TYPES_2.URL,
    label: "URL",
    placeholder: "Enter a URL",
    help_text: "",
    required: false,
    width: "full",
  },
  [FIELD_TYPES_2.PASSWORD]: {
    type: FIELD_TYPES_2.PASSWORD,
    label: "Password",
    placeholder: "Enter a password",
    help_text: "",
    required: false,
    width: "full",
  },
  [FIELD_TYPES_2.FILE]: {
    type: FIELD_TYPES_2.FILE,
    label: "File Upload",
    help_text: "",
    required: false,
    width: "full",
  },
  [FIELD_TYPES_2.HIDDEN]: {
    type: FIELD_TYPES_2.HIDDEN,
    label: "Hidden Field",
    help_text: "",
    width: "full",
  },
  [FIELD_TYPES_2.HEADING]: {
    type: FIELD_TYPES_2.HEADING,
    label: "Heading",
    text: "Section Heading",
    level: 2,
    width: "full",
  },
  [FIELD_TYPES_2.PARAGRAPH]: {
    type: FIELD_TYPES_2.PARAGRAPH,
    label: "Paragraph",
    text: "This is a paragraph of text.",
    width: "full",
  },
  [FIELD_TYPES_2.DIVIDER]: {
    type: FIELD_TYPES_2.DIVIDER,
    label: "Divider",
    width: "full",
  },
  [FIELD_TYPES_2.SPACER]: {
    type: FIELD_TYPES_2.SPACER,
    label: "Spacer",
    height: "medium",
    width: "full",
  },
  sales_grid: {
    id: "field-sales-grid",
    field_type: "sales_grid",
    label: "Sales Comparison Grid",
    help_text: "Configurable grid for comparable sales data",
    required: false,
    width: "full",
    validation: {},
    gridConfig: {
      comparableCount: 3,
      showSubject: true,
      columnLabels: {
        subject: "Subject",
        comparables: ["Comparable 1", "Comparable 2", "Comparable 3"],
      },
      rows: [
        { id: "view", label: "View", type: "text" },
        { id: "condition", label: "Condition", type: "text" },
        { id: "gross_living_area", label: "Gross Living Area", type: "number", guidance: "Enter square footage" },
        { id: "sale_price", label: "Sale Price", type: "currency", guidance: "Enter in dollars" },
        { id: "room_count", label: "Room Count", type: "text" },
        { id: "basement", label: "Basement/Finished Rooms", type: "text" },
        { id: "functional_utility", label: "Functional Utility", type: "text" },
        { id: "heating_cooling", label: "Heating/Cooling", type: "text" },
      ],
      summaryRows: [
        { id: "net_adjustments", label: "Net Adjustments" },
        { id: "adjusted_price", label: "Adjusted Sales Price" },
      ],
    },
  },
}

export function createField(type: string, overrides = {}) {
  // Normalize type to lowercase for consistent comparison
  const normalizedType = type.toLowerCase()

  // Find the field template
  let fieldTemplate = fieldLibrary[normalizedType]

  // If not found directly, try to find by alternative keys
  if (!fieldTemplate) {
    const fieldTypes = Object.keys(fieldLibrary)
    const matchingType = fieldTypes.find((key) => key.toLowerCase() === normalizedType)
    if (matchingType) {
      fieldTemplate = fieldLibrary[matchingType]
    }
  }

  // If still not found, use text field as fallback
  if (!fieldTemplate) {
    console.warn(`Field type "${type}" not found in library, using text field as fallback`)
    fieldTemplate = fieldLibrary[FIELD_TYPES_2.TEXT]
  }

  // Create a new field with a unique ID
  return {
    id: crypto.randomUUID(),
    field_order: 0,
    ...fieldTemplate,
    field_type: normalizedType, // Ensure field_type is set correctly
    ...overrides,
  }
}

/**
 * Get a default field configuration by field type
 * @param fieldType The type of field to get
 * @returns A new field configuration with a unique ID, or null if type not found
 */
export function getDefaultField(fieldType: string): any | null {
  // Check if the field type exists in our library
  if (!fieldLibrary[fieldType as keyof typeof fieldLibrary]) {
    console.warn(`Field type "${fieldType}" not found in field library`)
    return null
  }

  // Clone the field config to avoid modifying the original
  const fieldConfig = { ...fieldLibrary[fieldType as keyof typeof fieldLibrary] }

  // Generate a new unique ID for the field
  fieldConfig.id = `field-${uuidv4()}`

  return fieldConfig
}

/**
 * Get a categorized list of all available field types
 * @returns An object with field types grouped by category
 */
export function getCategorizedFieldTypes() {
  return {
    text: ["text", "textarea", "email", "password", "phone", "url"],
    number: ["number", "currency", "percentage"],
    selection: ["select", "multiselect", "radio", "checkbox", "toggle"],
    dateTime: ["date", "datetime", "time"],
    file: ["file", "image", "signature"],
    interactive: ["rating", "slider", "matrix", "sales_grid"], // Add sales_grid here
    location: ["address", "location"],
    calculated: ["calculated", "lookup", "hidden"],
    layout: ["section_break", "page_break", "html_content"],
  }
}

/**
 * Get field display information for the UI
 * @param fieldType The type of field
 * @returns An object with display information or null if not found
 */
export function getFieldDisplayInfo(fieldType: string): { name: string; description: string; icon: string } | null {
  const displayInfo: Record<string, { name: string; description: string; icon: string }> = {
    text: {
      name: "Text Input",
      description: "Single line text input",
      icon: "type",
    },
    textarea: {
      name: "Text Area",
      description: "Multi-line text input",
      icon: "align-left",
    },
    email: {
      name: "Email",
      description: "Email address input",
      icon: "mail",
    },
    // Add more display info for other field types...
  }

  return displayInfo[fieldType] || null
}

// Update the field library to include the SALES_GRID field type
export const FIELD_LIBRARY: Record<FieldType, FormField> = {
  TEXT: {
    id: "",
    type: "TEXT",
    label: "Text Field",
    placeholder: "Enter text",
    helpText: "",
    required: false,
  },
  TEXTAREA: {
    id: "",
    type: "TEXTAREA",
    label: "Text Area",
    placeholder: "Enter long text",
    helpText: "",
    required: false,
  },
  NUMBER: {
    id: "",
    type: "NUMBER",
    label: "Number Field",
    placeholder: "Enter a number",
    helpText: "",
    required: false,
  },
  DATE: {
    id: "",
    type: "DATE",
    label: "Date Field",
    placeholder: "Select a date",
    helpText: "",
    required: false,
  },
  SELECT: {
    id: "",
    type: "SELECT",
    label: "Dropdown",
    placeholder: "Select an option",
    helpText: "",
    required: false,
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
      { label: "Option 3", value: "option3" },
    ],
  },
  RADIO: {
    id: "",
    type: "RADIO",
    label: "Radio Group",
    helpText: "",
    required: false,
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
      { label: "Option 3", value: "option3" },
    ],
  },
  CHECKBOX: {
    id: "",
    type: "CHECKBOX",
    label: "Checkbox",
    helpText: "",
    required: false,
  },
  CHECKBOXGROUP: {
    id: "",
    type: "CHECKBOXGROUP",
    label: "Checkbox Group",
    helpText: "",
    required: false,
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
      { label: "Option 3", value: "option3" },
    ],
  },
  HIDDEN: {
    id: "",
    type: "HIDDEN",
    label: "Hidden Field",
    defaultValue: "",
  },
  HEADING: {
    id: "",
    type: "HEADING",
    label: "Section Heading",
  },
  PARAGRAPH: {
    id: "",
    type: "PARAGRAPH",
    label: "Paragraph Text",
  },
  DIVIDER: {
    id: "",
    type: "DIVIDER",
    label: "Divider",
  },
  FILE: {
    id: "",
    type: "FILE",
    label: "File Upload",
    helpText: "",
    required: false,
  },
  SIGNATURE: {
    id: "",
    type: "SIGNATURE",
    label: "Signature",
    helpText: "",
    required: false,
  },
  SALES_GRID: {
    id: "",
    type: "SALES_GRID",
    label: "Sales Comparison Grid",
    helpText: "Add comparable properties",
    required: false,
    gridConfig: {
      comparableCount: 3,
      showSubject: true,
      columnLabels: {
        subject: "Subject",
        comparables: ["Comparable 1", "Comparable 2", "Comparable 3"],
      },
      rows: [
        { id: "view", label: "View", type: "text" },
        { id: "condition", label: "Condition", type: "text" },
        { id: "gross_living_area", label: "Gross Living Area", type: "number", guidance: "Enter square footage" },
        { id: "sale_price", label: "Sale Price", type: "currency", guidance: "Enter in dollars" },
        { id: "room_count", label: "Room Count", type: "text" },
        { id: "basement", label: "Basement/Finished Rooms", type: "text" },
        { id: "functional_utility", label: "Functional Utility", type: "text" },
        { id: "heating_cooling", label: "Heating/Cooling", type: "text" },
      ],
      summaryRows: [
        { id: "net_adjustments", label: "Net Adjustments" },
        { id: "adjusted_price", label: "Adjusted Sales Price" },
      ],
    },
  },
}

// Update the field categories to include the SALES_GRID field type
export const FIELD_CATEGORIES = {
  BASIC: ["TEXT", "TEXTAREA", "NUMBER", "DATE", "SELECT", "RADIO", "CHECKBOX", "CHECKBOXGROUP"],
  ADVANCED: ["FILE", "SIGNATURE", "SALES_GRID"],
  LAYOUT: ["HEADING", "PARAGRAPH", "DIVIDER", "HIDDEN"],
}

// Update the field icons to include the SALES_GRID field type
export const FIELD_ICONS: Record<FieldType, string> = {
  TEXT: "text",
  TEXTAREA: "pilcrow",
  NUMBER: "hash",
  DATE: "calendar",
  SELECT: "chevron-down",
  RADIO: "circle-dot",
  CHECKBOX: "check-square",
  CHECKBOXGROUP: "check-square",
  HIDDEN: "eye-off",
  HEADING: "heading",
  PARAGRAPH: "text",
  DIVIDER: "minus",
  FILE: "file",
  SIGNATURE: "pen-tool",
  SALES_GRID: "table",
}

// Update the field labels to include the SALES_GRID field type
export const FIELD_LABELS: Record<FieldType, string> = {
  TEXT: "Text Field",
  TEXTAREA: "Text Area",
  NUMBER: "Number",
  DATE: "Date",
  SELECT: "Dropdown",
  RADIO: "Radio Group",
  CHECKBOX: "Checkbox",
  CHECKBOXGROUP: "Checkbox Group",
  HIDDEN: "Hidden Field",
  HEADING: "Heading",
  PARAGRAPH: "Paragraph",
  DIVIDER: "Divider",
  FILE: "File Upload",
  SIGNATURE: "Signature",
  SALES_GRID: "Sales Grid",
}

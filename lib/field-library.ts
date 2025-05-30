import { v4 as uuidv4 } from "uuid"
import type { FieldType, FormField } from "./form-types"

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

import { FIELD_TYPES as FIELD_TYPES_2 } from "./form-types"

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
 * Field Library - Ready-to-use field configurations for the form builder
 * Each field is pre-configured with all required properties and sensible defaults
 */
/*
export const fieldLibrary = {
  // Text Input Fields
  text: {
    id: "field-text",
    field_type: FIELD_TYPES[0],
    label: "Text Input",
    placeholder: "Enter text",
    help_text: "Standard single-line text input",
    required: false,
    width: "full",
    validation: {},
  },

  textarea: {
    id: "field-textarea",
    field_type: FIELD_TYPES[1],
    label: "Text Area",
    placeholder: "Enter multiple lines of text",
    help_text: "Multi-line text input for longer responses",
    required: false,
    width: "full",
    validation: {},
  },

  email: {
    id: "field-email",
    field_type: "email",
    label: "Email Address",
    placeholder: "name@example.com",
    help_text: "Enter a valid email address",
    required: false,
    width: "full",
    validation: {
      pattern: {
        value: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
        message: "Please enter a valid email address",
      },
    },
  },

  password: {
    id: "field-password",
    field_type: "password",
    label: "Password",
    placeholder: "Enter password",
    help_text: "Enter a secure password",
    required: false,
    width: "full",
    validation: {
      minLength: {
        value: 8,
        message: "Password must be at least 8 characters",
      },
    },
  },

  phone: {
    id: "field-phone",
    field_type: "phone",
    label: "Phone Number",
    placeholder: "(555) 555-5555",
    help_text: "Enter a valid phone number",
    required: false,
    width: "full",
    validation: {
      pattern: {
        value: "^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$",
        message: "Please enter a valid phone number",
      },
    },
  },

  url: {
    id: "field-url",
    field_type: "url",
    label: "Website URL",
    placeholder: "https://example.com",
    help_text: "Enter a valid website URL",
    required: false,
    width: "full",
    validation: {
      pattern: {
        value:
          "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
        message: "Please enter a valid URL",
      },
    },
  },

  // Number Input Fields
  number: {
    id: "field-number",
    field_type: FIELD_TYPES[2],
    label: "Number",
    placeholder: "Enter a number",
    help_text: "Enter a numeric value",
    required: false,
    width: "full",
    validation: {},
  },

  currency: {
    id: "field-currency",
    field_type: "currency",
    label: "Currency Amount",
    placeholder: "$0.00",
    help_text: "Enter a monetary amount",
    required: false,
    width: "full",
    validation: {
      pattern: {
        value: "^\\$?[0-9]+(\\.[0-9]{1,2})?$",
        message: "Please enter a valid currency amount",
      },
    },
  },

  percentage: {
    id: "field-percentage",
    field_type: "percentage",
    label: "Percentage",
    placeholder: "0%",
    help_text: "Enter a percentage value",
    required: false,
    width: "full",
    validation: {
      min: {
        value: 0,
        message: "Percentage cannot be negative",
      },
      max: {
        value: 100,
        message: "Percentage cannot exceed 100%",
      },
    },
  },

  // Selection Input Fields
  select: {
    id: "field-select",
    field_type: FIELD_TYPES[4],
    label: "Select Option",
    placeholder: "Choose an option",
    help_text: "Select one option from the dropdown",
    required: false,
    width: "full",
    options: [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
      { label: "Option 3", value: "option_3" },
    ],
    validation: {},
  },

  multiselect: {
    id: "field-multiselect",
    field_type: "multiselect",
    label: "Multi-Select Options",
    placeholder: "Choose multiple options",
    help_text: "Select one or more options",
    required: false,
    width: "full",
    options: [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
      { label: "Option 3", value: "option_3" },
    ],
    validation: {},
  },

  radio: {
    id: "field-radio",
    field_type: FIELD_TYPES[5],
    label: "Radio Options",
    help_text: "Select one option",
    required: false,
    width: "full",
    options: [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
      { label: "Option 3", value: "option_3" },
    ],
    validation: {},
  },

  checkbox: {
    id: "field-checkbox",
    field_type: FIELD_TYPES[6],
    label: "Checkbox Options",
    help_text: "Select one or more options",
    required: false,
    width: "full",
    options: [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
      { label: "Option 3", value: "option_3" },
    ],
    validation: {},
  },

  toggle: {
    id: "field-toggle",
    field_type: "toggle",
    label: "Toggle Switch",
    help_text: "Turn this option on or off",
    required: false,
    width: "full",
    validation: {},
  },

  // Date/Time Input Fields
  date: {
    id: "field-date",
    field_type: FIELD_TYPES[3],
    label: "Date",
    placeholder: "MM/DD/YYYY",
    help_text: "Select a date",
    required: false,
    width: "full",
    validation: {},
  },

  datetime: {
    id: "field-datetime",
    field_type: "datetime",
    label: "Date & Time",
    placeholder: "MM/DD/YYYY HH:MM",
    help_text: "Select a date and time",
    required: false,
    width: "full",
    validation: {},
  },

  time: {
    id: "field-time",
    field_type: "time",
    label: "Time",
    placeholder: "HH:MM",
    help_text: "Select a time",
    required: false,
    width: "full",
    validation: {},
  },

  // File Input Fields
  file: {
    id: "field-file",
    field_type: FIELD_TYPES[11],
    label: "File Upload",
    help_text: "Upload a file",
    required: false,
    width: "full",
    validation: {
      fileTypes: {
        value: ".pdf,.doc,.docx,.xls,.xlsx",
        message: "Allowed file types: PDF, Word, Excel",
      },
      maxSize: {
        value: "10MB",
        message: "Maximum file size: 10MB",
      },
    },
  },

  image: {
    id: "field-image",
    field_type: "image",
    label: "Image Upload",
    help_text: "Upload an image",
    required: false,
    width: "full",
    validation: {
      fileTypes: {
        value: ".jpg,.jpeg,.png,.gif",
        message: "Allowed file types: JPG, PNG, GIF",
      },
      maxSize: {
        value: "5MB",
        message: "Maximum file size: 5MB",
      },
    },
  },

  signature: {
    id: "field-signature",
    field_type: FIELD_TYPES[12],
    label: "Signature",
    help_text: "Draw your signature",
    required: false,
    width: "full",
    validation: {},
  },

  // Interactive Input Fields
  rating: {
    id: "field-rating",
    field_type: "rating",
    label: "Rating",
    help_text: "Rate from 1 to 5 stars",
    required: false,
    width: "full",
    validation: {
      max: {
        value: 5,
        message: "Maximum rating: 5 stars",
      },
    },
  },

  slider: {
    id: "field-slider",
    field_type: "slider",
    label: "Slider",
    help_text: "Drag the slider to select a value",
    required: false,
    width: "full",
    validation: {
      min: {
        value: 0,
        message: "Minimum value: 0",
      },
      max: {
        value: 100,
        message: "Maximum value: 100",
      },
    },
  },

  matrix: {
    id: "field-matrix",
    field_type: "matrix",
    label: "Matrix Grid",
    help_text: "Select an option for each row",
    required: false,
    width: "full",
    options: [
      { type: "row", label: "Row 1", value: "row_1" },
      { type: "row", label: "Row 2", value: "row_2" },
      { type: "row", label: "Row 3", value: "row_3" },
      { type: "column", label: "Poor", value: "poor" },
      { type: "column", label: "Average", value: "average" },
      { type: "column", label: "Good", value: "good" },
      { type: "column", label: "Excellent", value: "excellent" },
    ],
    validation: {},
  },

  // Location Input Fields
  address: {
    id: "field-address",
    field_type: "address",
    label: "Address",
    placeholder: "Enter address",
    help_text: "Enter a complete address",
    required: false,
    width: "full",
    validation: {},
    metadata: {
      autocomplete: true,
      components: ["street", "city", "state", "zip"],
    },
  },

  location: {
    id: "field-location",
    field_type: "location",
    label: "Location",
    help_text: "Select a location on the map",
    required: false,
    width: "full",
    validation: {},
  },

  // Calculated/Dynamic Fields
  calculated: {
    id: "field-calculated",
    field_type: "calculated",
    label: "Calculated Field",
    help_text: "This value is automatically calculated",
    required: false,
    width: "full",
    calculated_config: {
      enabled: true,
      formula: "{field1} + {field2}",
      dependencies: ["field1", "field2"],
      outputFormat: "number",
      precision: 2,
    },
    validation: {},
  },

  lookup: {
    id: "field-lookup",
    field_type: "lookup",
    label: "Lookup Field",
    help_text: "This value is looked up from another source",
    required: false,
    width: "full",
    lookup_config: {
      enabled: true,
      dataSource: "api",
      endpoint: "/api/lookup",
      keyField: "id",
      valueField: "name",
    },
    validation: {},
  },

  hidden: {
    id: "field-hidden",
    field_type: FIELD_TYPES[8],
    label: "Hidden Field",
    help_text: "This field is not visible to users",
    required: false,
    width: "full",
    validation: {},
  },

  // Layout Elements
  section_break: {
    id: "field-section-break",
    field_type: "section_break",
    label: "Section Break",
    help_text: "Visual separator between sections",
    width: "full",
  },

  page_break: {
    id: "field-page-break",
    field_type: "page_break",
    label: "Page Break",
    help_text: "Start a new page",
    width: "full",
  },

  html_content: {
    id: "field-html-content",
    field_type: "html_content",
    label: "HTML Content",
    help_text: "Custom HTML content",
    width: "full",
    metadata: {
      content:
        "<p>This is custom HTML content. You can add <strong>formatted text</strong>, <a href='#'>links</a>, and more.</p>",
    },
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
        comparables: ["Comparable 1", "Comparable 2", "Comparable 3"]
      },
      rows: [
        { id: "view", label: "View", type: "text" },
        { id: "condition", label: "Condition", type: "text" },
        { id: "gross_living_area", label: "Gross Living Area", type: "number", guidance: "Enter square footage" },
        { id: "sale_price", label: "Sale Price", type: "currency", guidance: "Enter in dollars" },
        { id: "room_count", label: "Room Count", type: "text" },
        { id: "basement", label: "Basement/Finished Rooms", type: "text" },
        { id: "functional_utility", label: "Functional Utility", type: "text" },
        { id: "heating_cooling", label: "Heating/Cooling", type: "text" }
      ],
      summaryRows: [
        { id: "net_adjustments", label: "Net Adjustments" },
        { id: "adjusted_price", label: "Adjusted Sales Price" }
      ]
    }
  },
}
*/

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

import { v4 as uuidv4 } from "uuid"
import { FIELD_TYPES } from "./form-types"

/**
 * Field Library - Ready-to-use field configurations for the form builder
 * Each field is pre-configured with all required properties and sensible defaults
 */
export const fieldLibrary = {
  // Text Input Fields
  text: {
    id: "field-text",
    field_type: FIELD_TYPES.TEXT,
    label: "Text Input",
    placeholder: "Enter text",
    help_text: "Standard single-line text input",
    required: false,
    width: "full",
    validation: {},
  },

  textarea: {
    id: "field-textarea",
    field_type: FIELD_TYPES.TEXTAREA,
    label: "Text Area",
    placeholder: "Enter multiple lines of text",
    help_text: "Multi-line text input for longer responses",
    required: false,
    width: "full",
    validation: {},
  },

  email: {
    id: "field-email",
    field_type: FIELD_TYPES.EMAIL,
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
    field_type: FIELD_TYPES.PASSWORD,
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
    field_type: FIELD_TYPES.PHONE,
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
    field_type: FIELD_TYPES.URL,
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
    field_type: FIELD_TYPES.NUMBER,
    label: "Number",
    placeholder: "Enter a number",
    help_text: "Enter a numeric value",
    required: false,
    width: "full",
    validation: {},
  },

  currency: {
    id: "field-currency",
    field_type: FIELD_TYPES.CURRENCY,
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
    field_type: FIELD_TYPES.PERCENTAGE,
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
    field_type: FIELD_TYPES.SELECT,
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
    field_type: FIELD_TYPES.MULTISELECT,
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
    field_type: FIELD_TYPES.RADIO,
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
    field_type: FIELD_TYPES.CHECKBOX,
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
    field_type: FIELD_TYPES.TOGGLE,
    label: "Toggle Switch",
    help_text: "Turn this option on or off",
    required: false,
    width: "full",
    validation: {},
  },

  // Date/Time Input Fields
  date: {
    id: "field-date",
    field_type: FIELD_TYPES.DATE,
    label: "Date",
    placeholder: "MM/DD/YYYY",
    help_text: "Select a date",
    required: false,
    width: "full",
    validation: {},
  },

  datetime: {
    id: "field-datetime",
    field_type: FIELD_TYPES.DATETIME,
    label: "Date & Time",
    placeholder: "MM/DD/YYYY HH:MM",
    help_text: "Select a date and time",
    required: false,
    width: "full",
    validation: {},
  },

  time: {
    id: "field-time",
    field_type: FIELD_TYPES.TIME,
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
    field_type: FIELD_TYPES.FILE,
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
    field_type: FIELD_TYPES.IMAGE,
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
    field_type: FIELD_TYPES.SIGNATURE,
    label: "Signature",
    help_text: "Draw your signature",
    required: false,
    width: "full",
    validation: {},
  },

  // Interactive Input Fields
  rating: {
    id: "field-rating",
    field_type: FIELD_TYPES.RATING,
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
    field_type: FIELD_TYPES.SLIDER,
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
    field_type: FIELD_TYPES.MATRIX,
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
    field_type: FIELD_TYPES.ADDRESS,
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
    field_type: FIELD_TYPES.LOCATION,
    label: "Location",
    help_text: "Select a location on the map",
    required: false,
    width: "full",
    validation: {},
  },

  // Calculated/Dynamic Fields
  calculated: {
    id: "field-calculated",
    field_type: FIELD_TYPES.CALCULATED,
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
    field_type: FIELD_TYPES.LOOKUP,
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
    field_type: FIELD_TYPES.HIDDEN,
    label: "Hidden Field",
    help_text: "This field is not visible to users",
    required: false,
    width: "full",
    validation: {},
  },

  // Layout Elements
  section_break: {
    id: "field-section-break",
    field_type: FIELD_TYPES.SECTION_BREAK,
    label: "Section Break",
    help_text: "Visual separator between sections",
    width: "full",
  },

  page_break: {
    id: "field-page-break",
    field_type: FIELD_TYPES.PAGE_BREAK,
    label: "Page Break",
    help_text: "Start a new page",
    width: "full",
  },

  html_content: {
    id: "field-html-content",
    field_type: FIELD_TYPES.HTML_CONTENT,
    label: "HTML Content",
    help_text: "Custom HTML content",
    width: "full",
    metadata: {
      content:
        "<p>This is custom HTML content. You can add <strong>formatted text</strong>, <a href='#'>links</a>, and more.</p>",
    },
  },
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
    interactive: ["rating", "slider", "matrix"],
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

import type { LucideIcon } from "lucide-react"
import { Type, AlignLeft, List, CheckSquare, Calendar, Hash, Upload, Grid3X3, Globe, Eye, Minus } from "lucide-react"

export const FIELD_TYPES = {
  // Basic Fields
  TEXT: "text",
  TEXTAREA: "textarea",
  NUMBER: "number",
  CHECKBOX: "checkbox",
  RADIO: "radio",
  SELECT: "select",
  DATE: "date",
  TIME: "time",
  EMAIL: "email",
  PHONE: "phone",
  URL: "url",
  PASSWORD: "password",
  FILE: "file",
  HIDDEN: "hidden",

  // Layout Fields
  HEADING: "heading",
  PARAGRAPH: "paragraph",
  DIVIDER: "divider",
  SPACER: "spacer",

  // Advanced Fields
  SALES_GRID: "sales_grid",
} as const

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES]

export const FIELD_CATEGORIES = {
  BASIC: "Basic",
  LAYOUT: "Layout",
  ADVANCED: "Advanced",
}

export const CATEGORIZED_FIELDS = {
  [FIELD_CATEGORIES.BASIC]: [
    FIELD_TYPES.TEXT,
    FIELD_TYPES.TEXTAREA,
    FIELD_TYPES.NUMBER,
    FIELD_TYPES.CHECKBOX,
    FIELD_TYPES.RADIO,
    FIELD_TYPES.SELECT,
    FIELD_TYPES.DATE,
    FIELD_TYPES.TIME,
    FIELD_TYPES.EMAIL,
    FIELD_TYPES.PHONE,
  ],
  [FIELD_CATEGORIES.LAYOUT]: [FIELD_TYPES.HEADING, FIELD_TYPES.PARAGRAPH, FIELD_TYPES.DIVIDER, FIELD_TYPES.SPACER],
  [FIELD_CATEGORIES.ADVANCED]: [
    FIELD_TYPES.SALES_GRID,
    FIELD_TYPES.FILE,
    FIELD_TYPES.URL,
    FIELD_TYPES.PASSWORD,
    FIELD_TYPES.HIDDEN,
  ],
}

// Field type configurations with icons and metadata
export const FIELD_TYPE_CONFIG: Record<
  (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES],
  {
    label: string
    icon: LucideIcon
    category: "input" | "selection" | "date" | "file" | "interactive" | "location" | "calculated" | "layout"
    description: string
    supportsValidation: boolean
    supportsOptions: boolean
    supportsCalculation: boolean
    supportsLookup: boolean
  }
> = {
  [FIELD_TYPES.TEXT]: {
    label: "Text",
    icon: Type,
    category: "input",
    description: "Single line text input",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: true,
  },
  [FIELD_TYPES.TEXTAREA]: {
    label: "Textarea",
    icon: AlignLeft,
    category: "input",
    description: "Multi-line text input",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.EMAIL]: {
    label: "Email",
    icon: Type,
    category: "input",
    description: "Email address input with validation",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.PASSWORD]: {
    label: "Password",
    icon: Eye,
    category: "input",
    description: "Password input field",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.PHONE]: {
    label: "Phone",
    icon: Type,
    category: "input",
    description: "Phone number input with formatting",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.URL]: {
    label: "URL",
    icon: Globe,
    category: "input",
    description: "Website URL input",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.NUMBER]: {
    label: "Number",
    icon: Hash,
    category: "input",
    description: "Numeric input field",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: true,
    supportsLookup: true,
  },
  [FIELD_TYPES.CHECKBOX]: {
    label: "Checkbox",
    icon: CheckSquare,
    category: "selection",
    description: "Multiple choice checkboxes",
    supportsValidation: true,
    supportsOptions: true,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.RADIO]: {
    label: "Radio",
    icon: CheckSquare,
    category: "selection",
    description: "Single choice radio buttons",
    supportsValidation: true,
    supportsOptions: true,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.SELECT]: {
    label: "Select",
    icon: List,
    category: "selection",
    description: "Dropdown selection",
    supportsValidation: true,
    supportsOptions: true,
    supportsCalculation: false,
    supportsLookup: true,
  },
  [FIELD_TYPES.DATE]: {
    label: "Date",
    icon: Calendar,
    category: "date",
    description: "Date picker",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: true,
    supportsLookup: false,
  },
  [FIELD_TYPES.TIME]: {
    label: "Time",
    icon: Calendar,
    category: "date",
    description: "Time picker",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.FILE]: {
    label: "File Upload",
    icon: Upload,
    category: "file",
    description: "File upload field",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.HIDDEN]: {
    label: "Hidden",
    icon: Eye,
    category: "calculated",
    description: "Hidden field for data storage",
    supportsValidation: false,
    supportsOptions: false,
    supportsCalculation: true,
    supportsLookup: true,
  },
  [FIELD_TYPES.HEADING]: {
    label: "Heading",
    icon: Type,
    category: "layout",
    description: "Section heading",
    supportsValidation: false,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.PARAGRAPH]: {
    label: "Paragraph",
    icon: AlignLeft,
    category: "layout",
    description: "Paragraph of text",
    supportsValidation: false,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.DIVIDER]: {
    label: "Divider",
    icon: Minus,
    category: "layout",
    description: "Visual divider line",
    supportsValidation: false,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.SPACER]: {
    label: "Spacer",
    icon: Minus,
    category: "layout",
    description: "Empty space",
    supportsValidation: false,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.SALES_GRID]: {
    label: "Sales Grid",
    icon: Grid3X3,
    category: "interactive",
    description: "Configurable data grid for comparable sales",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
}

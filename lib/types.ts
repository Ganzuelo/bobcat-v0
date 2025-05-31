import { z } from "zod"
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

// Field width options
export const FIELD_WIDTHS = {
  QUARTER: "quarter",
  HALF: "half",
  THREE_QUARTERS: "three_quarters",
  FULL: "full",
} as const

export type FieldWidth = (typeof FIELD_WIDTHS)[keyof typeof FIELD_WIDTHS]

export const FIELD_WIDTH_CONFIG: Record<
  FieldWidth,
  {
    label: string
    percentage: string
    gridCols: string
  }
> = {
  [FIELD_WIDTHS.QUARTER]: {
    label: "1/4 Width",
    percentage: "25%",
    gridCols: "col-span-3",
  },
  [FIELD_WIDTHS.HALF]: {
    label: "1/2 Width",
    percentage: "50%",
    gridCols: "col-span-6",
  },
  [FIELD_WIDTHS.THREE_QUARTERS]: {
    label: "3/4 Width",
    percentage: "75%",
    gridCols: "col-span-9",
  },
  [FIELD_WIDTHS.FULL]: {
    label: "Full Width",
    percentage: "100%",
    gridCols: "col-span-12",
  },
}

// URAR/MISMO compliance metadata
export const URAR_CARDINALITY = {
  REQUIRED: "required",
  OPTIONAL: "optional",
  CONDITIONAL: "conditional",
  NOT_APPLICABLE: "not_applicable",
} as const

export type UrarCardinality = (typeof URAR_CARDINALITY)[keyof typeof URAR_CARDINALITY]

export const URAR_CONDITIONALITY = {
  ALWAYS: "always",
  CONDITIONAL: "conditional",
  NEVER: "never",
} as const

export type UrarConditionality = (typeof URAR_CONDITIONALITY)[keyof typeof URAR_CONDITIONALITY]

export const URAR_OUTPUT_FORMAT = {
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
  CURRENCY: "currency",
  PERCENTAGE: "percentage",
  BOOLEAN: "boolean",
  LIST: "list",
} as const

export type UrarOutputFormat = (typeof URAR_OUTPUT_FORMAT)[keyof typeof URAR_OUTPUT_FORMAT]

// Carryforward configuration
export const CARRYFORWARD_MODES = {
  DEFAULT: "default",
  MIRROR: "mirror",
} as const

export type CarryforwardMode = (typeof CARRYFORWARD_MODES)[keyof typeof CARRYFORWARD_MODES]

export const CarryforwardConfigSchema = z.object({
  enabled: z.boolean().default(false),
  source: z.string().optional(), // Field ID to copy from
  mode: z.nativeEnum(CARRYFORWARD_MODES).default(CARRYFORWARD_MODES.DEFAULT),
})

export interface CarryforwardConfig extends z.infer<typeof CarryforwardConfigSchema> {}

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9][\d]{0,15}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  SSN: /^\d{3}-?\d{2}-?\d{4}$/,
  CURRENCY: /^\$?[\d,]+(\.\d{2})?$/,
  PERCENTAGE: /^\d{1,3}(\.\d{1,2})?%?$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA_ONLY: /^[a-zA-Z\s]+$/,
  NUMERIC_ONLY: /^\d+$/,
} as const

// Zod validation schemas
export const FieldOptionSchema = z.object({
  label: z.string().min(1, "Option label is required"),
  value: z.string().min(1, "Option value is required"),
  disabled: z.boolean().optional().default(false),
  metadata: z.record(z.any()).optional(),
})

export const ValidationRuleSchema = z.object({
  type: z.enum(["required", "min", "max", "minLength", "maxLength", "pattern", "custom"]),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  message: z.string().optional(),
  pattern: z.string().optional(),
  customFunction: z.string().optional(),
})

export const ConditionalVisibilitySchema = z.object({
  enabled: z.boolean().default(false),
  conditions: z
    .array(
      z.object({
        fieldId: z.string(),
        operator: z.enum([
          "equals",
          "not_equals",
          "contains",
          "not_contains",
          "greater_than",
          "less_than",
          "is_empty",
          "is_not_empty",
        ]),
        value: z.union([z.string(), z.number(), z.boolean()]).optional(),
        logicalOperator: z.enum(["AND", "OR"]).optional(),
      }),
    )
    .optional(),
})

export const CalculatedConfigSchema = z.object({
  enabled: z.boolean().default(false),
  formula: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  outputFormat: z.nativeEnum(URAR_OUTPUT_FORMAT).optional(),
  precision: z.number().min(0).max(10).optional(),
})

export const LookupConfigSchema = z.object({
  enabled: z.boolean().default(false),
  dataSource: z.enum(["api", "database", "static"]),
  endpoint: z.string().optional(),
  table: z.string().optional(),
  keyField: z.string().optional(),
  valueField: z.string().optional(),
  filters: z.record(z.any()).optional(),
  cacheTimeout: z.number().optional(),
})

// Prefill configuration schema
export const PrefillConfigSchema = z.object({
  enabled: z.boolean().default(false),
  source: z.enum(["api", "internal", "lookup"]),
  key: z.string().optional(),
  endpoint: z.string().optional(),
  fieldMap: z.record(z.string()).optional(),
  fallbackValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  cacheTimeout: z.number().optional().default(300),
  retryAttempts: z.number().optional().default(3),
})

export const FormFieldMetadataSchema = z.object({
  // UAD 3.6 compliance field
  uad_field_id: z.string().optional(),

  // URAR/MISMO compliance fields
  reportFieldId: z.string().optional(),
  mismoFieldId: z.string().optional(),
  mismo_path: z.string().optional(),
  cardinality: z.nativeEnum(URAR_CARDINALITY).optional(),
  conditionality: z.nativeEnum(URAR_CONDITIONALITY).optional(),
  outputFormat: z.nativeEnum(URAR_OUTPUT_FORMAT).optional(),
  category: z.string().optional(),
  xml: z
    .object({
      fieldId: z.string().optional(),
      required: z.boolean().optional(),
      format: z.string().optional(),
    })
    .optional(),
})

export interface FormFieldMetadata extends z.infer<typeof FormFieldMetadataSchema> {}

export const SampleFormValues = {
  subject_property_address: {
    field_type: FIELD_TYPES.TEXT,
    label: "Subject Property Address",
    required: true,
    metadata: {
      uad_field_id: "3.001",
      reportFieldId: "1007",
      mismoFieldId: "SubjectPropertyAddress",
      mismo_path: "COLLATERALS/COLLATERAL/SubjectProperty/Address",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.TEXT,
      category: "Property Information",
      xml: {
        fieldId: "SubjectPropertyAddress",
        required: true,
        format: "text",
      },
    },
  },
  property_value: {
    field_type: FIELD_TYPES.CURRENCY,
    label: "Property Value",
    required: true,
    metadata: {
      uad_field_id: "3.002",
      reportFieldId: "1008",
      mismoFieldId: "PropertyValue",
      mismo_path: "COLLATERALS/COLLATERAL/VALUATION/PropertyValue",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.CURRENCY,
      category: "Valuation",
      xml: {
        fieldId: "PropertyValue",
        required: true,
        format: "currency",
      },
    },
  },
  loan_amount: {
    field_type: FIELD_TYPES.CURRENCY,
    label: "Loan Amount",
    required: true,
    metadata: {
      uad_field_id: "3.003",
      reportFieldId: "1009",
      mismoFieldId: "LoanAmount",
      mismo_path: "LOAN/LoanAmount",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.CURRENCY,
      category: "Loan Information",
      xml: {
        fieldId: "LoanAmount",
        required: true,
        format: "currency",
      },
    },
  },
  borrower_name: {
    field_type: FIELD_TYPES.TEXT,
    label: "Borrower Name",
    required: true,
    metadata: {
      uad_field_id: "3.004",
      reportFieldId: "1010",
      mismoFieldId: "BorrowerName",
      mismo_path: "BORROWER/Name",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.TEXT,
      category: "Borrower Information",
      xml: {
        fieldId: "BorrowerName",
        required: true,
        format: "text",
      },
    },
  },
  appraiser_name: {
    field_type: FIELD_TYPES.TEXT,
    label: "Appraiser Name",
    required: true,
    metadata: {
      uad_field_id: "3.005",
      reportFieldId: "1011",
      mismoFieldId: "AppraiserName",
      mismo_path: "APPRAISER/Name",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.TEXT,
      category: "Appraiser Information",
      xml: {
        fieldId: "AppraiserName",
        required: true,
        format: "text",
      },
    },
  },
  appraisal_date: {
    field_type: FIELD_TYPES.DATE,
    label: "Appraisal Date",
    required: true,
    metadata: {
      uad_field_id: "3.006",
      reportFieldId: "1012",
      mismoFieldId: "AppraisalDate",
      mismo_path: "APPRAISAL/AppraisalDate",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.DATE,
      category: "Appraisal Information",
      xml: {
        fieldId: "AppraisalDate",
        required: true,
        format: "date",
      },
    },
  },
}

import { z } from "zod"
import type { LucideIcon } from "lucide-react"
import {
  Type,
  AlignLeft,
  List,
  CheckSquare,
  Calendar,
  Hash,
  Upload,
  PenTool,
  ImageIcon,
  Calculator,
  Search,
  ToggleLeft,
  Star,
  Sliders,
  Grid3X3,
  MapPin,
  Globe,
  Eye,
  Minus,
  FileText,
  Code,
} from "lucide-react"

// Base field types
export const FIELD_TYPES = {
  // Text inputs
  TEXT: "text",
  TEXTAREA: "textarea",
  EMAIL: "email",
  PASSWORD: "password",
  PHONE: "phone",
  URL: "url",

  // Number inputs
  NUMBER: "number",
  CURRENCY: "currency",
  PERCENTAGE: "percentage",

  // Selection inputs
  SELECT: "select",
  MULTISELECT: "multiselect",
  RADIO: "radio",
  CHECKBOX: "checkbox",
  TOGGLE: "toggle",

  // Date/time inputs
  DATE: "date",
  DATETIME: "datetime",
  TIME: "time",

  // File inputs
  FILE: "file",
  IMAGE: "image",
  SIGNATURE: "signature",

  // Interactive inputs
  RATING: "rating",
  SLIDER: "slider",
  MATRIX: "matrix",

  // Location inputs
  ADDRESS: "address",
  LOCATION: "location",

  // Calculated/dynamic fields
  CALCULATED: "calculated",
  LOOKUP: "lookup",
  HIDDEN: "hidden",

  // Layout elements
  SECTION_BREAK: "section_break",
  PAGE_BREAK: "page_break",
  HTML_CONTENT: "html_content",
} as const

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES]

// Field type configurations with icons and metadata
export const FIELD_TYPE_CONFIG: Record<
  FieldType,
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
  [FIELD_TYPES.CURRENCY]: {
    label: "Currency",
    icon: Hash,
    category: "input",
    description: "Currency amount input",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: true,
    supportsLookup: true,
  },
  [FIELD_TYPES.PERCENTAGE]: {
    label: "Percentage",
    icon: Hash,
    category: "input",
    description: "Percentage value input",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: true,
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
  [FIELD_TYPES.MULTISELECT]: {
    label: "Multi-Select",
    icon: List,
    category: "selection",
    description: "Multiple option selection",
    supportsValidation: true,
    supportsOptions: true,
    supportsCalculation: false,
    supportsLookup: true,
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
  [FIELD_TYPES.TOGGLE]: {
    label: "Toggle",
    icon: ToggleLeft,
    category: "selection",
    description: "On/off toggle switch",
    supportsValidation: false,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
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
  [FIELD_TYPES.DATETIME]: {
    label: "Date & Time",
    icon: Calendar,
    category: "date",
    description: "Date and time picker",
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
  [FIELD_TYPES.IMAGE]: {
    label: "Image Upload",
    icon: ImageIcon,
    category: "file",
    description: "Image upload with preview",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.SIGNATURE]: {
    label: "Signature",
    icon: PenTool,
    category: "file",
    description: "Digital signature capture",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.RATING]: {
    label: "Rating",
    icon: Star,
    category: "interactive",
    description: "Star rating input",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: true,
    supportsLookup: false,
  },
  [FIELD_TYPES.SLIDER]: {
    label: "Slider",
    icon: Sliders,
    category: "interactive",
    description: "Range slider input",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: true,
    supportsLookup: false,
  },
  [FIELD_TYPES.MATRIX]: {
    label: "Matrix",
    icon: Grid3X3,
    category: "interactive",
    description: "Matrix/grid of options",
    supportsValidation: true,
    supportsOptions: true,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.ADDRESS]: {
    label: "Address",
    icon: MapPin,
    category: "location",
    description: "Address input with autocomplete",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: true,
  },
  [FIELD_TYPES.LOCATION]: {
    label: "Location",
    icon: MapPin,
    category: "location",
    description: "GPS coordinates picker",
    supportsValidation: true,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.CALCULATED]: {
    label: "Calculated",
    icon: Calculator,
    category: "calculated",
    description: "Auto-calculated field",
    supportsValidation: false,
    supportsOptions: false,
    supportsCalculation: true,
    supportsLookup: false,
  },
  [FIELD_TYPES.LOOKUP]: {
    label: "Lookup",
    icon: Search,
    category: "calculated",
    description: "Data lookup field",
    supportsValidation: false,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: true,
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
  [FIELD_TYPES.SECTION_BREAK]: {
    label: "Section Break",
    icon: Minus,
    category: "layout",
    description: "Visual section separator",
    supportsValidation: false,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.PAGE_BREAK]: {
    label: "Page Break",
    icon: FileText,
    category: "layout",
    description: "Page separator for multi-page forms",
    supportsValidation: false,
    supportsOptions: false,
    supportsCalculation: false,
    supportsLookup: false,
  },
  [FIELD_TYPES.HTML_CONTENT]: {
    label: "HTML Content",
    icon: Code,
    category: "layout",
    description: "Custom HTML content block",
    supportsValidation: false,
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

  // XML configuration
  xml: z
    .object({
      fieldId: z.string().optional(),
      path: z.string().optional(),
      required: z.boolean().optional(),
      format: z.string().optional(),
    })
    .optional(),

  // Field categorization
  category: z.string().optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dataType: z.string().optional(),
  unit: z.string().optional(),

  // Documentation
  documentation: z.string().optional(),
  examples: z.array(z.string()).optional(),
  notes: z.string().optional(),

  // Compliance tracking
  lastReviewed: z.string().optional(),
  reviewedBy: z.string().optional(),
  complianceVersion: z.string().optional(),

  // Custom metadata
  custom: z.record(z.any()).optional(),
})

// Fixed: Use a single schema instead of discriminated union with extend
export const FormFieldSchema = z.object({
  id: z.string().uuid(),
  section_id: z.string().uuid(),
  field_type: z.nativeEnum(FIELD_TYPES),
  label: z.string().min(1, "Field label is required"),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  guidance: z.string().optional(),
  required: z.boolean().default(false),
  width: z.nativeEnum(FIELD_WIDTHS).default(FIELD_WIDTHS.FULL),
  field_order: z.number().min(0),

  // Field configuration
  options: z.array(FieldOptionSchema).optional(),
  validation: z.array(ValidationRuleSchema).optional(),
  conditional_visibility: ConditionalVisibilitySchema.optional(),
  calculated_config: CalculatedConfigSchema.optional(),
  lookup_config: LookupConfigSchema.optional(),
  prefill_config: PrefillConfigSchema.optional(),
  carryforward_config: CarryforwardConfigSchema.optional(),
  metadata: FormFieldMetadataSchema.optional(),

  // Timestamps
  created_at: z.string(),
  updated_at: z.string(),
})

export const FormSectionSchema = z.object({
  id: z.string().uuid(),
  page_id: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  section_order: z.number().min(0),
  settings: z
    .object({
      collapsible: z.boolean().optional(),
      collapsed: z.boolean().optional(),
      columns: z.number().min(1).max(12).optional(),
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      padding: z.string().optional(),
      margin: z.string().optional(),
    })
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const FormPageSchema = z.object({
  id: z.string().uuid(),
  form_id: z.string().uuid(),
  title: z.string().min(1, "Page title is required"),
  description: z.string().optional(),
  page_order: z.number().min(0),
  settings: z
    .object({
      showProgressBar: z.boolean().optional(),
      allowBack: z.boolean().optional(),
      allowSkip: z.boolean().optional(),
      backgroundColor: z.string().optional(),
      headerImage: z.string().optional(),
      customCSS: z.string().optional(),
    })
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Extended interfaces with populated relationships
export interface FormField extends z.infer<typeof FormFieldSchema> {}

export interface FormSection extends z.infer<typeof FormSectionSchema> {
  fields?: FormField[]
}

export interface FormPage extends z.infer<typeof FormPageSchema> {
  sections?: FormSection[]
}

export interface FormFieldMetadata extends z.infer<typeof FormFieldMetadataSchema> {}

export interface ValidationRule extends z.infer<typeof ValidationRuleSchema> {}

export interface ConditionalVisibility extends z.infer<typeof ConditionalVisibilitySchema> {}

export interface CalculatedConfig extends z.infer<typeof CalculatedConfigSchema> {}

export interface LookupConfig extends z.infer<typeof LookupConfigSchema> {}

export interface PrefillConfig extends z.infer<typeof PrefillConfigSchema> {}

export interface FieldOption extends z.infer<typeof FieldOptionSchema> {}

// Form builder utility types
export type FieldCategory = (typeof FIELD_TYPE_CONFIG)[FieldType]["category"]

export interface FieldTypeGroup {
  category: FieldCategory
  label: string
  fields: {
    type: FieldType
    config: (typeof FIELD_TYPE_CONFIG)[FieldType]
  }[]
}

// Helper functions for field type management
export const getFieldTypesByCategory = (): FieldTypeGroup[] => {
  const categories: Record<FieldCategory, FieldTypeGroup> = {
    input: { category: "input", label: "Text Inputs", fields: [] },
    selection: { category: "selection", label: "Selection", fields: [] },
    date: { category: "date", label: "Date & Time", fields: [] },
    file: { category: "file", label: "File Upload", fields: [] },
    interactive: { category: "interactive", label: "Interactive", fields: [] },
    location: { category: "location", label: "Location", fields: [] },
    calculated: { category: "calculated", label: "Calculated", fields: [] },
    layout: { category: "layout", label: "Layout", fields: [] },
  }

  Object.entries(FIELD_TYPE_CONFIG).forEach(([type, config]) => {
    categories[config.category].fields.push({
      type: type as FieldType,
      config,
    })
  })

  return Object.values(categories)
}

export const getFieldTypeConfig = (type: FieldType) => {
  return FIELD_TYPE_CONFIG[type]
}

export const validateFieldData = (field: Partial<FormField>) => {
  return FormFieldSchema.safeParse(field)
}

export const createDefaultField = (
  type: FieldType,
  sectionId: string,
  order: number,
): Omit<FormField, "id" | "created_at" | "updated_at"> => {
  const config = getFieldTypeConfig(type)

  return {
    section_id: sectionId,
    field_type: type,
    label: `New ${config.label} Field`,
    required: false,
    width: FIELD_WIDTHS.FULL,
    field_order: order,
    options: config.supportsOptions ? [] : undefined,
    validation: [],
    conditional_visibility: { enabled: false },
    calculated_config: config.supportsCalculation ? { enabled: false } : undefined,
    lookup_config: config.supportsLookup ? { enabled: false, dataSource: "static" } : undefined,
    prefill_config: { enabled: false, source: "internal" },
    carryforward_config: { enabled: false, mode: CARRYFORWARD_MODES.DEFAULT },
    metadata: {},
  }
}

// URAR-specific field templates with UAD Field IDs
export const URAR_FIELD_TEMPLATES: Record<string, Partial<FormField>> = {
  property_address: {
    field_type: FIELD_TYPES.ADDRESS,
    label: "Property Address",
    required: true,
    metadata: {
      uad_field_id: "3.001",
      reportFieldId: "1004",
      mismoFieldId: "SubjectPropertyAddress",
      mismo_path: "COLLATERALS/COLLATERAL/SUBJECT_PROPERTY/ADDRESS",
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

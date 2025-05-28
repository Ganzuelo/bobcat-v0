// Validation operators for conditional logic
export const VALIDATION_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does Not Contain" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
]

// Logical operators for combining conditions
export const LOGICAL_OPERATORS = [
  { value: "AND", label: "AND" },
  { value: "OR", label: "OR" },
]

// URAR cardinality options
export const CARDINALITY_OPTIONS = [
  { value: "required", label: "Required" },
  { value: "optional", label: "Optional" },
  { value: "conditional", label: "Conditional" },
  { value: "not_applicable", label: "Not Applicable" },
]

// URAR conditionality options
export const CONDITIONALITY_OPTIONS = [
  { value: "always", label: "Always" },
  { value: "conditional", label: "Conditional" },
  { value: "never", label: "Never" },
]

// Output format options
export const OUTPUT_FORMAT_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "currency", label: "Currency" },
  { value: "percentage", label: "Percentage" },
  { value: "boolean", label: "Boolean" },
  { value: "list", label: "List" },
]

// Data sources for lookup fields
export const DATA_SOURCES = [
  { value: "static", label: "Static Options" },
  { value: "api", label: "API Endpoint" },
  { value: "database", label: "Database Table" },
]

// URAR categories
export const URAR_CATEGORIES = [
  { value: "property_information", label: "Property Information" },
  { value: "borrower_information", label: "Borrower Information" },
  { value: "loan_information", label: "Loan Information" },
  { value: "appraiser_information", label: "Appraiser Information" },
  { value: "appraisal_information", label: "Appraisal Information" },
  { value: "valuation", label: "Valuation" },
  { value: "market_analysis", label: "Market Analysis" },
  { value: "property_description", label: "Property Description" },
  { value: "improvements", label: "Improvements" },
  { value: "site_information", label: "Site Information" },
]

// Form types
export const FORM_TYPES = [
  { value: "custom", label: "Custom Form" },
  { value: "urar", label: "URAR Report" },
  { value: "inspection", label: "Property Inspection" },
  { value: "appraisal", label: "Appraisal Form" },
  { value: "survey", label: "Survey Form" },
]

// Form statuses
export const FORM_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
]

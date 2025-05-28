// Define width configuration types
export type FieldWidthKey = "one_quarter" | "one_third" | "one_half" | "two_thirds" | "three_quarters" | "full"

// Configuration for field widths with corresponding grid classes and percentages
export const FIELD_WIDTH_CONFIG: Record<FieldWidthKey, { label: string; gridCols: string; percentage: string }> = {
  one_quarter: {
    label: "25%",
    gridCols: "col-span-3",
    percentage: "25",
  },
  one_third: {
    label: "33%",
    gridCols: "col-span-4",
    percentage: "33.33",
  },
  one_half: {
    label: "50%",
    gridCols: "col-span-6",
    percentage: "50",
  },
  two_thirds: {
    label: "66%",
    gridCols: "col-span-8",
    percentage: "66.67",
  },
  three_quarters: {
    label: "75%",
    gridCols: "col-span-9",
    percentage: "75",
  },
  full: {
    label: "100%",
    gridCols: "col-span-12",
    percentage: "100",
  },
}

// Helper function to get the grid column class based on width
export function getGridColClass(width: string): string {
  const normalizedWidth = normalizeWidthKey(width)
  return FIELD_WIDTH_CONFIG[normalizedWidth]?.gridCols || FIELD_WIDTH_CONFIG.full.gridCols
}

// Helper function to get a human-readable width label
export function getWidthLabel(width?: string): string {
  if (!width) return FIELD_WIDTH_CONFIG.full.label
  const normalizedWidth = normalizeWidthKey(width)
  return FIELD_WIDTH_CONFIG[normalizedWidth]?.label || FIELD_WIDTH_CONFIG.full.label
}

// Helper function to get Tailwind width class
export function getTailwindWidthClass(width?: string): string {
  if (!width) return "w-full"

  const widthMap: Record<string, string> = {
    one_quarter: "w-1/4",
    one_third: "w-1/3",
    one_half: "w-1/2",
    two_thirds: "w-2/3",
    three_quarters: "w-3/4",
    full: "w-full",
  }

  const normalizedWidth = normalizeWidthKey(width)
  return widthMap[normalizedWidth] || "w-full"
}

// Helper function to get responsive width classes
export function getResponsiveWidthClasses(width?: string): string {
  if (!width) return "w-full"

  const responsiveWidthMap: Record<string, string> = {
    one_quarter: "w-full sm:w-1/2 md:w-1/4",
    one_third: "w-full sm:w-1/2 md:w-1/3",
    one_half: "w-full sm:w-1/2",
    two_thirds: "w-full md:w-2/3",
    three_quarters: "w-full md:w-3/4",
    full: "w-full",
  }

  const normalizedWidth = normalizeWidthKey(width)
  return responsiveWidthMap[normalizedWidth] || "w-full"
}

// Helper function to normalize width keys (handle legacy values)
function normalizeWidthKey(width: string): FieldWidthKey {
  // Handle legacy width values
  const legacyMapping: Record<string, FieldWidthKey> = {
    quarter: "one_quarter",
    third: "one_third",
    half: "one_half",
    three_quarters: "three_quarters",
    full: "full",
  }

  // Check if it's a legacy value
  if (legacyMapping[width]) {
    return legacyMapping[width]
  }

  // Check if it's already a valid width
  if (isValidFieldWidth(width)) {
    return width as FieldWidthKey
  }

  // Default to full width
  return "full"
}

// Helper function to validate field width
function isValidFieldWidth(width: string): width is FieldWidthKey {
  return width in FIELD_WIDTH_CONFIG
}

// Width options for field editor dropdown
export const FIELD_WIDTH_OPTIONS = [
  { value: "one_quarter", label: "1/4 Width (25%)" },
  { value: "one_third", label: "1/3 Width (33.33%)" },
  { value: "one_half", label: "1/2 Width (50%)" },
  { value: "two_thirds", label: "2/3 Width (66.67%)" },
  { value: "three_quarters", label: "3/4 Width (75%)" },
  { value: "full", label: "Full Width (100%)" },
]

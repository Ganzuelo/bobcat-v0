import type { FieldType } from "@/lib/database-types"

export const FIELD_TYPES: FieldType[] = ["text", "textarea", "email", "select", "checkbox", "radio"]

export const EXTENDED_FIELD_WIDTH_CONFIG = {
  quarter: {
    label: "1/4 Width",
    percentage: "25%",
    gridCols: "col-span-3",
  },
  third: {
    label: "1/3 Width",
    percentage: "33.33%",
    gridCols: "col-span-4",
  },
  half: {
    label: "1/2 Width",
    percentage: "50%",
    gridCols: "col-span-6",
  },
  two_thirds: {
    label: "2/3 Width",
    percentage: "66.67%",
    gridCols: "col-span-8",
  },
  three_quarters: {
    label: "3/4 Width",
    percentage: "75%",
    gridCols: "col-span-9",
  },
  full: {
    label: "Full Width",
    percentage: "100%",
    gridCols: "col-span-12",
  },
}

export const FIELD_WIDTH_OPTIONS = [
  { value: "quarter", label: "1/4 Width (25%)" },
  { value: "third", label: "1/3 Width (33.33%)" },
  { value: "half", label: "1/2 Width (50%)" },
  { value: "two_thirds", label: "2/3 Width (66.67%)" },
  { value: "three_quarters", label: "3/4 Width (75%)" },
  { value: "full", label: "Full Width (100%)" },
]

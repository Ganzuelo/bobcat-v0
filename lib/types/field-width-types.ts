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

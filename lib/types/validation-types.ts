import { z } from "zod"

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
  outputFormat: z.string().optional(),
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

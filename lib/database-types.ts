export type UserRole = "admin" | "editor" | "viewer" | "user"
export type FormType =
  | "survey"
  | "application"
  | "registration"
  | "feedback"
  | "assessment"
  | "urar"
  | "inspection"
  | "custom"
export type FormStatus = "draft" | "published" | "archived" | "template"
export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "password"
  | "number"
  | "phone"
  | "url"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "toggle"
  | "date"
  | "datetime"
  | "time"
  | "file"
  | "image"
  | "signature"
  | "rating"
  | "slider"
  | "matrix"
  | "address"
  | "location"
  | "calculated"
  | "lookup"
  | "hidden"
  | "section_break"
  | "page_break"
  | "html_content"
export type FieldWidth = "quarter" | "half" | "three_quarters" | "full"
export type SubmissionStatus = "draft" | "submitted" | "reviewed" | "approved" | "rejected"
export type RuleType = "validation" | "calculation" | "conditional_visibility" | "auto_populate" | "workflow"

// Form-related types
export interface Form {
  id: string
  title: string
  description?: string
  form_type?: string
  version?: number
  status?: string
  created_by?: string
  tags?: string[]
  settings?: Record<string, any>
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
  published_at?: string | null
  archived_at?: string | null
}

export interface FormPage {
  id: string
  form_id: string
  title: string
  description?: string
  page_order: number
  settings?: Record<string, any>
  created_at: string
  updated_at: string
  sections?: FormSection[]
}

export interface FormSection {
  id: string
  page_id: string
  title?: string
  description?: string
  section_order: number
  settings?: Record<string, any>
  created_at: string
  updated_at: string
  fields?: FormField[]
}

export interface FormField {
  id: string
  section_id: string
  field_type: string
  label: string
  placeholder?: string
  help_text?: string
  required?: boolean
  width?: string
  field_order: number
  options?: any[]
  validation?: Record<string, any>
  conditional_visibility?: Record<string, any>
  calculated_config?: Record<string, any>
  lookup_config?: Record<string, any>
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  // Add support for Sales Grid
  gridConfig?: {
    columns: Array<{
      id: string
      header: string
      type: "TEXT" | "NUMBER" | "SELECT" | "CHECKBOX"
      width?: number
      options?: { label: string; value: string }[]
      required?: boolean
    }>
    minRows?: number
    maxRows?: number
    rowLabel?: string
  }
}

export interface FormSubmission {
  id: string
  form_id: string
  submitted_by?: string
  submission_data: Record<string, any>
  status: SubmissionStatus
  user_ip?: string
  user_agent?: string
  referrer?: string
  completion_time_seconds?: number
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface FormRule {
  id: string
  form_id: string
  field_id?: string
  rule_type: RuleType
  rule_config: Record<string, any>
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

export interface FormStructure {
  form: Form
  pages: FormPage[]
  rules?: any[]
}

// User-related types
export interface User {
  id: string
  email: string
  full_name?: string
  role?: "admin" | "user" | "viewer"
  status?: "active" | "inactive" | "pending"
  created_at: string
  updated_at: string
  last_login?: string
}

// Add other database types as needed
export type Database = {}

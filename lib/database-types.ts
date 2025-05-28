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

export interface User {
  id: string
  email: string
  password_hash: string
  first_name?: string
  last_name?: string
  role: UserRole
  avatar_url?: string
  is_active: boolean
  email_verified: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface Form {
  id: string
  title: string
  description?: string
  form_type: FormType
  version: number
  status: FormStatus
  created_by: string
  tags: string[]
  settings: Record<string, any>
  metadata: Record<string, any>
  published_at?: string
  archived_at?: string
  created_at: string
  updated_at: string
}

export interface FormPage {
  id: string
  form_id: string
  title: string
  description?: string
  page_order: number
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FormSection {
  id: string
  page_id: string
  title?: string
  description?: string
  section_order: number
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FormField {
  id: string
  section_id: string
  field_type: FieldType
  label: string
  placeholder?: string
  help_text?: string
  required: boolean
  width: FieldWidth
  field_order: number
  options: any[]
  validation: Record<string, any>
  conditional_visibility: Record<string, any>
  calculated_config: Record<string, any>
  lookup_config: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
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
  pages: (FormPage & {
    sections: (FormSection & {
      fields: FormField[]
    })[]
  })[]
  rules: FormRule[]
}

export type Database = {}

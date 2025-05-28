export interface Profile {
  id: string
  email: string
  full_name?: string
  role: "admin" | "user" | "viewer"
  created_at: string
  updated_at: string
}

export interface FormTemplate {
  id: string
  name: string
  description?: string
  type: "urar" | "custom" | "inspection"
  schema: any
  version: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface FormInstance {
  id: string
  template_id: string
  name: string
  data: any
  status: "draft" | "in_progress" | "completed" | "archived"
  submitted_by?: string
  submitted_at?: string
  created_at: string
  updated_at: string
}

export interface UrarReport {
  id: string
  form_instance_id: string
  property_address: string
  property_city?: string
  property_state?: string
  property_zip?: string
  borrower_name?: string
  lender_name?: string
  appraiser_name?: string
  appraiser_license?: string
  appraisal_date?: string
  property_value?: number
  loan_amount?: number
  property_type?: "single_family" | "condo" | "townhouse" | "multi_family"
  occupancy_type?: "owner_occupied" | "investment" | "second_home"
  created_at: string
  updated_at: string
}

export interface BusinessRule {
  id: string
  name: string
  description?: string
  rule_type: "validation" | "calculation" | "workflow"
  conditions: any
  actions: any
  priority: number
  is_active: boolean
  applies_to_forms: string[]
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Decision {
  id: string
  form_instance_id: string
  decision_type: string
  decision_value: string
  confidence_score?: number
  reasoning?: string
  applied_rules: string[]
  made_by?: string
  made_at: string
  created_at: string
}

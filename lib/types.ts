export interface FormData {
  id: string
  title: string
  description: string
  pages: FormPage[]
}

export interface FormPage {
  id: string
  title: string
  description: string
  sections: FormSection[]
}

export interface FormSection {
  id: string
  title: string
  description: string
  fields: FormField[]
}

export interface FormField {
  id: string
  field_type: string
  label: string
  placeholder: string
  help_text: string
  required: boolean
  readonly: boolean
  default_value: string
  uad_field_id: string
  options?: FormFieldOption[]
}

export interface FormFieldOption {
  value: string
  label: string
}

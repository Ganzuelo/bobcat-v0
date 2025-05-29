export enum QuestionType {
  TEXT = "text",
  NUMBER = "number",
  EMAIL = "email",
  PHONE = "phone",
  DATE = "date",
  SELECT = "select",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  TEXTAREA = "textarea",
  FILE = "file",
}

export interface Question {
  id: string
  text: string
  type: QuestionType
}

export interface Section {
  id: string
  title: string
  questions: Question[]
}

export interface Page {
  id: string
  title: string
  description: string
  sections: Section[]
}

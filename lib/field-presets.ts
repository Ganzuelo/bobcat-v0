import { FIELD_TYPES } from "@/lib/form-types"

export interface PresetField {
  id: string
  name: string
  field_type: string
  label: string
  placeholder?: string
  help_text?: string
  required?: boolean
  width?: string
  validation?: any
  options?: { value: string; label: string }[]
}

export interface PresetCategory {
  id: string
  name: string
  description: string
  fields: PresetField[]
}

// U.S. States and Territories
const US_STATES_AND_TERRITORIES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  // U.S. Territories
  "American Samoa",
  "District of Columbia",
  "Federated States of Micronesia",
  "Guam",
  "Marshall Islands",
  "Northern Mariana Islands",
  "Palau",
  "Puerto Rico",
  "U.S. Virgin Islands",
]

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: "address_inputs",
    name: "Address Inputs",
    description: "Common address-related fields",
    fields: [
      {
        id: "street_address",
        name: "Street Address",
        field_type: FIELD_TYPES.TEXT,
        label: "Street Address",
        placeholder: "123 Main Street",
        help_text: "Enter the full street address",
        required: true,
        width: "full",
      },
      {
        id: "city",
        name: "City",
        field_type: FIELD_TYPES.TEXT,
        label: "City",
        placeholder: "City name",
        help_text: "Enter the city name",
        required: true,
        width: "half",
      },
      {
        id: "state",
        name: "State",
        field_type: FIELD_TYPES.SELECT,
        label: "State",
        placeholder: "Select state or territory",
        help_text: "Select your state or territory",
        required: true,
        width: "quarter",
        options: US_STATES_AND_TERRITORIES.map((state) => ({ value: state, label: state })),
      },
      {
        id: "zip_code",
        name: "Zip Code",
        field_type: FIELD_TYPES.TEXT,
        label: "Zip Code",
        placeholder: "12345",
        help_text: "Enter 5-digit zip code",
        required: true,
        width: "quarter",
        validation: {
          pattern: "^\\d{5}(-\\d{4})?$",
          message: "Please enter a valid zip code (12345 or 12345-6789)",
        },
      },
      {
        id: "country",
        name: "Country",
        field_type: FIELD_TYPES.SELECT,
        label: "Country",
        placeholder: "Select country",
        help_text: "Select your country",
        required: true,
        width: "half",
        options: [
          { value: "US", label: "United States" },
          { value: "CA", label: "Canada" },
          { value: "MX", label: "Mexico" },
          { value: "GB", label: "United Kingdom" },
          { value: "AU", label: "Australia" },
        ],
      },
    ],
  },
  {
    id: "contact_info",
    name: "Contact Info",
    description: "Personal contact information fields",
    fields: [
      {
        id: "first_name",
        name: "First Name",
        field_type: FIELD_TYPES.TEXT,
        label: "First Name",
        placeholder: "John",
        help_text: "Enter your first name",
        required: true,
        width: "half",
      },
      {
        id: "last_name",
        name: "Last Name",
        field_type: FIELD_TYPES.TEXT,
        label: "Last Name",
        placeholder: "Doe",
        help_text: "Enter your last name",
        required: true,
        width: "half",
      },
      {
        id: "middle_initial",
        name: "Middle Initial",
        field_type: FIELD_TYPES.TEXT,
        label: "Middle Initial",
        placeholder: "M",
        help_text: "Enter your middle initial",
        required: false,
        width: "quarter",
      },
      {
        id: "phone_number",
        name: "Phone Number",
        field_type: FIELD_TYPES.PHONE,
        label: "Phone Number",
        placeholder: "(555) 123-4567",
        help_text: "Enter your phone number",
        required: false,
        width: "half",
        validation: {
          pattern: "^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$",
          message: "Please enter a valid phone number",
        },
      },
      {
        id: "email_address",
        name: "Email Address",
        field_type: FIELD_TYPES.EMAIL,
        label: "Email Address",
        placeholder: "john.doe@example.com",
        help_text: "Enter your email address",
        required: true,
        width: "half",
      },
      {
        id: "website",
        name: "Website",
        field_type: FIELD_TYPES.URL,
        label: "Website",
        placeholder: "https://www.example.com",
        help_text: "Enter your website URL",
        required: false,
        width: "half",
      },
    ],
  },
  {
    id: "personal_details",
    name: "Personal Details",
    description: "Personal identification and demographic fields",
    fields: [
      {
        id: "date_of_birth",
        name: "Date of Birth",
        field_type: FIELD_TYPES.DATE,
        label: "Date of Birth",
        placeholder: "MM/DD/YYYY",
        help_text: "Enter your date of birth",
        required: true,
        width: "half",
      },
      {
        id: "social_security",
        name: "Social Security Number",
        field_type: FIELD_TYPES.TEXT,
        label: "Social Security Number",
        placeholder: "XXX-XX-XXXX",
        help_text: "Enter your 9-digit SSN",
        required: false,
        width: "half",
        validation: {
          pattern: "^\\d{3}-?\\d{2}-?\\d{4}$",
          message: "Please enter a valid SSN (XXX-XX-XXXX)",
        },
      },
      {
        id: "gender",
        name: "Gender",
        field_type: FIELD_TYPES.SELECT,
        label: "Gender",
        placeholder: "Select gender",
        help_text: "Select your gender",
        required: false,
        width: "quarter",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "non-binary", label: "Non-binary" },
          { value: "prefer-not-to-say", label: "Prefer not to say" },
        ],
      },
      {
        id: "marital_status",
        name: "Marital Status",
        field_type: FIELD_TYPES.SELECT,
        label: "Marital Status",
        placeholder: "Select status",
        help_text: "Select your marital status",
        required: false,
        width: "quarter",
        options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married" },
          { value: "divorced", label: "Divorced" },
          { value: "widowed", label: "Widowed" },
          { value: "separated", label: "Separated" },
        ],
      },
      {
        id: "occupation",
        name: "Occupation",
        field_type: FIELD_TYPES.TEXT,
        label: "Occupation",
        placeholder: "Software Engineer",
        help_text: "Enter your current occupation",
        required: false,
        width: "half",
      },
      {
        id: "emergency_contact",
        name: "Emergency Contact",
        field_type: FIELD_TYPES.TEXT,
        label: "Emergency Contact Name",
        placeholder: "Jane Doe",
        help_text: "Enter emergency contact full name",
        required: false,
        width: "half",
      },
    ],
  },
]

export function getPresetFieldById(fieldId: string): PresetField | undefined {
  for (const category of PRESET_CATEGORIES) {
    const field = category.fields.find((f) => f.id === fieldId)
    if (field) return field
  }
  return undefined
}

export function getCategoryById(categoryId: string): PresetCategory | undefined {
  return PRESET_CATEGORIES.find((category) => category.id === categoryId)
}

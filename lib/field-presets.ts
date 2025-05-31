import { FIELD_TYPES } from "@/lib/form-types"

export interface FieldPreset {
  id: string
  name: string
  description: string
  icon: string
  fields: Array<{
    field_type: string
    label: string
    placeholder?: string
    help_text?: string
    required?: boolean
    width?: string
    validation?: any
    options?: string[] | { value: string; label: string }[]
  }>
}

// U.S. States for dropdown
const US_STATES = [
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
]

export const FIELD_PRESETS: FieldPreset[] = [
  {
    id: "full_address_block",
    name: "Full Address Block",
    description: "Complete address with street, city, state, and zip",
    icon: "map-pin",
    fields: [
      {
        field_type: FIELD_TYPES.TEXT,
        label: "Street Address",
        placeholder: "123 Main Street",
        help_text: "Enter the full street address",
        required: true,
        width: "full",
      },
      {
        field_type: FIELD_TYPES.TEXT,
        label: "City",
        placeholder: "City name",
        help_text: "Enter the city name",
        required: true,
        width: "half",
      },
      {
        field_type: FIELD_TYPES.SELECT,
        label: "State",
        placeholder: "Select state",
        help_text: "Select your state",
        required: true,
        width: "quarter",
        options: US_STATES.map((state) => ({ value: state, label: state })),
      },
      {
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
    ],
  },
  {
    id: "contact_info",
    name: "Contact Info",
    description: "Basic contact information fields",
    icon: "user",
    fields: [
      {
        field_type: FIELD_TYPES.TEXT,
        label: "First Name",
        placeholder: "John",
        help_text: "Enter your first name",
        required: true,
        width: "half",
      },
      {
        field_type: FIELD_TYPES.TEXT,
        label: "Last Name",
        placeholder: "Doe",
        help_text: "Enter your last name",
        required: true,
        width: "half",
      },
      {
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
        field_type: FIELD_TYPES.EMAIL,
        label: "Email Address",
        placeholder: "john.doe@example.com",
        help_text: "Enter your email address",
        required: true,
        width: "half",
      },
    ],
  },
  {
    id: "name_and_dob",
    name: "Name & DOB",
    description: "Full name with date of birth",
    icon: "calendar-days",
    fields: [
      {
        field_type: FIELD_TYPES.TEXT,
        label: "First Name",
        placeholder: "John",
        help_text: "Enter your first name",
        required: true,
        width: "half",
      },
      {
        field_type: FIELD_TYPES.TEXT,
        label: "Middle Initial",
        placeholder: "M",
        help_text: "Enter your middle initial",
        required: false,
        width: "quarter",
      },
      {
        field_type: FIELD_TYPES.TEXT,
        label: "Last Name",
        placeholder: "Doe",
        help_text: "Enter your last name",
        required: true,
        width: "quarter",
      },
      {
        field_type: FIELD_TYPES.DATE,
        label: "Date of Birth",
        placeholder: "MM/DD/YYYY",
        help_text: "Enter your date of birth",
        required: true,
        width: "full",
      },
    ],
  },
]

export function getPresetById(id: string): FieldPreset | undefined {
  return FIELD_PRESETS.find((preset) => preset.id === id)
}

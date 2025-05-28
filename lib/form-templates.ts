import type { FormStructure, FormType } from "./database-types"

export interface FormConfig {
  title: string
  description?: string
  formType: "uad_3_6" | "uad_2_6" | "bpo" | "other"
}

// Map our UI form types to valid database enum values
function mapFormTypeToDbType(formType: string): FormType {
  switch (formType) {
    case "uad_3_6":
      return "urar" // Uniform Residential Appraisal Report
    case "uad_2_6":
      return "urar"
    case "bpo":
      return "assessment" // Closest match for BPO
    case "other":
    default:
      return "custom"
  }
}

export function createFormStructure(config: FormConfig): FormStructure {
  const baseForm = {
    id: crypto.randomUUID(),
    title: config.title,
    description: config.description || "",
    form_type: mapFormTypeToDbType(config.formType), // Map to valid database enum
    version: 1,
    status: "draft" as const,
    created_by: "",
    tags: [],
    settings: {
      originalFormType: config.formType, // Store the original form type in settings
    },
    metadata: {},
    created_at: "",
    updated_at: "",
  }

  switch (config.formType) {
    case "uad_3_6":
      return createUAD36Structure(baseForm)
    case "uad_2_6":
      return createUAD26Structure(baseForm)
    case "bpo":
      return createBPOStructure(baseForm)
    case "other":
    default:
      return createCustomStructure(baseForm)
  }
}

function createUAD36Structure(form: any): FormStructure {
  return {
    form,
    pages: [
      {
        id: crypto.randomUUID(),
        form_id: form.id,
        title: "Subject Property",
        description: "Basic property information and identification",
        page_order: 1,
        settings: {},
        created_at: "",
        updated_at: "",
        sections: [
          {
            id: crypto.randomUUID(),
            page_id: "",
            title: "Property Identification",
            description: "Basic property details",
            section_order: 1,
            settings: {},
            created_at: "",
            updated_at: "",
            fields: [
              {
                id: crypto.randomUUID(),
                section_id: "",
                field_type: "text",
                label: "Property Address",
                placeholder: "Enter property address",
                help_text: "Full street address of the subject property",
                required: true,
                width: "full",
                field_order: 1,
                options: [],
                validation: {}, // Changed from [] to {}
                conditional_visibility: {},
                calculated_config: {},
                lookup_config: {},
                metadata: {
                  uad_field_id: "PROP_ADDR",
                  mismo_path: "DEAL_SETS/DEAL_SET/DEALS/DEAL/COLLATERALS/COLLATERAL/SUBJECT_PROPERTY/ADDRESS",
                },
                created_at: "",
                updated_at: "",
              },
              {
                id: crypto.randomUUID(),
                section_id: "",
                field_type: "text",
                label: "City",
                placeholder: "Enter city",
                help_text: "",
                required: true,
                width: "half",
                field_order: 2,
                options: [],
                validation: {}, // Changed from [] to {}
                conditional_visibility: {},
                calculated_config: {},
                lookup_config: {},
                metadata: {
                  uad_field_id: "PROP_CITY",
                  mismo_path: "DEAL_SETS/DEAL_SET/DEALS/DEAL/COLLATERALS/COLLATERAL/SUBJECT_PROPERTY/ADDRESS/CITY",
                },
                created_at: "",
                updated_at: "",
              },
              {
                id: crypto.randomUUID(),
                section_id: "",
                field_type: "select",
                label: "State",
                placeholder: "Select state",
                help_text: "",
                required: true,
                width: "quarter",
                field_order: 3,
                options: [
                  { label: "Alabama", value: "AL" },
                  { label: "Alaska", value: "AK" },
                  { label: "Arizona", value: "AZ" },
                  { label: "Arkansas", value: "AR" },
                  { label: "California", value: "CA" },
                  { label: "Colorado", value: "CO" },
                  { label: "Connecticut", value: "CT" },
                  { label: "Delaware", value: "DE" },
                  { label: "Florida", value: "FL" },
                  { label: "Georgia", value: "GA" },
                ],
                validation: {}, // Changed from [] to {}
                conditional_visibility: {},
                calculated_config: {},
                lookup_config: {},
                metadata: {
                  uad_field_id: "PROP_STATE",
                  mismo_path: "DEAL_SETS/DEAL_SET/DEALS/DEAL/COLLATERALS/COLLATERAL/SUBJECT_PROPERTY/ADDRESS/STATE",
                },
                created_at: "",
                updated_at: "",
              },
              {
                id: crypto.randomUUID(),
                section_id: "",
                field_type: "text",
                label: "ZIP Code",
                placeholder: "Enter ZIP code",
                help_text: "",
                required: true,
                width: "quarter",
                field_order: 4,
                options: [],
                validation: {
                  pattern: {
                    value: "^[0-9]{5}(-[0-9]{4})?$",
                    message: "Enter a valid ZIP code",
                  },
                }, // Changed from array to object
                conditional_visibility: {},
                calculated_config: {},
                lookup_config: {},
                metadata: {
                  uad_field_id: "PROP_ZIP",
                  mismo_path:
                    "DEAL_SETS/DEAL_SET/DEALS/DEAL/COLLATERALS/COLLATERAL/SUBJECT_PROPERTY/ADDRESS/POSTAL_CODE",
                },
                created_at: "",
                updated_at: "",
              },
            ],
          },
          {
            id: crypto.randomUUID(),
            page_id: "",
            title: "Property Characteristics",
            description: "Physical characteristics of the property",
            section_order: 2,
            settings: {},
            created_at: "",
            updated_at: "",
            fields: [
              {
                id: crypto.randomUUID(),
                section_id: "",
                field_type: "select",
                label: "Property Type",
                placeholder: "Select property type",
                help_text: "",
                required: true,
                width: "half",
                field_order: 1,
                options: [
                  { label: "Single Family Detached", value: "SFD" },
                  { label: "Single Family Attached", value: "SFA" },
                  { label: "Condominium", value: "CONDO" },
                  { label: "Townhouse", value: "TOWNHOUSE" },
                  { label: "Cooperative", value: "COOP" },
                  { label: "Manufactured Home", value: "MFG" },
                ],
                validation: {}, // Changed from [] to {}
                conditional_visibility: {},
                calculated_config: {},
                lookup_config: {},
                metadata: {
                  uad_field_id: "PROP_TYPE",
                  mismo_path:
                    "DEAL_SETS/DEAL_SET/DEALS/DEAL/COLLATERALS/COLLATERAL/SUBJECT_PROPERTY/PROPERTY_DETAIL/PROPERTY_TYPE",
                },
                created_at: "",
                updated_at: "",
              },
              {
                id: crypto.randomUUID(),
                section_id: "",
                field_type: "number",
                label: "Year Built",
                placeholder: "Enter year built",
                help_text: "",
                required: true,
                width: "quarter",
                field_order: 2,
                options: [],
                validation: {
                  min: {
                    value: 1800,
                    message: "Year must be 1800 or later",
                  },
                  max: {
                    value: new Date().getFullYear(),
                    message: "Year cannot be in the future",
                  },
                }, // Changed from array to object
                conditional_visibility: {},
                calculated_config: {},
                lookup_config: {},
                metadata: {
                  uad_field_id: "YEAR_BUILT",
                  mismo_path:
                    "DEAL_SETS/DEAL_SET/DEALS/DEAL/COLLATERALS/COLLATERAL/SUBJECT_PROPERTY/IMPROVEMENTS/IMPROVEMENT/STRUCTURE/STRUCTURE_DETAIL/YEAR_BUILT",
                },
                created_at: "",
                updated_at: "",
              },
            ],
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        form_id: form.id,
        title: "Sales Comparison Approach",
        description: "Comparable sales analysis",
        page_order: 2,
        settings: {},
        created_at: "",
        updated_at: "",
        sections: [
          {
            id: crypto.randomUUID(),
            page_id: "",
            title: "Comparable Sales",
            description: "Recent comparable sales in the area",
            section_order: 1,
            settings: {},
            created_at: "",
            updated_at: "",
            fields: [],
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        form_id: form.id,
        title: "Final Reconciliation",
        description: "Final value conclusion and reconciliation",
        page_order: 3,
        settings: {},
        created_at: "",
        updated_at: "",
        sections: [
          {
            id: crypto.randomUUID(),
            page_id: "",
            title: "Value Conclusion",
            description: "Final appraised value and reconciliation",
            section_order: 1,
            settings: {},
            created_at: "",
            updated_at: "",
            fields: [],
          },
        ],
      },
    ],
    rules: [],
  }
}

function createUAD26Structure(form: any): FormStructure {
  return {
    form,
    pages: [
      {
        id: crypto.randomUUID(),
        form_id: form.id,
        title: "Property Information",
        description: "Basic property details (UAD 2.6)",
        page_order: 1,
        settings: {},
        created_at: "",
        updated_at: "",
        sections: [
          {
            id: crypto.randomUUID(),
            page_id: "",
            title: "Property Details",
            description: "",
            section_order: 1,
            settings: {},
            created_at: "",
            updated_at: "",
            fields: [],
          },
        ],
      },
    ],
    rules: [],
  }
}

function createBPOStructure(form: any): FormStructure {
  return {
    form,
    pages: [
      {
        id: crypto.randomUUID(),
        form_id: form.id,
        title: "BPO Analysis",
        description: "Broker Price Opinion analysis",
        page_order: 1,
        settings: {},
        created_at: "",
        updated_at: "",
        sections: [
          {
            id: crypto.randomUUID(),
            page_id: "",
            title: "Property Analysis",
            description: "",
            section_order: 1,
            settings: {},
            created_at: "",
            updated_at: "",
            fields: [],
          },
        ],
      },
    ],
    rules: [],
  }
}

function createCustomStructure(form: any): FormStructure {
  return {
    form,
    pages: [
      {
        id: crypto.randomUUID(),
        form_id: form.id,
        title: "Page 1",
        description: "",
        page_order: 1,
        settings: {},
        created_at: "",
        updated_at: "",
        sections: [
          {
            id: crypto.randomUUID(),
            page_id: "",
            title: "Section 1",
            description: "",
            section_order: 1,
            settings: {},
            created_at: "",
            updated_at: "",
            fields: [],
          },
        ],
      },
    ],
    rules: [],
  }
}

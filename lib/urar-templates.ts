import { FIELD_TYPES } from "./field-types"
import { URAR_CARDINALITY, URAR_CONDITIONALITY, URAR_OUTPUT_FORMAT } from "./field-types"
import type { FormField } from "./form-interfaces"

// URAR-specific field templates with UAD Field IDs
export const URAR_FIELD_TEMPLATES: Record<string, Partial<FormField>> = {
  property_address: {
    field_type: "text", // Changed from FIELD_TYPES.ADDRESS since ADDRESS is not defined
    label: "Property Address",
    required: true,
    metadata: {
      uad_field_id: "3.001",
      reportFieldId: "1004",
      mismoFieldId: "SubjectPropertyAddress",
      mismo_path: "COLLATERALS/COLLATERAL/SUBJECT_PROPERTY/ADDRESS",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.TEXT,
      category: "Property Information",
      xml: {
        fieldId: "SubjectPropertyAddress",
        required: true,
        format: "text",
      },
    },
  },
  property_value: {
    field_type: "number", // Changed from FIELD_TYPES.CURRENCY since CURRENCY is not defined
    label: "Property Value",
    required: true,
    metadata: {
      uad_field_id: "3.002",
      reportFieldId: "1008",
      mismoFieldId: "PropertyValue",
      mismo_path: "COLLATERALS/COLLATERAL/VALUATION/PropertyValue",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.CURRENCY,
      category: "Valuation",
      xml: {
        fieldId: "PropertyValue",
        required: true,
        format: "currency",
      },
    },
  },
  loan_amount: {
    field_type: "number", // Changed from FIELD_TYPES.CURRENCY since CURRENCY is not defined
    label: "Loan Amount",
    required: true,
    metadata: {
      uad_field_id: "3.003",
      reportFieldId: "1009",
      mismoFieldId: "LoanAmount",
      mismo_path: "LOAN/LoanAmount",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.CURRENCY,
      category: "Loan Information",
      xml: {
        fieldId: "LoanAmount",
        required: true,
        format: "currency",
      },
    },
  },
  borrower_name: {
    field_type: FIELD_TYPES.TEXT,
    label: "Borrower Name",
    required: true,
    metadata: {
      uad_field_id: "3.004",
      reportFieldId: "1010",
      mismoFieldId: "BorrowerName",
      mismo_path: "BORROWER/Name",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.TEXT,
      category: "Borrower Information",
      xml: {
        fieldId: "BorrowerName",
        required: true,
        format: "text",
      },
    },
  },
  appraiser_name: {
    field_type: FIELD_TYPES.TEXT,
    label: "Appraiser Name",
    required: true,
    metadata: {
      uad_field_id: "3.005",
      reportFieldId: "1011",
      mismoFieldId: "AppraiserName",
      mismo_path: "APPRAISER/Name",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.TEXT,
      category: "Appraiser Information",
      xml: {
        fieldId: "AppraiserName",
        required: true,
        format: "text",
      },
    },
  },
  appraisal_date: {
    field_type: FIELD_TYPES.DATE,
    label: "Appraisal Date",
    required: true,
    metadata: {
      uad_field_id: "3.006",
      reportFieldId: "1012",
      mismoFieldId: "AppraisalDate",
      mismo_path: "APPRAISAL/AppraisalDate",
      cardinality: URAR_CARDINALITY.REQUIRED,
      conditionality: URAR_CONDITIONALITY.ALWAYS,
      outputFormat: URAR_OUTPUT_FORMAT.DATE,
      category: "Appraisal Information",
      xml: {
        fieldId: "AppraisalDate",
        required: true,
        format: "date",
      },
    },
  },
}

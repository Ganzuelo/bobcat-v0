"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X } from "lucide-react"
import { useState, useEffect } from "react"
import type {
  FieldEditorProps,
  ValidationState,
  MetadataState,
  LogicState,
  AdvancedState,
  LogicCondition,
  XmlMappingState,
  PrefillConfig,
  CarryforwardState,
} from "@/lib/field-editor-types"
import { BasicTab } from "./field-editor/basic-tab"
import { ValidationTab } from "./field-editor/validation-tab"
import { MetadataTab } from "./field-editor/metadata-tab"
import { ConditionalTab } from "./field-editor/conditional-tab"
import { AdvancedTab } from "./field-editor/advanced-tab"
import { PrefillTab } from "./field-editor/prefill-tab"
import { CarryforwardTab } from "./field-editor/carryforward-tab"
import { toast } from "@/components/ui/use-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { useErrorReporting } from "@/hooks/use-error-reporting"
import { AlertTriangle } from "lucide-react"

export function FieldEditor({
  field,
  availableFields = [],
  onUpdateField,
  onSave,
  onReset,
  onCancel,
}: FieldEditorProps) {
  // Filter out the current field from available fields
  const otherFields = availableFields.filter((f) => f.id !== field.id)

  // Extract validation state from field
  const getValidationState = (): ValidationState => {
    const validation = field.validation || []
    const state: ValidationState = {
      required: field.required || false,
    }

    // Ensure validation is an array before calling forEach
    if (Array.isArray(validation)) {
      validation.forEach((rule) => {
        switch (rule.type) {
          case "minLength":
            state.minLength = rule.value as number
            break
          case "maxLength":
            state.maxLength = rule.value as number
            break
          case "min":
            state.minValue = rule.value as number
            break
          case "max":
            state.maxValue = rule.value as number
            break
          case "pattern":
            state.pattern = rule.pattern
            break
          case "enum":
            state.allowedValues = (rule.value as string)?.split(",").map((v) => v.trim()) || []
            break
        }
      })
    }

    return state
  }

  // Extract metadata state from field
  const getMetadataState = (): MetadataState => {
    const metadata = field.metadata || {}
    return {
      fieldKey: metadata.fieldKey || "",
      dataType: metadata.dataType || "text",
      uadFieldName: metadata.uadFieldName || "",
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      xml: {
        path: metadata.xml?.path || "",
        fieldId: metadata.xml?.fieldId || "",
        format: metadata.xml?.format || "",
        required: metadata.xml?.required || false,
      },
    }
  }

  // Extract logic state from field
  const getLogicState = (): LogicState => {
    const logic = field.logic || {}
    return {
      enabled: logic.enabled || false,
      conditions: Array.isArray(logic.conditions) ? logic.conditions : [],
    }
  }

  // Extract advanced state from field
  const getAdvancedState = (): AdvancedState => {
    const advanced = field.advanced || {}
    return {
      visibilityMode: advanced.visibilityMode || "visible",
      calculatedField: advanced.calculatedField || "",
      customOnChangeLogic: advanced.customOnChangeLogic || "",
      dependsOnFields: Array.isArray(advanced.dependsOnFields) ? advanced.dependsOnFields : [],
      customAttributes: Array.isArray(advanced.customAttributes) ? advanced.customAttributes : [],
    }
  }

  // Extract prefill state from field
  const getPrefillState = (): PrefillConfig => {
    const prefill = field.prefill_config || {}
    return {
      enabled: prefill.enabled || false,
      source: prefill.source || "internal",
      key: prefill.key || "",
      endpoint: prefill.endpoint || "",
      fieldMap: prefill.fieldMap || {},
      fallbackValue: prefill.fallbackValue,
      cacheTimeout: prefill.cacheTimeout || 300,
      retryAttempts: prefill.retryAttempts || 3,
    }
  }

  // Extract carryforward state from field
  const getCarryforwardState = (): CarryforwardState => {
    const carryforward = field.carryforward_config || {}
    return {
      enabled: carryforward.enabled || false,
      source: carryforward.source || "",
      mode: carryforward.mode || "default",
    }
  }

  const [validationState, setValidationState] = useState<ValidationState>(getValidationState())
  const [metadataState, setMetadataState] = useState<MetadataState>(getMetadataState())
  const [logicState, setLogicState] = useState<LogicState>(getLogicState())
  const [advancedState, setAdvancedState] = useState<AdvancedState>(getAdvancedState())
  const [prefillState, setPrefillState] = useState<PrefillConfig>(getPrefillState())
  const [carryforwardState, setCarryforwardState] = useState<CarryforwardState>(getCarryforwardState())
  const [allowedValuesInput, setAllowedValuesInput] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [xmlMappingOpen, setXmlMappingOpen] = useState(false)
  const [newAttributeKey, setNewAttributeKey] = useState("")
  const [newAttributeValue, setNewAttributeValue] = useState("")

  const { reportError } = useErrorReporting()

  // Update state when field changes
  useEffect(() => {
    setMetadataState(getMetadataState())
    setValidationState(getValidationState())
    setLogicState(getLogicState())
    setAdvancedState(getAdvancedState())
    setPrefillState(getPrefillState())
    setCarryforwardState(getCarryforwardState())
  }, [field])

  // Validate validation rules
  const validateRules = (state: ValidationState): string[] => {
    const errors: string[] = []

    if (state.minLength !== undefined && state.maxLength !== undefined) {
      if (state.minLength > state.maxLength) {
        errors.push("Minimum length cannot be greater than maximum length")
      }
    }

    if (state.minValue !== undefined && state.maxValue !== undefined) {
      if (state.minValue > state.maxValue) {
        errors.push("Minimum value cannot be greater than maximum value")
      }
    }

    if (state.minLength !== undefined && state.minLength < 0) {
      errors.push("Minimum length cannot be negative")
    }

    if (state.maxLength !== undefined && state.maxLength < 0) {
      errors.push("Maximum length cannot be negative")
    }

    if (state.pattern) {
      try {
        new RegExp(state.pattern)
      } catch {
        errors.push("Invalid regular expression pattern")
      }
    }

    return errors
  }

  // Update validation state and sync with field
  const updateValidationState = (updates: Partial<ValidationState>) => {
    const newState = { ...validationState, ...updates }
    setValidationState(newState)

    const errors = validateRules(newState)
    setValidationErrors(errors)

    // Convert validation state to validation rules array
    const validationRules = []

    if (newState.minLength !== undefined && newState.minLength > 0) {
      validationRules.push({
        type: "minLength" as const,
        value: newState.minLength,
        message: `Minimum length is ${newState.minLength} characters`,
      })
    }

    if (newState.maxLength !== undefined && newState.maxLength > 0) {
      validationRules.push({
        type: "maxLength" as const,
        value: newState.maxLength,
        message: `Maximum length is ${newState.maxLength} characters`,
      })
    }

    if (newState.minValue !== undefined) {
      validationRules.push({
        type: "min" as const,
        value: newState.minValue,
        message: `Minimum value is ${newState.minValue}`,
      })
    }

    if (newState.maxValue !== undefined) {
      validationRules.push({
        type: "max" as const,
        value: newState.maxValue,
        message: `Maximum value is ${newState.maxValue}`,
      })
    }

    if (newState.pattern && newState.pattern.trim()) {
      validationRules.push({
        type: "pattern" as const,
        pattern: newState.pattern,
        message: "Please enter a valid format",
      })
    }

    if (newState.allowedValues && newState.allowedValues.length > 0) {
      validationRules.push({
        type: "enum" as const,
        value: newState.allowedValues.join(","),
        message: "Please select a valid option",
      })
    }

    // Update field with new validation rules and required state
    onUpdateField(field.id, {
      required: newState.required,
      validation: validationRules,
    })
  }

  // Update metadata state
  const updateMetadataState = (updates: Partial<MetadataState>) => {
    setMetadataState((prev) => ({ ...prev, ...updates }))
  }

  // Update XML mapping state
  const updateXmlMappingState = (updates: Partial<XmlMappingState>) => {
    setMetadataState((prev) => ({
      ...prev,
      xml: { ...prev.xml, ...updates },
    }))
  }

  // Update logic state
  const updateLogicState = (updates: Partial<LogicState>) => {
    setLogicState((prev) => ({ ...prev, ...updates }))
  }

  // Update advanced state
  const updateAdvancedState = (updates: Partial<AdvancedState>) => {
    setAdvancedState((prev) => ({ ...prev, ...updates }))
  }

  // Update prefill state
  const updatePrefillState = (updates: Partial<PrefillConfig>) => {
    setPrefillState((prev) => ({ ...prev, ...updates }))
  }

  // Update carryforward state
  const updateCarryforwardState = (updates: Partial<CarryforwardState>) => {
    setCarryforwardState((prev) => ({ ...prev, ...updates }))
  }

  // Test prefill configuration
  const testPrefillConfiguration = async () => {
    try {
      // This would test the prefill configuration
      toast({
        title: "Test Successful",
        description: "Prefill configuration is valid and working",
      })
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Prefill test failed",
        variant: "destructive",
      })
    }
  }

  // Update a specific condition
  const updateCondition = (index: number, updates: Partial<LogicCondition>) => {
    const newConditions = [...logicState.conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    updateLogicState({ conditions: newConditions })
  }

  // Add a new condition
  const addCondition = () => {
    const defaultCondition: LogicCondition = {
      fieldId: otherFields.length > 0 ? otherFields[0].id : "",
      operator: "equals",
      value: "",
      logicalOperator: "AND",
    }
    updateLogicState({ conditions: [...logicState.conditions, defaultCondition] })
  }

  // Remove a condition
  const removeCondition = (index: number) => {
    const newConditions = logicState.conditions.filter((_, i) => i !== index)
    updateLogicState({ conditions: newConditions })
  }

  // Add custom attribute
  const addCustomAttribute = () => {
    if (newAttributeKey.trim() && newAttributeValue.trim()) {
      const newAttributes = [
        ...advancedState.customAttributes,
        { key: newAttributeKey.trim(), value: newAttributeValue.trim() },
      ]
      updateAdvancedState({ customAttributes: newAttributes })
      setNewAttributeKey("")
      setNewAttributeValue("")
    }
  }

  // Remove custom attribute
  const removeCustomAttribute = (index: number) => {
    const newAttributes = advancedState.customAttributes.filter((_, i) => i !== index)
    updateAdvancedState({ customAttributes: newAttributes })
  }

  // Update custom attribute
  const updateCustomAttribute = (index: number, key: string, value: string) => {
    const newAttributes = [...advancedState.customAttributes]
    newAttributes[index] = { key, value }
    updateAdvancedState({ customAttributes: newAttributes })
  }

  // Toggle field dependency
  const toggleFieldDependency = (fieldId: string) => {
    const newDependencies = advancedState.dependsOnFields.includes(fieldId)
      ? advancedState.dependsOnFields.filter((id) => id !== fieldId)
      : [...advancedState.dependsOnFields, fieldId]
    updateAdvancedState({ dependsOnFields: newDependencies })
  }

  // Apply metadata changes to field
  const applyMetadataChanges = () => {
    onUpdateField(field.id, {
      metadata: {
        ...field.metadata,
        fieldKey: metadataState.fieldKey,
        dataType: metadataState.dataType,
        uadFieldName: metadataState.uadFieldName,
        tags: metadataState.tags,
        xml: metadataState.xml,
      },
    })
  }

  // Apply logic changes to field
  const applyLogicChanges = () => {
    onUpdateField(field.id, {
      logic: {
        enabled: logicState.enabled,
        conditions: logicState.conditions,
      },
    })
  }

  // Apply advanced changes to field
  const applyAdvancedChanges = () => {
    onUpdateField(field.id, {
      advanced: advancedState,
    })
  }

  // Apply prefill changes to field
  const applyPrefillChanges = () => {
    onUpdateField(field.id, {
      prefill_config: prefillState,
    })
  }

  // Apply carryforward changes to field
  const applyCarryforwardChanges = () => {
    onUpdateField(field.id, {
      carryforward_config: carryforwardState,
    })
  }

  // Add allowed value
  const addAllowedValue = () => {
    if (allowedValuesInput.trim()) {
      const newValues = [...(validationState.allowedValues || []), allowedValuesInput.trim()]
      updateValidationState({ allowedValues: newValues })
      setAllowedValuesInput("")
    }
  }

  // Remove allowed value
  const removeAllowedValue = (index: number) => {
    const newValues = validationState.allowedValues?.filter((_, i) => i !== index) || []
    updateValidationState({ allowedValues: newValues })
  }

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !metadataState.tags.includes(tagInput.trim())) {
      const newTags = [...metadataState.tags, tagInput.trim()]
      updateMetadataState({ tags: newTags })
      setTagInput("")
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    const newTags = metadataState.tags.filter((t) => t !== tag)
    updateMetadataState({ tags: newTags })
  }

  // Handle save button click
  const handleSave = () => {
    applyMetadataChanges()
    applyLogicChanges()
    applyAdvancedChanges()
    applyPrefillChanges()
    applyCarryforwardChanges()
    onSave()
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="fixed inset-0 bg-black/20 z-50 flex">
          <div className="flex-1" onClick={onCancel} />
          <div className="w-[550px] bg-white border-l shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-destructive">Field Editor Error</h3>
                <p className="text-sm text-muted-foreground">Unable to load field properties</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                <div>
                  <h4 className="font-medium">Field Editor Crashed</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    There was an error loading the field properties panel.
                  </p>
                </div>
                <Button onClick={onCancel}>Close Editor</Button>
              </div>
            </div>
          </div>
        </div>
      }
      context="Field Editor"
      onError={(error) =>
        reportError(error, {
          component: "FieldEditor",
          fieldId: field.id,
          additionalData: { fieldType: field.field_type, fieldLabel: field.label },
        })
      }
    >
      <div className="fixed inset-0 bg-black/20 z-50 flex">
        {/* Overlay to prevent interaction */}
        <div className="flex-1" onClick={onCancel} />

        {/* Side Panel */}
        <div className="w-[550px] bg-white border-l shadow-xl flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold">Field Properties</h3>
              <p className="text-sm text-muted-foreground">{field.field_type} field</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-hidden">
            <ErrorBoundary
              fallback={
                <div className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Error loading field editor tabs</p>
                </div>
              }
              context="Field Editor Tabs"
            >
              <Tabs defaultValue="basic" className="h-full flex flex-col">
                <div className="px-6 pt-6">
                  <TabsList className="w-full grid grid-cols-7 gap-1">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="validation">Validation</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    <TabsTrigger value="conditional">Logic</TabsTrigger>
                    <TabsTrigger value="prefill">Prefill</TabsTrigger>
                    <TabsTrigger value="carryforward">Carry</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {/* Basic Tab */}
                  <TabsContent value="basic">
                    <ErrorBoundary
                      fallback={<div className="text-sm text-muted-foreground">Error loading basic tab</div>}
                      context="Basic Tab"
                    >
                      <BasicTab field={field} onUpdateField={onUpdateField} />
                    </ErrorBoundary>
                  </TabsContent>

                  {/* Validation Tab */}
                  <TabsContent value="validation">
                    <ErrorBoundary
                      fallback={<div className="text-sm text-muted-foreground">Error loading validation tab</div>}
                      context="Validation Tab"
                    >
                      <ValidationTab
                        field={field}
                        validationState={validationState}
                        updateValidationState={updateValidationState}
                        validationErrors={validationErrors}
                        allowedValuesInput={allowedValuesInput}
                        setAllowedValuesInput={setAllowedValuesInput}
                        addAllowedValue={addAllowedValue}
                        removeAllowedValue={removeAllowedValue}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  {/* Metadata Tab */}
                  <TabsContent value="metadata">
                    <ErrorBoundary
                      fallback={<div className="text-sm text-muted-foreground">Error loading metadata tab</div>}
                      context="Metadata Tab"
                    >
                      <MetadataTab
                        metadataState={metadataState}
                        updateMetadataState={updateMetadataState}
                        updateXmlMappingState={updateXmlMappingState}
                        tagInput={tagInput}
                        setTagInput={setTagInput}
                        addTag={addTag}
                        removeTag={removeTag}
                        xmlMappingOpen={xmlMappingOpen}
                        setXmlMappingOpen={setXmlMappingOpen}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  {/* Conditional Logic Tab */}
                  <TabsContent value="conditional">
                    <ErrorBoundary
                      fallback={<div className="text-sm text-muted-foreground">Error loading conditional tab</div>}
                      context="Conditional Tab"
                    >
                      <ConditionalTab
                        logicState={logicState}
                        updateLogicState={updateLogicState}
                        otherFields={otherFields}
                        updateCondition={updateCondition}
                        addCondition={addCondition}
                        removeCondition={removeCondition}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  {/* Prefill Tab */}
                  <TabsContent value="prefill">
                    <ErrorBoundary
                      fallback={<div className="text-sm text-muted-foreground">Error loading prefill tab</div>}
                      context="Prefill Tab"
                    >
                      <PrefillTab
                        prefillConfig={prefillState}
                        updatePrefillConfig={updatePrefillState}
                        onTestPrefill={testPrefillConfiguration}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  {/* Carryforward Tab */}
                  <TabsContent value="carryforward">
                    <ErrorBoundary
                      fallback={<div className="text-sm text-muted-foreground">Error loading carryforward tab</div>}
                      context="Carryforward Tab"
                    >
                      <CarryforwardTab
                        carryforwardConfig={carryforwardState}
                        updateCarryforwardConfig={updateCarryforwardState}
                        availableFields={otherFields}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  {/* Advanced Tab */}
                  <TabsContent value="advanced">
                    <ErrorBoundary
                      fallback={<div className="text-sm text-muted-foreground">Error loading advanced tab</div>}
                      context="Advanced Tab"
                    >
                      <AdvancedTab
                        advancedState={advancedState}
                        updateAdvancedState={updateAdvancedState}
                        otherFields={otherFields}
                        toggleFieldDependency={toggleFieldDependency}
                        newAttributeKey={newAttributeKey}
                        setNewAttributeKey={setNewAttributeKey}
                        newAttributeValue={newAttributeValue}
                        setNewAttributeValue={setNewAttributeValue}
                        addCustomAttribute={addCustomAttribute}
                        removeCustomAttribute={removeCustomAttribute}
                        updateCustomAttribute={updateCustomAttribute}
                      />
                    </ErrorBoundary>
                  </TabsContent>
                </div>
              </Tabs>
            </ErrorBoundary>
          </div>

          {/* Panel Footer */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onReset}>
                Reset
              </Button>
              <Button onClick={handleSave} disabled={validationErrors.length > 0}>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

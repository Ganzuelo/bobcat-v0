"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { BasicTab } from "./field-editor/basic-tab"
import { ValidationTab } from "./field-editor/validation-tab"
import { AdvancedTab } from "./field-editor/advanced-tab"
import { ConditionalTab } from "./field-editor/conditional-tab"
import { PrefillTab } from "./field-editor/prefill-tab"
import { MetadataTab } from "./field-editor/metadata-tab"
import { SalesGridTab } from "./field-editor/sales-grid-tab"
import type { FormField } from "@/lib/form-types"
import type { ValidationState, AdvancedState } from "@/lib/field-editor-types"
import type { CarryforwardState } from "./field-editor/prefill-tab"
import { FileTab } from "./field-editor/file-tab"

interface FieldPropertiesModalProps {
  field: FormField | null
  isOpen: boolean
  onClose: () => void
  onSave: (fieldId: string, updates: Partial<FormField>) => void
  otherFields?: FormField[]
}

export function FieldPropertiesModal({ field, isOpen, onClose, onSave, otherFields = [] }: FieldPropertiesModalProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [localField, setLocalField] = useState<FormField | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // State for validation tab
  const [validationState, setValidationState] = useState<ValidationState>({
    required: false,
    minLength: undefined,
    maxLength: undefined,
    minValue: undefined,
    maxValue: undefined,
    pattern: "",
    allowedValues: [],
  })

  // State for advanced tab
  const [advancedState, setAdvancedState] = useState<AdvancedState>({
    visibilityMode: "visible",
    calculatedField: "",
    customOnChangeLogic: "",
    dependsOnFields: [],
    customAttributes: [],
  })

  // State for prefill tab
  const [carryforwardConfig, setCarryforwardConfig] = useState<CarryforwardState>({
    enabled: false,
    source: null,
    mode: "default",
  })

  // State for validation tab inputs
  const [allowedValuesInput, setAllowedValuesInput] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // State for advanced tab inputs
  const [newAttributeKey, setNewAttributeKey] = useState("")
  const [newAttributeValue, setNewAttributeValue] = useState("")

  // Initialize local field state when field changes
  useEffect(() => {
    if (field) {
      setLocalField({ ...field })
      setHasChanges(false)
      setActiveTab("general")

      // Initialize validation state
      setValidationState({
        required: field.required || false,
        minLength: Array.isArray(field.validation)
          ? (field.validation.find((v) => v.type === "minLength")?.value as number)
          : undefined,
        maxLength: Array.isArray(field.validation)
          ? (field.validation.find((v) => v.type === "maxLength")?.value as number)
          : undefined,
        minValue: Array.isArray(field.validation)
          ? (field.validation.find((v) => v.type === "min")?.value as number)
          : undefined,
        maxValue: Array.isArray(field.validation)
          ? (field.validation.find((v) => v.type === "max")?.value as number)
          : undefined,
        pattern: Array.isArray(field.validation)
          ? field.validation.find((v) => v.type === "pattern")?.pattern || ""
          : "",
        allowedValues: Array.isArray(field.validation)
          ? (field.validation.find((v) => v.type === "allowedValues")?.value as string[]) || []
          : [],
      })

      // Initialize advanced state
      setAdvancedState({
        visibilityMode: field.metadata?.visibilityMode || "visible",
        calculatedField: field.calculated_config?.formula || "",
        customOnChangeLogic: field.metadata?.customOnChangeLogic || "",
        dependsOnFields: field.metadata?.dependsOnFields || [],
        customAttributes: field.metadata?.customAttributes || [],
      })

      // Initialize carryforward config
      setCarryforwardConfig({
        enabled: field.carryforward_config?.enabled || false,
        source: field.carryforward_config?.source || null,
        mode: field.carryforward_config?.mode || "default",
      })
    }
  }, [field])

  // Handle field changes
  const handleFieldChange = (fieldId: string, updates: Partial<FormField>) => {
    if (localField && localField.id === fieldId) {
      setLocalField({ ...localField, ...updates })
      setHasChanges(true)
    }
  }

  // Handle validation state updates
  const updateValidationState = (updates: Partial<ValidationState>) => {
    setValidationState((prev) => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  // Handle advanced state updates
  const updateAdvancedState = (updates: Partial<AdvancedState>) => {
    setAdvancedState((prev) => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  // Handle carryforward config updates
  const updateCarryforwardConfig = (updates: Partial<CarryforwardState>) => {
    setCarryforwardConfig((prev) => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  // Handle prefill config updates
  const updatePrefillConfig = (updates: any) => {
    if (localField) {
      const updatedField = {
        ...localField,
        prefill_config: {
          ...localField.prefill_config,
          ...updates,
        },
      }
      setLocalField(updatedField)
      setHasChanges(true)
    }
  }

  // Validation tab helper functions
  const addAllowedValue = () => {
    if (allowedValuesInput.trim()) {
      const newValues = [...(validationState.allowedValues || []), allowedValuesInput.trim()]
      updateValidationState({ allowedValues: newValues })
      setAllowedValuesInput("")
    }
  }

  const removeAllowedValue = (index: number) => {
    const newValues = validationState.allowedValues?.filter((_, i) => i !== index) || []
    updateValidationState({ allowedValues: newValues })
  }

  // Advanced tab helper functions
  const toggleFieldDependency = (fieldId: string) => {
    const currentDeps = advancedState.dependsOnFields || []
    const newDeps = currentDeps.includes(fieldId)
      ? currentDeps.filter((id) => id !== fieldId)
      : [...currentDeps, fieldId]
    updateAdvancedState({ dependsOnFields: newDeps })
  }

  const addCustomAttribute = () => {
    if (newAttributeKey.trim() && newAttributeValue.trim()) {
      const newAttributes = [
        ...(advancedState.customAttributes || []),
        { key: newAttributeKey.trim(), value: newAttributeValue.trim() },
      ]
      updateAdvancedState({ customAttributes: newAttributes })
      setNewAttributeKey("")
      setNewAttributeValue("")
    }
  }

  const removeCustomAttribute = (index: number) => {
    const newAttributes = advancedState.customAttributes?.filter((_, i) => i !== index) || []
    updateAdvancedState({ customAttributes: newAttributes })
  }

  const updateCustomAttribute = (index: number, key: string, value: string) => {
    const newAttributes = [...(advancedState.customAttributes || [])]
    newAttributes[index] = { key, value }
    updateAdvancedState({ customAttributes: newAttributes })
  }

  // Handle save
  const handleSave = () => {
    if (!localField) return

    // Convert validation state to validation array
    const validationRules = []
    if (validationState.required) {
      validationRules.push({ type: "required", message: "This field is required" })
    }
    if (validationState.minLength) {
      validationRules.push({ type: "minLength", value: validationState.minLength })
    }
    if (validationState.maxLength) {
      validationRules.push({ type: "maxLength", value: validationState.maxLength })
    }
    if (validationState.minValue !== undefined) {
      validationRules.push({ type: "min", value: validationState.minValue })
    }
    if (validationState.maxValue !== undefined) {
      validationRules.push({ type: "max", value: validationState.maxValue })
    }
    if (validationState.pattern) {
      validationRules.push({ type: "pattern", pattern: validationState.pattern })
    }
    if (validationState.allowedValues && validationState.allowedValues.length > 0) {
      validationRules.push({ type: "allowedValues", value: validationState.allowedValues })
    }

    // Merge all state into the final field update
    const updates: Partial<FormField> = {
      ...localField,
      required: validationState.required,
      validation: validationRules,
      metadata: {
        ...localField.metadata,
        visibilityMode: advancedState.visibilityMode,
        customOnChangeLogic: advancedState.customOnChangeLogic,
        dependsOnFields: advancedState.dependsOnFields,
        customAttributes: advancedState.customAttributes,
      },
      calculated_config: {
        ...localField.calculated_config,
        enabled: !!advancedState.calculatedField,
        formula: advancedState.calculatedField,
      },
      carryforward_config: carryforwardConfig,
    }

    onSave(localField.id, updates)
    onClose()
  }

  // Handle cancel
  const handleCancel = () => {
    setHasChanges(false)
    onClose()
  }

  // Handle test prefill
  const handleTestPrefill = () => {
    console.log("Testing prefill configuration...")
    // Implementation for testing prefill
  }

  if (!field || !localField) return null

  // Determine if we should show the Sales Grid tab
  const showSalesGridTab =
    localField.field_type?.toLowerCase() === "sales_grid" || localField.type?.toLowerCase() === "sales_grid"

  const showFileTab = localField.field_type?.toLowerCase() === "file" || localField.type?.toLowerCase() === "file"

  const availableTabs = [
    { id: "general", label: "General" },
    { id: "validation", label: "Validation" },
    { id: "prefill", label: "Prefill" },
    ...(showSalesGridTab ? [{ id: "grid", label: "Grid Settings" }] : []),
    ...(showFileTab ? [{ id: "file", label: "File Settings" }] : []),
    { id: "conditional", label: "Conditional" },
    { id: "advanced", label: "Advanced" },
    { id: "metadata", label: "Metadata" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] max-h-[900px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <span>Field Properties: {localField.label}</span>
            <Badge variant="secondary">{localField.field_type}</Badge>
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Unsaved changes
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className={`grid w-full grid-cols-${availableTabs.length} flex-shrink-0`}>
              {availableTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <div className="pr-4 pb-4">
                <TabsContent value="general" className="mt-0">
                  <BasicTab field={localField} onChange={handleFieldChange} />
                </TabsContent>

                <TabsContent value="validation" className="mt-0">
                  <ValidationTab
                    field={localField}
                    validationState={validationState}
                    updateValidationState={updateValidationState}
                    validationErrors={validationErrors}
                    allowedValuesInput={allowedValuesInput}
                    setAllowedValuesInput={setAllowedValuesInput}
                    addAllowedValue={addAllowedValue}
                    removeAllowedValue={removeAllowedValue}
                  />
                </TabsContent>

                <TabsContent value="prefill" className="mt-0">
                  <PrefillTab
                    prefillConfig={localField.prefill_config || { enabled: false, source: "internal" }}
                    updatePrefillConfig={updatePrefillConfig}
                    onTestPrefill={handleTestPrefill}
                    carryforwardConfig={carryforwardConfig}
                    updateCarryforwardConfig={updateCarryforwardConfig}
                    availableFields={otherFields.map((f) => ({
                      id: f.id,
                      label: f.label,
                      field_type: f.field_type,
                    }))}
                  />
                </TabsContent>

                {showSalesGridTab && (
                  <TabsContent value="grid" className="mt-0">
                    <SalesGridTab field={localField} onChange={handleFieldChange} />
                  </TabsContent>
                )}

                {showFileTab && (
                  <TabsContent value="file" className="mt-0">
                    <FileTab field={localField} onChange={handleFieldChange} />
                  </TabsContent>
                )}

                <TabsContent value="conditional" className="mt-0">
                  <ConditionalTab field={localField} onChange={handleFieldChange} />
                </TabsContent>

                <TabsContent value="advanced" className="mt-0">
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
                </TabsContent>

                <TabsContent value="metadata" className="mt-0">
                  <MetadataTab field={localField} onChange={handleFieldChange} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0 flex justify-between border-t pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            {hasChanges && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

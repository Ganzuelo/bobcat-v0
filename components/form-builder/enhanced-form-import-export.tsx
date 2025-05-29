"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { EnhancedImportModal } from "./enhanced-import-modal"
import { formStructureToExportFormat, downloadJson, generateExportFilename } from "@/lib/form-import-export"
import type { FormStructure } from "@/lib/database-types"
import { Download, Upload, Undo2 } from "lucide-react"
import { showErrorToast } from "@/lib/error-toast-utils"
import {
  analyzeImport,
  mergeFormStructures,
  convertImportToFormStructure,
  type ImportAnalysis,
  ImportMode,
  validateEnhancedImportForm,
  formatValidationErrors,
  type ValidatedImportForm,
} from "@/lib/enhanced-form-import"
import { ImportModeModal } from "./import-mode-modal"
import { ConflictResolutionModal } from "./conflict-resolution-modal"

interface EnhancedFormImportExportProps {
  formStructure: FormStructure
  onImport: (formStructure: FormStructure) => void
}

export function EnhancedFormImportExport({ formStructure, onImport }: EnhancedFormImportExportProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [importData, setImportData] = useState<FormStructure | null>(null)
  const [importFormData, setImportFormData] = useState<ValidatedImportForm | null>(null)
  const [previousFormState, setPreviousFormState] = useState<FormStructure | null>(null)
  const [canRestore, setCanRestore] = useState(false)

  const [showImportModeModal, setShowImportModeModal] = useState(false)
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [importAnalysis, setImportAnalysis] = useState<ImportAnalysis | null>(null)
  const [selectedImportMode, setSelectedImportMode] = useState<ImportMode>(ImportMode.OVERWRITE)

  const handleExport = () => {
    try {
      console.log("📤 Starting form export...")

      // Check if formStructure is valid
      if (!formStructure || !formStructure.form) {
        showErrorToast(toast, "Export Failed", "No form data available to export")
        return
      }

      const exportData = formStructureToExportFormat(formStructure)
      const filename = generateExportFilename(formStructure.form.title)
      downloadJson(exportData, filename)

      toast({
        title: "✅ Form Exported",
        description: `Successfully exported "${formStructure.form.title}" as JSON`,
      })
      console.log("✅ Export successful")
    } catch (error) {
      console.error("❌ Export error:", error)
      showErrorToast(toast, "Export Failed", "There was an error exporting your form. Check console for details.")
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("📁 File selected:", file.name)

    // Check file type
    if (!file.name.endsWith(".json")) {
      showErrorToast(toast, "Invalid File Type", "Please select a JSON file (.json)")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        console.log("📖 Reading file contents...")

        // Parse JSON
        let jsonData: unknown
        try {
          jsonData = JSON.parse(event.target?.result as string)
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError)
          showErrorToast(
            toast,
            "Invalid JSON",
            "The uploaded file contains invalid JSON. Please check the file format.",
          )
          return
        }

        console.log("🔍 Validating form structure...")

        // Validate the form structure
        const validationResult = validateEnhancedImportForm(jsonData)

        if (!validationResult.success) {
          console.error("❌ Validation failed:", validationResult.errors)
          showErrorToast(toast, "Import Failed", formatValidationErrors(validationResult.errors))
          return
        }

        console.log("✅ Validation successful, preparing import...")

        // Store current form state for potential recovery
        if (formStructure) {
          setPreviousFormState(formStructure)
        }

        // After successful validation, check if form exists
        const formExists = formStructure?.form?.id === validationResult.data.id

        if (formExists) {
          // Analyze import for conflicts
          const analysis = analyzeImport(validationResult.data, formStructure, ImportMode.APPEND_SECTIONS)

          // Show import mode modal
          setImportAnalysis(analysis)
          setShowImportModeModal(true)
        } else {
          // New form, proceed with direct import
          const newFormStructure = convertImportToFormStructure(validationResult.data)
          setImportData(newFormStructure)
          setImportFormData(validationResult.data!)
          setShowConfirmation(true)
        }
      } catch (error) {
        console.error("❌ Import error:", error)
        showErrorToast(
          toast,
          "Import Failed",
          "There was an unexpected error processing the file. Check console for details.",
        )
      }
    }

    reader.onerror = () => {
      console.error("❌ File read error")
      showErrorToast(toast, "File Read Error", "Could not read the selected file. Please try again.")
    }

    reader.readAsText(file)

    // Reset the file input
    e.target.value = ""
  }

  const handleConfirmImport = () => {
    if (importData && importFormData) {
      try {
        console.log("🔄 Importing form...")
        onImport(importData)
        setCanRestore(true)

        toast({
          title: "✅ Form Imported Successfully",
          description: `"${importFormData.name}" has been imported with ${importFormData.pages.length} pages.`,
        })

        console.log("✅ Import successful")
      } catch (error) {
        console.error("❌ Import application error:", error)
        showErrorToast(
          toast,
          "Import Failed",
          "Failed to apply the imported form. You can restore your previous form if needed.",
        )
      }
    }

    // Clean up
    setImportData(null)
    setImportFormData(null)
    setShowConfirmation(false)
  }

  const handleCancelImport = () => {
    console.log("❌ Import cancelled by user")
    setImportData(null)
    setImportFormData(null)
    setShowConfirmation(false)
    setShowImportModeModal(false)
    setShowConflictModal(false)
    setImportAnalysis(null)
  }

  const handleRestore = () => {
    if (previousFormState) {
      console.log("🔄 Restoring previous form state...")
      onImport(previousFormState)
      setCanRestore(false)
      setPreviousFormState(null)

      toast({
        title: "✅ Form Restored",
        description: "Your previous form has been restored successfully.",
      })
    }
  }

  // Calculate form statistics for display
  const getFormStats = () => {
    if (!importFormData) return { name: "", formType: "", pageCount: 0, sectionCount: 0, fieldCount: 0 }

    const pageCount = importFormData.pages?.length || 0
    const sectionCount = importFormData.pages?.reduce((acc, page) => acc + (page.sections?.length || 0), 0) || 0
    const fieldCount =
      importFormData.pages?.reduce(
        (acc, page) =>
          acc + (page.sections?.reduce((secAcc, section) => secAcc + (section.fields?.length || 0), 0) || 0),
        0,
      ) || 0

    return {
      name: importFormData.name || "",
      formType: importFormData.formType || "",
      pageCount,
      sectionCount,
      fieldCount,
    }
  }

  // Safe check for existing form with proper null/undefined handling
  const hasExistingForm =
    formStructure?.pages?.some((page) => page?.sections?.some((section) => section?.fields?.length > 0)) || false

  // Don't render if formStructure is not available
  if (!formStructure) {
    return null
  }

  const handleImportModeSelected = (mode: ImportMode) => {
    setSelectedImportMode(mode)
    setShowImportModeModal(false)

    if (importAnalysis?.conflicts?.length) {
      setShowConflictModal(true)
    } else {
      applyImport(mode)
    }
  }

  const handleConflictResolution = (resolvedData: any) => {
    setShowConflictModal(false)
    applyImport(selectedImportMode, resolvedData)
  }

  const applyImport = (mode: ImportMode, resolvedData?: any) => {
    if (!importFormData) return

    let finalImportData = importFormData

    if (resolvedData) {
      // Apply conflict resolutions
      finalImportData = {
        ...importFormData,
        pages: resolvedData.pages,
      }
    }

    // Use mergeFormStructures for proper merging logic
    const newFormStructure =
      mode === ImportMode.OVERWRITE
        ? convertImportToFormStructure(finalImportData)
        : mergeFormStructures(finalImportData, formStructure, mode, resolvedData?.conflictResolutions || {})

    onImport(newFormStructure)
    setCanRestore(true)

    toast({
      title: "✅ Form Imported Successfully",
      description: `"${finalImportData.name}" has been imported with ${finalImportData.pages.length} pages.`,
    })

    // Clean up
    setImportData(null)
    setImportFormData(null)
    setImportAnalysis(null)
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
        <Button variant="outline" size="sm" onClick={handleImportClick} className="flex items-center gap-1">
          <Upload className="h-4 w-4" />
          Import JSON
        </Button>
        {canRestore && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestore}
            className="flex items-center gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <Undo2 className="h-4 w-4" />
            Restore Previous
          </Button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />
      </div>

      <EnhancedImportModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={handleConfirmImport}
        onCancel={handleCancelImport}
        formData={getFormStats()}
        hasExistingForm={hasExistingForm}
      />

      <ImportModeModal
        open={showImportModeModal}
        onOpenChange={setShowImportModeModal}
        onConfirm={handleImportModeSelected}
        onCancel={handleCancelImport}
        importData={importFormData!}
        analysis={importAnalysis!}
        hasExistingForm={!!formStructure}
      />

      <ConflictResolutionModal
        open={showConflictModal}
        onOpenChange={setShowConflictModal}
        onResolve={handleConflictResolution}
        onCancel={handleCancelImport}
        conflicts={importAnalysis?.conflicts || []}
      />
    </>
  )
}

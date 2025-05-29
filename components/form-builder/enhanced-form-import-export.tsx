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
  validateModularImport,
  analyzeModularImport,
  mergeModularImport,
  formatModularValidationErrors,
  type ModularImportData,
  type ModularImportAnalysis,
  ImportMode,
} from "@/lib/modular-form-import"
import { ModularImportModal } from "./modular-import-modal"

interface EnhancedFormImportExportProps {
  formStructure: FormStructure
  onImport: (formStructure: FormStructure) => void
}

export function EnhancedFormImportExport({ formStructure, onImport }: EnhancedFormImportExportProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [importData, setImportData] = useState<FormStructure | null>(null)
  const [previousFormState, setPreviousFormState] = useState<FormStructure | null>(null)
  const [canRestore, setCanRestore] = useState(false)

  const [showModularImportModal, setShowModularImportModal] = useState(false)
  const [modularImportData, setModularImportData] = useState<ModularImportData | null>(null)
  const [modularImportAnalysis, setModularImportAnalysis] = useState<ModularImportAnalysis | null>(null)

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

        console.log("🔍 Validating modular import structure...")

        // Validate using the new modular import system
        const validationResult = validateModularImport(jsonData)

        if (!validationResult.success) {
          console.error("❌ Validation failed:", validationResult.errors)
          showErrorToast(toast, "Import Failed", formatModularValidationErrors(validationResult.errors))
          return
        }

        console.log("✅ Validation successful, analyzing import...")

        // Store current form state for potential recovery
        if (formStructure) {
          setPreviousFormState(formStructure)
        }

        // Analyze the import
        const analysis = analyzeModularImport(validationResult.data!, formStructure, ImportMode.APPEND_SECTIONS)

        // Store the validated import data and analysis
        setModularImportData(validationResult.data!)
        setModularImportAnalysis(analysis)

        // Show the modular import modal
        setShowModularImportModal(true)
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

  const handleCancelImport = () => {
    console.log("❌ Import cancelled by user")
    setImportData(null)
    setShowConfirmation(false)
    setShowModularImportModal(false)
    setModularImportData(null)
    setModularImportAnalysis(null)
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

  const handleModularImportConfirm = (mode: ImportMode, targetPageId?: string) => {
    if (!modularImportData) return

    try {
      console.log("🔄 Applying modular import...")

      // Merge the import with the existing form
      const mergedForm = mergeModularImport(modularImportData, formStructure, mode, targetPageId)

      // Apply the merged form
      onImport(mergedForm)
      setCanRestore(true)

      // Show success message
      const importTypeLabel = modularImportData.type.replace("_", " ")
      toast({
        title: "✅ Import Successful",
        description: `Successfully imported ${importTypeLabel} using ${mode.replace("_", " ")} mode.`,
      })

      console.log("✅ Modular import successful")
    } catch (error) {
      console.error("❌ Import application error:", error)
      showErrorToast(
        toast,
        "Import Failed",
        "Failed to apply the imported content. You can restore your previous form if needed.",
      )
    }

    // Clean up
    setShowModularImportModal(false)
    setModularImportData(null)
    setModularImportAnalysis(null)
  }

  // Safe check for existing form with proper null/undefined handling
  const hasExistingForm =
    formStructure?.pages?.some((page) => page?.sections?.some((section) => section?.fields?.length > 0)) || false

  // Don't render if formStructure is not available
  if (!formStructure) {
    return null
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

      {/* Legacy import modal for backward compatibility */}
      <EnhancedImportModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={() => {}}
        onCancel={handleCancelImport}
        formData={{ name: "", formType: "", pageCount: 0, sectionCount: 0, fieldCount: 0 }}
        hasExistingForm={hasExistingForm}
      />

      {/* New modular import modal */}
      {modularImportData && modularImportAnalysis && (
        <ModularImportModal
          open={showModularImportModal}
          onOpenChange={setShowModularImportModal}
          onConfirm={handleModularImportConfirm}
          onCancel={handleCancelImport}
          importData={modularImportData}
          analysis={modularImportAnalysis}
          existingForm={formStructure}
        />
      )}
    </>
  )
}

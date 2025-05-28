"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { EnhancedImportModal } from "./enhanced-import-modal"
import {
  formStructureToExportFormat,
  importFormatToFormStructure,
  downloadJson,
  generateExportFilename,
} from "@/lib/form-import-export"
import { validateImportForm, formatValidationErrors, type ValidatedImportForm } from "@/lib/form-import-validation"
import type { FormStructure } from "@/lib/database-types"
import { Download, Upload, Undo2 } from "lucide-react"
import { showErrorToast } from "@/lib/error-toast-utils"

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
        const validationResult = validateImportForm(jsonData)

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

        // Convert to internal format
        const newFormStructure = importFormatToFormStructure(validationResult.data!)
        setImportData(newFormStructure)
        setImportFormData(validationResult.data!)

        setShowConfirmation(true)
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
    </>
  )
}

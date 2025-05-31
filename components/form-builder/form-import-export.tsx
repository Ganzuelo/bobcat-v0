"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ImportConfirmationModal } from "./import-confirmation-modal"
import {
  formStructureToExportFormat,
  importFormatToFormStructure,
  downloadJson,
  generateExportFilename,
  ImportFormSchema,
} from "@/lib/form-import-export"
import type { FormStructure } from "@/lib/database-types"
import { Download, Upload } from "lucide-react"

interface FormImportExportProps {
  formStructure: FormStructure
  onImport: (formStructure: FormStructure) => void
}

export function FormImportExport({ formStructure, onImport }: FormImportExportProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [importData, setImportData] = useState<FormStructure | null>(null)

  const handleExport = () => {
    try {
      const exportData = formStructureToExportFormat(formStructure)
      const filename = generateExportFilename(formStructure.form.title)
      downloadJson(exportData, filename)

      toast({
        title: "Form Exported",
        description: `Successfully exported "${formStructure.form.title}" as JSON`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your form",
        variant: "destructive",
      })
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)

        // Validate the JSON structure
        const validationResult = ImportFormSchema.safeParse(json)

        if (!validationResult.success) {
          console.error("Validation errors:", validationResult.error)
          toast({
            title: "Invalid Form Structure",
            description: "The uploaded file does not match the expected form structure",
            variant: "destructive",
          })
          return
        }

        // Convert to internal format
        const newFormStructure = importFormatToFormStructure(validationResult.data)
        setImportData(newFormStructure)
        setShowConfirmation(true)
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: "Import Failed",
          description: "There was an error parsing the JSON file",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset the file input
    e.target.value = ""
  }

  const handleConfirmImport = () => {
    if (importData) {
      onImport(importData)
      setShowConfirmation(false)
      setImportData(null)

      toast({
        title: "Form Imported",
        description: `Successfully imported "${importData.form.title}"`,
      })
    }
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
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      </div>

      <ImportConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={handleConfirmImport}
        formName={importData?.form.title || ""}
      />
    </>
  )
}

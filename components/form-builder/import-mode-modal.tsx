"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangle, FileText, Layers, Grid3X3, RefreshCw, Plus, Replace } from "lucide-react"
import { ImportMode, type ImportAnalysis, type ValidatedImportForm } from "@/lib/enhanced-form-import"
import { useState } from "react"

interface ImportModeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (mode: ImportMode) => void
  onCancel: () => void
  importData: ValidatedImportForm
  analysis: ImportAnalysis
  hasExistingForm: boolean
}

export function ImportModeModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  importData,
  analysis,
  hasExistingForm,
}: ImportModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<ImportMode>(
    hasExistingForm ? ImportMode.APPEND_SECTIONS : ImportMode.OVERWRITE,
  )

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm(selectedMode)
    onOpenChange(false)
  }

  const getModeDescription = (mode: ImportMode) => {
    switch (mode) {
      case ImportMode.OVERWRITE:
        return "Replace the entire form with the imported one. All existing content will be lost."
      case ImportMode.APPEND_SECTIONS:
        return "Add new sections to existing pages. Skip sections that already exist."
      case ImportMode.REPLACE_MATCHING_SECTIONS:
        return "Replace sections with matching IDs, add new sections, keep other existing sections."
    }
  }

  const getModeIcon = (mode: ImportMode) => {
    switch (mode) {
      case ImportMode.OVERWRITE:
        return <RefreshCw className="h-4 w-4" />
      case ImportMode.APPEND_SECTIONS:
        return <Plus className="h-4 w-4" />
      case ImportMode.REPLACE_MATCHING_SECTIONS:
        return <Replace className="h-4 w-4" />
    }
  }

  const hasConflicts = analysis.conflicts.length > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <AlertDialogTitle>Import Form Sections</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Import Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {importData.name}
                    <Badge variant="secondary">{importData.formType}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3 w-3 text-muted-foreground" />
                      <span>{importData.pages.length} pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Grid3X3 className="h-3 w-3 text-muted-foreground" />
                      <span>{analysis.summary.newSections + analysis.summary.replacedSections} sections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span>{analysis.summary.totalFields} fields</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conflicts Warning */}
              {hasConflicts && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      Conflicts Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {analysis.conflicts.slice(0, 3).map((conflict, index) => (
                        <div key={index} className="text-sm text-amber-700">
                          • {conflict.message}
                        </div>
                      ))}
                      {analysis.conflicts.length > 3 && (
                        <div className="text-sm text-amber-600">
                          ... and {analysis.conflicts.length - 3} more conflicts
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Import Mode Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Choose import mode:</Label>
                <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as ImportMode)}>
                  {/* Overwrite Mode */}
                  <div className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value={ImportMode.OVERWRITE} id="overwrite" className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="overwrite"
                        className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {getModeIcon(ImportMode.OVERWRITE)}
                        Overwrite Entire Form
                        {!hasExistingForm && (
                          <Badge variant="outline" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </Label>
                      <p className="text-xs text-muted-foreground">{getModeDescription(ImportMode.OVERWRITE)}</p>
                    </div>
                  </div>

                  {/* Append Mode */}
                  {hasExistingForm && (
                    <div className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value={ImportMode.APPEND_SECTIONS} id="append" className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="append"
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {getModeIcon(ImportMode.APPEND_SECTIONS)}
                          Append New Sections
                          {hasConflicts && (
                            <Badge variant="destructive" className="text-xs">
                              Conflicts
                            </Badge>
                          )}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {getModeDescription(ImportMode.APPEND_SECTIONS)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Replace Mode */}
                  {hasExistingForm && (
                    <div className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value={ImportMode.REPLACE_MATCHING_SECTIONS} id="replace" className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="replace"
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {getModeIcon(ImportMode.REPLACE_MATCHING_SECTIONS)}
                          Replace Matching Sections
                          <Badge variant="outline" className="text-xs">
                            Recommended
                          </Badge>
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {getModeDescription(ImportMode.REPLACE_MATCHING_SECTIONS)}
                        </p>
                      </div>
                    </div>
                  )}
                </RadioGroup>
              </div>

              {/* Import Preview */}
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Import Preview</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-green-600">Will Add:</div>
                      <div className="text-muted-foreground">
                        {analysis.summary.newPages} pages, {analysis.summary.newSections} sections
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-600">Will Replace:</div>
                      <div className="text-muted-foreground">
                        {selectedMode === ImportMode.REPLACE_MATCHING_SECTIONS ? analysis.summary.replacedSections : 0}{" "}
                        sections
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!analysis.canProceed}
            className={selectedMode === ImportMode.OVERWRITE ? "bg-amber-600 hover:bg-amber-700" : ""}
          >
            {selectedMode === ImportMode.OVERWRITE ? "Overwrite Form" : "Import Sections"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

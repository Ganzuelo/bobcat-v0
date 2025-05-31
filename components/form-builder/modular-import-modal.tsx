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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, FileText, Layers, Grid3X3, RefreshCw, Plus, Replace, Target } from "lucide-react"
import {
  ImportMode,
  ImportType,
  type ModularImportAnalysis,
  type ModularImportData,
  getImportTypeDescription,
} from "@/lib/modular-form-import"
import type { FormStructure } from "@/lib/database-types"
import { useState } from "react"

interface ModularImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (mode: ImportMode, targetPageId?: string) => void
  onCancel: () => void
  importData: ModularImportData | null
  analysis: ModularImportAnalysis | null
  existingForm: FormStructure | null
}

export function ModularImportModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  importData,
  analysis,
  existingForm,
}: ModularImportModalProps) {
  const [selectedMode, setSelectedMode] = useState<ImportMode>(
    existingForm ? ImportMode.APPEND_SECTIONS : ImportMode.OVERWRITE,
  )
  const [targetPageId, setTargetPageId] = useState<string>("")

  // Safety check - if we don't have valid data, don't render the modal
  if (!importData || !analysis) {
    return null
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm(selectedMode, targetPageId || undefined)
    onOpenChange(false)
  }

  const getModeDescription = (mode: ImportMode) => {
    switch (mode) {
      case ImportMode.OVERWRITE:
        return "Replace the entire form with the imported content. All existing content will be lost."
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

  // Safely check for conflicts
  const hasConflicts = analysis?.conflicts?.length > 0 || false

  // Get summary data with fallbacks
  const summary = analysis?.summary || {
    newPages: 0,
    newSections: 0,
    replacedSections: 0,
    totalFields: 0,
  }

  const requiresTargetPage = analysis.requiresTargetPage && existingForm
  const availablePages = existingForm?.pages || []

  // Get import content description
  const getImportContentDescription = () => {
    switch (importData.type) {
      case ImportType.FULL_FORM:
        return `${importData.data.pages.length} pages`
      case ImportType.PAGES_ONLY:
        return `${importData.data.pages.length} pages`
      case ImportType.SECTIONS_ONLY:
        return `${importData.data.sections.length} sections`
      case ImportType.SINGLE_SECTION:
        return `1 section: "${importData.data.title}"`
      default:
        return "Unknown content"
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <AlertDialogTitle>Import Form Content</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Import Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {importData.type === ImportType.FULL_FORM ? importData.data.name : "Modular Import"}
                    <Badge variant="secondary">{importData.type.replace("_", " ")}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">{getImportTypeDescription(importData.type)}</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3 text-muted-foreground" />
                        <span>{getImportContentDescription()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="h-3 w-3 text-muted-foreground" />
                        <span>{summary.newSections + summary.replacedSections} sections</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span>{summary.totalFields} fields</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Helpful message about modular imports */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="text-sm text-blue-700">
                    💡 <strong>Modular Import:</strong> You can import a full form or just pages/sections to add to an
                    existing form. This supports scaffold-style development for UAD 3.6 forms.
                  </div>
                </CardContent>
              </Card>

              {/* Target Page Selection for sections-only imports */}
              {requiresTargetPage && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                      <Target className="h-4 w-4" />
                      Select Target Page
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="text-sm text-amber-700">Choose which page to add the imported sections to:</div>
                      <Select value={targetPageId} onValueChange={setTargetPageId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a page or create new..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="create-new-page">Create new page</SelectItem>
                          {availablePages.map((page) => (
                            <SelectItem key={page.id} value={page.id}>
                              {page.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                <Label className="text-sm font-medium">Choose import strategy:</Label>
                <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as ImportMode)}>
                  {/* Overwrite Mode - only for full forms or when no existing form */}
                  {(importData.type === ImportType.FULL_FORM || !existingForm) && (
                    <div className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value={ImportMode.OVERWRITE} id="overwrite" className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="overwrite"
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {getModeIcon(ImportMode.OVERWRITE)}
                          Overwrite Entire Form
                          {!existingForm && (
                            <Badge variant="outline" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </Label>
                        <p className="text-xs text-muted-foreground">{getModeDescription(ImportMode.OVERWRITE)}</p>
                      </div>
                    </div>
                  )}

                  {/* Append Mode */}
                  {existingForm && (
                    <div className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value={ImportMode.APPEND_SECTIONS} id="append" className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="append"
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {getModeIcon(ImportMode.APPEND_SECTIONS)}
                          Append New Content
                          {hasConflicts && (
                            <Badge variant="destructive" className="text-xs">
                              Conflicts
                            </Badge>
                          )}
                          {!hasConflicts && (
                            <Badge variant="outline" className="text-xs">
                              Recommended
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
                  {existingForm && (
                    <div className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value={ImportMode.REPLACE_MATCHING_SECTIONS} id="replace" className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="replace"
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {getModeIcon(ImportMode.REPLACE_MATCHING_SECTIONS)}
                          Replace Matching Content
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
                        {summary.newPages} pages, {summary.newSections} sections
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-600">Will Replace:</div>
                      <div className="text-muted-foreground">
                        {selectedMode === ImportMode.REPLACE_MATCHING_SECTIONS ? summary.replacedSections : 0} sections
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
            {selectedMode === ImportMode.OVERWRITE ? "Overwrite Form" : "Import Content"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

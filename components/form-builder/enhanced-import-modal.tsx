"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, FileText, Layers, Grid3X3 } from "lucide-react"

interface EnhancedImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  formData: {
    name: string
    formType: string
    pageCount: number
    sectionCount: number
    fieldCount: number
  }
  hasExistingForm: boolean
}

export function EnhancedImportModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  formData,
  hasExistingForm,
}: EnhancedImportModalProps) {
  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {hasExistingForm && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            <AlertDialogTitle>{hasExistingForm ? "Replace Current Form?" : "Import Form"}</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {hasExistingForm && (
                <p className="text-amber-600 bg-amber-50 p-3 rounded-md text-sm">
                  ⚠️ This will replace your current form. All unsaved changes will be lost.
                </p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formData.name}</span>
                  <Badge variant="secondary">{formData.formType}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-muted-foreground" />
                    <span>{formData.pageCount} pages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Grid3X3 className="h-3 w-3 text-muted-foreground" />
                    <span>{formData.sectionCount} sections</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span>{formData.fieldCount} fields</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {hasExistingForm ? "Are you sure you want to continue?" : "Do you want to import this form?"}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={hasExistingForm ? "bg-amber-600 hover:bg-amber-700" : ""}
          >
            {hasExistingForm ? "Replace Form" : "Import Form"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

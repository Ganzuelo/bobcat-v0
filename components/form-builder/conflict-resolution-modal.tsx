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
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { useState } from "react"
import type { ImportConflict } from "@/lib/enhanced-form-import"

interface ConflictResolutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve: (resolutions: { conflictResolutions: Record<string, string>; pages?: any[] }) => void
  onCancel: () => void
  conflicts: ImportConflict[]
}

export function ConflictResolutionModal({
  open,
  onOpenChange,
  onResolve,
  onCancel,
  conflicts,
}: ConflictResolutionModalProps) {
  const [resolutions, setResolutions] = useState<Record<string, "skip" | "overwrite" | "rename">>({})

  // Safety check - if we don't have valid conflicts, don't render the modal
  if (!conflicts || conflicts.length === 0) {
    return null
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  const handleResolve = () => {
    onResolve({ conflictResolutions: resolutions })
    onOpenChange(false)
  }

  const handleResolutionChange = (conflictKey: string, value: "skip" | "overwrite" | "rename") => {
    setResolutions((prev) => ({
      ...prev,
      [conflictKey]: value,
    }))
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Resolve Import Conflicts</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Please resolve the following conflicts before proceeding with the import.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-[400px] overflow-y-auto space-y-4 py-2">
          {conflicts.map((conflict, index) => {
            const conflictKey = `${conflict.pageId}-${conflict.sectionId}`
            return (
              <Card key={index} className="border-amber-200">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-amber-700">{conflict.message}</div>

                    <RadioGroup
                      value={resolutions[conflictKey] || conflict.suggestedAction}
                      onValueChange={(value) =>
                        handleResolutionChange(conflictKey, value as "skip" | "overwrite" | "rename")
                      }
                    >
                      <div className="flex items-start space-x-3 space-y-0">
                        <RadioGroupItem value="skip" id={`skip-${index}`} />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={`skip-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Skip
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Keep the existing section and ignore the imported one.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 space-y-0">
                        <RadioGroupItem value="overwrite" id={`overwrite-${index}`} />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={`overwrite-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Overwrite
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Replace the existing section with the imported one.
                          </p>
                        </div>
                      </div>

                      {conflict.suggestedAction === "rename" && (
                        <div className="flex items-start space-x-3 space-y-0">
                          <RadioGroupItem value="rename" id={`rename-${index}`} />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor={`rename-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Rename
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Import as a new section with a different ID.
                            </p>
                          </div>
                        </div>
                      )}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleResolve}>Apply Resolutions</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

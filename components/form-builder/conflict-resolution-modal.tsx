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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertTriangle, FileText, SkipForward, RefreshCw, Edit } from "lucide-react"
import type { ImportConflict } from "@/lib/enhanced-form-import"
import { useState } from "react"

interface ConflictResolutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve: (resolutions: Record<string, "skip" | "overwrite" | "rename">) => void
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
  const [newNames, setNewNames] = useState<Record<string, string>>({})

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  const handleResolve = () => {
    onResolve(resolutions)
    onOpenChange(false)
  }

  const getConflictKey = (conflict: ImportConflict) => {
    return `${conflict.pageId}-${conflict.sectionId}`
  }

  const setResolution = (conflictKey: string, resolution: "skip" | "overwrite" | "rename") => {
    setResolutions((prev) => ({ ...prev, [conflictKey]: resolution }))
  }

  const setNewName = (conflictKey: string, name: string) => {
    setNewNames((prev) => ({ ...prev, [conflictKey]: name }))
  }

  const getResolutionIcon = (resolution: "skip" | "overwrite" | "rename") => {
    switch (resolution) {
      case "skip":
        return <SkipForward className="h-4 w-4" />
      case "overwrite":
        return <RefreshCw className="h-4 w-4" />
      case "rename":
        return <Edit className="h-4 w-4" />
    }
  }

  const allConflictsResolved = conflicts.every((conflict) => {
    const key = getConflictKey(conflict)
    const resolution = resolutions[key]
    return resolution && (resolution !== "rename" || newNames[key])
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Resolve Import Conflicts</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            The following conflicts were detected during import. Please choose how to resolve each one.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {conflicts.map((conflict, index) => {
            const conflictKey = getConflictKey(conflict)
            const currentResolution = resolutions[conflictKey] || conflict.suggestedAction

            return (
              <Card key={index} className="border-amber-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Conflict {index + 1}: {conflict.type.replace("_", " ")}
                  </CardTitle>
                  <CardDescription className="text-sm">{conflict.message}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Choose resolution:</Label>
                    <RadioGroup
                      value={currentResolution}
                      onValueChange={(value) => setResolution(conflictKey, value as "skip" | "overwrite" | "rename")}
                    >
                      {/* Skip Option */}
                      <div className="flex items-start space-x-3 space-y-0">
                        <RadioGroupItem value="skip" id={`skip-${index}`} className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={`skip-${index}`}
                            className="flex items-center gap-2 text-sm font-medium leading-none"
                          >
                            {getResolutionIcon("skip")}
                            Skip this section
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Keep the existing section, don't import this one
                          </p>
                        </div>
                      </div>

                      {/* Overwrite Option */}
                      <div className="flex items-start space-x-3 space-y-0">
                        <RadioGroupItem value="overwrite" id={`overwrite-${index}`} className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={`overwrite-${index}`}
                            className="flex items-center gap-2 text-sm font-medium leading-none"
                          >
                            {getResolutionIcon("overwrite")}
                            Replace existing section
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Replace the existing section with the imported one
                          </p>
                        </div>
                      </div>

                      {/* Rename Option */}
                      <div className="flex items-start space-x-3 space-y-0">
                        <RadioGroupItem value="rename" id={`rename-${index}`} className="mt-1" />
                        <div className="grid gap-1.5 leading-none w-full">
                          <Label
                            htmlFor={`rename-${index}`}
                            className="flex items-center gap-2 text-sm font-medium leading-none"
                          >
                            {getResolutionIcon("rename")}
                            Rename and import both
                          </Label>
                          <p className="text-xs text-muted-foreground mb-2">
                            Give the imported section a new ID and keep both sections
                          </p>
                          {currentResolution === "rename" && (
                            <Input
                              placeholder="Enter new section name"
                              value={newNames[conflictKey] || ""}
                              onChange={(e) => setNewName(conflictKey, e.target.value)}
                              className="text-sm"
                            />
                          )}
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel Import
          </Button>
          <Button onClick={handleResolve} disabled={!allConflictsResolved}>
            Apply Resolutions
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

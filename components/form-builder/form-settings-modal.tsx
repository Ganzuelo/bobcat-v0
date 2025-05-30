"use client"

import { useState, useEffect, useRef } from "react"
import { runFormDiagnostics, type DiagnosticReport } from "@/lib/form-diagnostics"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus, Loader2, Bug, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import type { Form } from "@/lib/database-types"
import { FORM_TYPES, FORM_STATUSES } from "@/lib/form-constants"

interface FormSettingsModalProps {
  open: boolean
  onClose: () => void
  form: Form
  onUpdate: (updates: Partial<Form>) => void
}

export function FormSettingsModal({ open, onClose, form, onUpdate }: FormSettingsModalProps) {
  // Local form state for editing
  const [localForm, setLocalForm] = useState<Form>(form)
  const [newTag, setNewTag] = useState("")
  const [diagnostics, setDiagnostics] = useState<DiagnosticReport | null>(null)
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Height measurement refs and state
  const [modalHeight, setModalHeight] = useState(600)
  const generalTabRef = useRef<HTMLDivElement>(null)
  const metadataTabRef = useRef<HTMLDivElement>(null)
  const diagnosticsTabRef = useRef<HTMLDivElement>(null)

  // Reset local form state when modal opens or form prop changes
  useEffect(() => {
    if (open) {
      setLocalForm(form)
      setNewTag("")
      setDiagnostics(null)
    }
  }, [open, form])

  // Measure tab heights and set modal height
  useEffect(() => {
    if (open) {
      const measureHeight = () => {
        const heights = [
          generalTabRef.current?.getBoundingClientRect().height || 0,
          metadataTabRef.current?.getBoundingClientRect().height || 0,
          diagnosticsTabRef.current?.getBoundingClientRect().height || 0,
        ]
        const maxHeight = Math.max(...heights, 600) // 600px minimum
        setModalHeight(maxHeight)
      }

      // Delay measurement to ensure content is rendered
      const timer = setTimeout(measureHeight, 100)
      return () => clearTimeout(timer)
    }
  }, [open, diagnostics]) // Re-measure when diagnostics change

  const updateLocalForm = (updates: Partial<Form>) => {
    setLocalForm((prev) => ({ ...prev, ...updates }))
  }

  const addTag = () => {
    if (newTag.trim() && !localForm.tags.includes(newTag.trim())) {
      updateLocalForm({
        tags: [...localForm.tags, newTag.trim()],
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateLocalForm({
      tags: localForm.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Call the parent's onUpdate with all local changes
      onUpdate(localForm)
      onClose()
    } catch (error) {
      console.error("Error saving form settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset local state and close modal
    setLocalForm(form)
    setNewTag("")
    setDiagnostics(null)
    onClose()
  }

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true)
    try {
      // Simulate async operation for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))
      const report = runFormDiagnostics(localForm)
      setDiagnostics(report)
    } catch (error) {
      console.error("Error running diagnostics:", error)
      setDiagnostics({
        status: "crashed",
        errors: [
          {
            type: "FatalError",
            message: `Diagnostic error: ${error instanceof Error ? error.message : "Unknown error"}`,
            severity: "error",
          },
        ],
        warnings: [],
        fieldCount: 0,
        sectionCount: 0,
        pageCount: 0,
        executionTime: 0,
      })
    } finally {
      setIsRunningDiagnostics(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Form Settings</DialogTitle>
          <DialogDescription>Configure your form settings, metadata, and run diagnostics.</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            </TabsList>

            <div style={{ height: modalHeight }} className="relative">
              <ScrollArea className="h-full">
                <div className="pr-4">
                  {/* General Tab */}
                  <TabsContent value="general" className="mt-0 absolute inset-0 data-[state=active]:relative">
                    <div ref={generalTabRef} className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Form Information</CardTitle>
                          <CardDescription>Basic information about your form</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="form-title">Form Title *</Label>
                            <Input
                              id="form-title"
                              value={localForm.title}
                              onChange={(e) => updateLocalForm({ title: e.target.value })}
                              placeholder="Enter form title"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="form-description">Description</Label>
                            <Textarea
                              id="form-description"
                              value={localForm.description}
                              onChange={(e) => updateLocalForm({ description: e.target.value })}
                              placeholder="Describe your form"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="form-type">Form Type</Label>
                              <Select
                                value={localForm.form_type}
                                onValueChange={(value: any) => updateLocalForm({ form_type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FORM_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="form-status">Status</Label>
                              <Select
                                value={localForm.status}
                                onValueChange={(value: any) => updateLocalForm({ status: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FORM_STATUSES.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Metadata Tab */}
                  <TabsContent value="metadata" className="mt-0 absolute inset-0 data-[state=active]:relative">
                    <div ref={metadataTabRef} className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Tags</CardTitle>
                          <CardDescription>Add tags to help organize and find your forms</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-2 min-h-[40px]">
                            {localForm.tags.length > 0 ? (
                              localForm.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                  {tag}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => removeTag(tag)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No tags added yet</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a tag"
                              onKeyPress={(e) => e.key === "Enter" && addTag()}
                            />
                            <Button onClick={addTag} size="sm" disabled={!newTag.trim()}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Version Information</CardTitle>
                          <CardDescription>Form version and metadata</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Version</Label>
                              <Input value={localForm.version || "1"} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                              <Label>Created</Label>
                              <Input
                                value={
                                  localForm.created_at
                                    ? new Date(localForm.created_at).toLocaleDateString()
                                    : "Not saved"
                                }
                                disabled
                                className="bg-muted"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Last Updated</Label>
                            <Input
                              value={localForm.updated_at ? new Date(localForm.updated_at).toLocaleString() : "Never"}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Diagnostics Tab */}
                  <TabsContent value="diagnostics" className="mt-0 absolute inset-0 data-[state=active]:relative">
                    <div ref={diagnosticsTabRef} className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Bug className="h-5 w-5" />
                            Form Diagnostics
                          </CardTitle>
                          <CardDescription>Validate form structure and detect potential issues</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Button onClick={handleRunDiagnostics} disabled={isRunningDiagnostics} className="w-full">
                            {isRunningDiagnostics ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Running Diagnostics...
                              </>
                            ) : (
                              <>
                                <Bug className="mr-2 h-4 w-4" />
                                Run Diagnostics
                              </>
                            )}
                          </Button>

                          {diagnostics && (
                            <div className="space-y-4">
                              {/* Summary */}
                              <div className="flex items-center gap-2">
                                {diagnostics.status === "passed" && diagnostics.warnings.length === 0 && (
                                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    No Issues Found
                                  </Badge>
                                )}
                                {diagnostics.status === "passed" && diagnostics.warnings.length > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-yellow-100 text-yellow-800 border-yellow-200"
                                  >
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    {diagnostics.warnings.length} Warning(s)
                                  </Badge>
                                )}
                                {diagnostics.status === "failed" && (
                                  <Badge variant="destructive">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    {diagnostics.errors.length} Error(s)
                                  </Badge>
                                )}
                                {diagnostics.status === "crashed" && (
                                  <Badge variant="destructive">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Crashed
                                  </Badge>
                                )}
                              </div>

                              {/* Stats */}
                              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                <strong>Form Statistics:</strong> {diagnostics.pageCount} pages,{" "}
                                {diagnostics.sectionCount} sections, {diagnostics.fieldCount} fields
                                <br />
                                <strong>Execution Time:</strong> {diagnostics.executionTime}ms
                              </div>

                              {/* Errors */}
                              {diagnostics.errors.map((error, i) => (
                                <Alert key={`error-${i}`} variant="destructive">
                                  <XCircle className="h-4 w-4" />
                                  <AlertTitle>{error.type}</AlertTitle>
                                  <AlertDescription>
                                    {error.message}
                                    {error.fieldLabel && (
                                      <div className="mt-1 text-xs">
                                        Field:{" "}
                                        <code className="bg-destructive/10 px-1 rounded">{error.fieldLabel}</code>
                                      </div>
                                    )}
                                    {error.sectionTitle && (
                                      <div className="mt-1 text-xs">
                                        Section:{" "}
                                        <code className="bg-destructive/10 px-1 rounded">{error.sectionTitle}</code>
                                      </div>
                                    )}
                                    {error.pageTitle && (
                                      <div className="mt-1 text-xs">
                                        Page: <code className="bg-destructive/10 px-1 rounded">{error.pageTitle}</code>
                                      </div>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              ))}

                              {/* Warnings */}
                              {diagnostics.warnings.map((warning, i) => (
                                <Alert
                                  key={`warning-${i}`}
                                  variant="default"
                                  className="border-yellow-200 bg-yellow-50"
                                >
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  <AlertTitle className="text-yellow-800">{warning.type}</AlertTitle>
                                  <AlertDescription className="text-yellow-700">
                                    {warning.message}
                                    {warning.fieldLabel && (
                                      <div className="mt-1 text-xs">
                                        Field: <code className="bg-yellow-100 px-1 rounded">{warning.fieldLabel}</code>
                                      </div>
                                    )}
                                    {warning.sectionTitle && (
                                      <div className="mt-1 text-xs">
                                        Section:{" "}
                                        <code className="bg-yellow-100 px-1 rounded">{warning.sectionTitle}</code>
                                      </div>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              ))}

                              {/* Success message */}
                              {diagnostics.status === "passed" &&
                                diagnostics.errors.length === 0 &&
                                diagnostics.warnings.length === 0 && (
                                  <Alert variant="default" className="border-green-200 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-green-800">All Good!</AlertTitle>
                                    <AlertDescription className="text-green-700">
                                      Your form structure is valid and ready to use. No issues detected.
                                    </AlertDescription>
                                  </Alert>
                                )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>

          {/* Save and Cancel Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

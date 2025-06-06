"use client"

import { useState } from "react"
import { runFormDiagnostics, type DiagnosticReport } from "@/lib/form-diagnostics"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Plus, Loader2, Bug, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import type { Form } from "@/lib/database-types"
import { FORM_TYPES, FORM_STATUSES } from "@/lib/form-constants"

interface FormSettingsPanelProps {
  form: Form
  onUpdate: (updates: Partial<Form>) => void
}

export function FormSettingsPanel({ form, onUpdate }: FormSettingsPanelProps) {
  const [newTag, setNewTag] = useState("")
  const [diagnostics, setDiagnostics] = useState<DiagnosticReport | null>(null)
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      onUpdate({
        tags: [...form.tags, newTag.trim()],
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    onUpdate({
      tags: form.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true)
    try {
      // Simulate async operation for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))
      const report = runFormDiagnostics(form)
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
    <div className="space-y-6 p-6">
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
              value={form.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Enter form title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={form.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Describe your form"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-type">Form Type</Label>
            <Select value={form.form_type} onValueChange={(value: any) => onUpdate({ form_type: value })}>
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
            <Select value={form.status} onValueChange={(value: any) => onUpdate({ status: value })}>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Add tags to help organize and find your forms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
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
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === "Enter" && addTag()}
            />
            <Button onClick={addTag} size="sm">
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
              <Input value={form.version} disabled />
            </div>
            <div className="space-y-2">
              <Label>Created</Label>
              <Input value={form.created_at ? new Date(form.created_at).toLocaleDateString() : "Not saved"} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

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
              <>🧪 Run Diagnostics</>
            )}
          </Button>

          {diagnostics && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-2">
                {diagnostics.status === "passed" && diagnostics.warnings.length === 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />✅ No Issues Found
                  </Badge>
                )}
                {diagnostics.status === "passed" && diagnostics.warnings.length > 0 && (
                  <Badge variant="secondary">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    ⚠️ {diagnostics.warnings.length} Warning(s)
                  </Badge>
                )}
                {diagnostics.status === "failed" && (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />❌ {diagnostics.errors.length} Error(s)
                  </Badge>
                )}
                {diagnostics.status === "crashed" && (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />💥 Crashed
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="text-sm text-muted-foreground">
                {diagnostics.pageCount} pages, {diagnostics.sectionCount} sections, {diagnostics.fieldCount} fields •
                Completed in {diagnostics.executionTime}ms
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
                        Field: <code className="bg-muted px-1 rounded">{error.fieldLabel}</code>
                      </div>
                    )}
                    {error.sectionTitle && (
                      <div className="mt-1 text-xs">
                        Section: <code className="bg-muted px-1 rounded">{error.sectionTitle}</code>
                      </div>
                    )}
                    {error.pageTitle && (
                      <div className="mt-1 text-xs">
                        Page: <code className="bg-muted px-1 rounded">{error.pageTitle}</code>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}

              {/* Warnings */}
              {diagnostics.warnings.map((warning, i) => (
                <Alert key={`warning-${i}`} variant="default" className="border-yellow-200 bg-yellow-50">
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
                        Section: <code className="bg-yellow-100 px-1 rounded">{warning.sectionTitle}</code>
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
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"
import type { Form } from "@/lib/database-types"
import { FORM_TYPES, FORM_STATUSES } from "@/lib/form-constants"

interface FormSettingsPanelProps {
  form: Form
  onUpdate: (updates: Partial<Form>) => void
}

export function FormSettingsPanel({ form, onUpdate }: FormSettingsPanelProps) {
  const [newTag, setNewTag] = useState("")

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
    </div>
  )
}

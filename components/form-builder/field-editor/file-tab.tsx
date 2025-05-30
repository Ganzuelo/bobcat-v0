"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { FormField } from "@/lib/form-types"

interface FileTabProps {
  field: FormField
  onChange: (fieldId: string, updates: Partial<FormField>) => void
}

export function FileTab({ field, onChange }: FileTabProps) {
  const [newFileType, setNewFileType] = useState("")

  const handleFieldUpdate = (updates: Partial<FormField>) => {
    onChange(field.id, updates)
  }

  const addAllowedFileType = () => {
    if (newFileType.trim()) {
      const currentTypes = field.accept?.split(",").map((t) => t.trim()) || []
      const newTypes = [...currentTypes, newFileType.trim()]
      handleFieldUpdate({ accept: newTypes.join(", ") })
      setNewFileType("")
    }
  }

  const removeAllowedFileType = (typeToRemove: string) => {
    const currentTypes = field.accept?.split(",").map((t) => t.trim()) || []
    const newTypes = currentTypes.filter((type) => type !== typeToRemove)
    handleFieldUpdate({ accept: newTypes.join(", ") })
  }

  const allowedTypes =
    field.accept
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean) || []

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">File Upload Settings</h3>

        {/* Upload Location */}
        <div className="space-y-2">
          <Label htmlFor="uploadLocation">Upload Location</Label>
          <Select
            value={field.uploadLocation || "default"}
            onValueChange={(value) => handleFieldUpdate({ uploadLocation: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select upload location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Storage</SelectItem>
              <SelectItem value="documents">Documents Folder</SelectItem>
              <SelectItem value="images">Images Folder</SelectItem>
              <SelectItem value="attachments">Attachments Folder</SelectItem>
              <SelectItem value="temp">Temporary Storage</SelectItem>
              <SelectItem value="secure">Secure Storage</SelectItem>
              <SelectItem value="custom">Custom Path</SelectItem>
            </SelectContent>
          </Select>
          {field.uploadLocation === "custom" && (
            <Input
              placeholder="Enter custom path (e.g., /uploads/forms/)"
              value={field.customUploadPath || ""}
              onChange={(e) => handleFieldUpdate({ customUploadPath: e.target.value })}
            />
          )}
        </div>

        {/* Multiple Files */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Allow Multiple Files</Label>
            <p className="text-sm text-muted-foreground">Allow users to select and upload multiple files at once</p>
          </div>
          <Switch
            checked={field.multiple || false}
            onCheckedChange={(checked) => handleFieldUpdate({ multiple: checked })}
          />
        </div>

        {/* File Size Limit */}
        <div className="space-y-2">
          <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
          <Input
            id="maxFileSize"
            type="number"
            placeholder="10"
            value={field.maxFileSize || ""}
            onChange={(e) => handleFieldUpdate({ maxFileSize: Number.parseInt(e.target.value) || undefined })}
          />
        </div>

        {/* Allowed File Types */}
        <div className="space-y-2">
          <Label>Allowed File Types</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., .pdf, .jpg, image/*"
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addAllowedFileType()}
            />
            <Button onClick={addAllowedFileType} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {allowedTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {allowedTypes.map((type, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <button
                    onClick={() => removeAllowedFileType(type)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Common types: .pdf, .doc, .docx, .jpg, .png, .gif, image/*, application/pdf
          </p>
        </div>

        {/* Storage Options */}
        <div className="space-y-2">
          <Label>Storage Configuration</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Virus Scanning</Label>
                <p className="text-xs text-muted-foreground">Scan uploaded files for viruses</p>
              </div>
              <Switch
                checked={field.virusScanning || false}
                onCheckedChange={(checked) => handleFieldUpdate({ virusScanning: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Auto-delete</Label>
                <p className="text-xs text-muted-foreground">Delete files after form submission</p>
              </div>
              <Switch
                checked={field.autoDelete || false}
                onCheckedChange={(checked) => handleFieldUpdate({ autoDelete: checked })}
              />
            </div>
          </div>
        </div>

        {/* Preview Settings */}
        <div className="space-y-2">
          <Label>Preview Options</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show File Preview</Label>
              <Switch
                checked={field.showPreview || false}
                onCheckedChange={(checked) => handleFieldUpdate({ showPreview: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Progress Bar</Label>
              <Switch
                checked={field.showProgress || false}
                onCheckedChange={(checked) => handleFieldUpdate({ showProgress: checked })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

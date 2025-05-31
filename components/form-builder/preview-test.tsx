"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

export function PreviewTest() {
  const [previewMode, setPreviewMode] = useState(false)

  return (
    <div className="p-8 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Preview Button Test</h2>

      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => setPreviewMode(!previewMode)}
          variant={previewMode ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {previewMode ? "Exit Preview" : "Preview"}
        </Button>

        <div className="text-sm">
          Current mode: <span className="font-bold">{previewMode ? "Preview" : "Edit"}</span>
        </div>
      </div>

      <div className="p-4 border rounded bg-gray-50">
        {previewMode ? (
          <div className="text-green-600">This is the preview mode content</div>
        ) : (
          <div className="text-blue-600">This is the edit mode content</div>
        )}
      </div>
    </div>
  )
}

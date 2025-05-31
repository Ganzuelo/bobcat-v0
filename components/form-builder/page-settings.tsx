"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { Page } from "./types"

interface PageSettingsProps {
  page: Page
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
}

const PageSettings = ({ page, onTitleChange, onDescriptionChange }: PageSettingsProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(page.title)
  const [description, setDescription] = useState(page.description)

  const handleSave = () => {
    onTitleChange(title)
    onDescriptionChange(description)
    setIsEditing(false)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Page Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="page-title" className="text-sm font-medium">
                Page Title
              </label>
              <Input id="page-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label htmlFor="page-description" className="text-sm font-medium">
                Page Description
              </label>
              <Textarea
                id="page-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Page Title</h3>
              <p>{page.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Page Description</h3>
              <p>{page.description || "No description"}</p>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PageSettings

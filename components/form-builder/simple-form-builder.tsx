"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

interface SimpleFormBuilderProps {
  formId?: string
}

export function SimpleFormBuilder({ formId }: SimpleFormBuilderProps) {
  const [title, setTitle] = useState("New Form")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    console.log("SimpleFormBuilder mounted")
  }, [])

  const testFunction = () => {
    console.log("Test function called")
    alert("Test function works!")
  }

  const saveForm = async () => {
    console.log("Save form clicked")

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Form title is required",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error("Failed to get current user")
      }

      if (!user) {
        throw new Error("You must be logged in to save forms")
      }

      console.log("Current user:", user.id)

      // Form data
      const formData = {
        title,
        description,
        form_type: "custom",
        status: "draft",
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Saving form data:", formData)

      // Save to database
      const { data, error } = await supabase.from("forms").insert(formData).select().single()

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      console.log("Form saved successfully:", data)

      toast({
        title: "Success",
        description: "Form saved successfully",
      })
    } catch (error) {
      console.error("Error saving form:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save form",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Simple Form Builder</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testFunction}>
            Test Button
          </Button>
          <Button onClick={saveForm} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Form Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter form title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter form description"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

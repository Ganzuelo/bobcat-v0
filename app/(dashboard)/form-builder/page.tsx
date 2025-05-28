"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GripVertical, Eye, Save, FileText } from "lucide-react"

interface FormField {
  id: string
  type: "text" | "number" | "email" | "textarea" | "select" | "checkbox" | "date"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export default function FormBuilderPage() {
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formType, setFormType] = useState<"urar" | "custom" | "inspection">("custom")
  const [fields, setFields] = useState<FormField[]>([])

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      ...(type === "select" && { options: ["Option 1", "Option 2"] }),
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const urarTemplate = () => {
    const urarFields: FormField[] = [
      { id: "property_address", type: "text", label: "Property Address", required: true },
      { id: "property_city", type: "text", label: "City", required: true },
      { id: "property_state", type: "text", label: "State", required: true },
      { id: "property_zip", type: "text", label: "ZIP Code", required: true },
      { id: "borrower_name", type: "text", label: "Borrower Name", required: true },
      { id: "lender_name", type: "text", label: "Lender Name", required: true },
      { id: "appraiser_name", type: "text", label: "Appraiser Name", required: true },
      { id: "appraiser_license", type: "text", label: "Appraiser License", required: true },
      { id: "appraisal_date", type: "date", label: "Appraisal Date", required: true },
      { id: "property_value", type: "number", label: "Property Value ($)", required: true },
      { id: "loan_amount", type: "number", label: "Loan Amount ($)", required: true },
      {
        id: "property_type",
        type: "select",
        label: "Property Type",
        required: true,
        options: ["Single Family", "Condo", "Townhouse", "Multi Family"],
      },
      {
        id: "occupancy_type",
        type: "select",
        label: "Occupancy Type",
        required: true,
        options: ["Owner Occupied", "Investment", "Second Home"],
      },
    ]
    setFields(urarFields)
    setFormName("URAR - Uniform Residential Appraisal Report")
    setFormDescription("Standard residential appraisal report form")
    setFormType("urar")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form Builder</h1>
          <p className="text-muted-foreground">Create and customize forms with drag-and-drop functionality</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Form
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Form Configuration</CardTitle>
              <CardDescription>Set up your form's basic information and type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Form Name</Label>
                <Input
                  id="form-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter form name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-description">Description</Label>
                <Textarea
                  id="form-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe your form"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-type">Form Type</Label>
                <Select value={formType} onValueChange={(value: any) => setFormType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Form</SelectItem>
                    <SelectItem value="urar">URAR Report</SelectItem>
                    <SelectItem value="inspection">Property Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={urarTemplate} variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Load URAR Template
              </Button>
            </CardContent>
          </Card>

          {/* Field Types */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Field Types</CardTitle>
              <CardDescription>Drag or click to add fields to your form</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: "text", label: "Text" },
                  { type: "number", label: "Number" },
                  { type: "email", label: "Email" },
                  { type: "textarea", label: "Textarea" },
                  { type: "select", label: "Select" },
                  { type: "checkbox", label: "Checkbox" },
                  { type: "date", label: "Date" },
                ].map((fieldType) => (
                  <Button
                    key={fieldType.type}
                    variant="outline"
                    size="sm"
                    onClick={() => addField(fieldType.type as FormField["type"])}
                    className="justify-start"
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    {fieldType.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Fields</CardTitle>
              <CardDescription>Configure your form fields and their properties</CardDescription>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No fields added yet</p>
                  <p className="text-sm">Add fields from the panel on the left</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move" />

                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{field.type}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => removeField(field.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Field Label</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Placeholder</Label>
                              <Input
                                value={field.placeholder || ""}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                placeholder="Enter placeholder text"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`required-${field.id}`}
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`required-${field.id}`}>Required field</Label>
                          </div>

                          {field.type === "select" && (
                            <div className="space-y-2">
                              <Label>Options (one per line)</Label>
                              <Textarea
                                value={field.options?.join("\n") || ""}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    options: e.target.value.split("\n").filter(Boolean),
                                  })
                                }
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FIELD_CATEGORIES, CATEGORIZED_FIELDS } from "@/lib/form-types"
import { PRESET_CATEGORIES, type PresetField, getComplianceLabel } from "@/lib/field-presets"
import { Search, Shield } from "lucide-react"
import { useState } from "react"

interface FieldPaletteProps {
  onAddField: (fieldType: string) => void
  onAddPresetField?: (presetFieldId: string) => void
}

export function FieldPalette({ onAddField, onAddPresetField }: FieldPaletteProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<string>(FIELD_CATEGORIES.BASIC)

  const handleAddField = (fieldType: string) => {
    console.log("Adding field:", fieldType)
    onAddField(fieldType)
  }

  const handleAddPresetField = (presetFieldId: string) => {
    console.log("Adding preset field:", presetFieldId)
    onAddPresetField?.(presetFieldId)
  }

  // Filter fields based on search term
  const filterFields = (fields: string[]) => {
    if (!searchTerm) return fields
    return fields.filter((field) => field.replace(/_/g, " ").toLowerCase().includes(searchTerm.toLowerCase()))
  }

  // Filter preset fields based on search term
  const filterPresetFields = (fields: PresetField[]) => {
    if (!searchTerm) return fields
    return fields.filter(
      (field) =>
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.label.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  // Get field width badge color
  const getWidthBadgeColor = (width?: string) => {
    switch (width) {
      case "quarter":
        return "bg-blue-100 text-blue-800"
      case "half":
        return "bg-green-100 text-green-800"
      case "full":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <TooltipProvider>
      <div className="w-96 border-r bg-gradient-to-b from-gray-50 to-white p-4 flex flex-col h-full overflow-y-auto shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Form Elements</h2>

        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search elements..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue={FIELD_CATEGORIES.BASIC} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value={FIELD_CATEGORIES.BASIC}>Basic</TabsTrigger>
            <TabsTrigger value={FIELD_CATEGORIES.LAYOUT}>Layout</TabsTrigger>
            <TabsTrigger value={FIELD_CATEGORIES.ADVANCED}>Advanced</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          {/* Existing field type tabs */}
          {Object.entries(FIELD_CATEGORIES).map(([categoryKey, categoryName]) => {
            const filteredFields = filterFields(CATEGORIZED_FIELDS[categoryName])

            return (
              <TabsContent key={categoryKey} value={categoryName} className="space-y-2">
                {filteredFields.length === 0 && searchTerm && (
                  <p className="text-sm text-gray-500 text-center py-4">No matching elements found</p>
                )}

                {filteredFields.map((fieldType) => {
                  // Get field display name
                  const fieldName = fieldType
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")

                  return (
                    <Card
                      key={fieldType}
                      className="cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                      onClick={() => handleAddField(fieldType)}
                    >
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm">{fieldName}</CardTitle>
                      </CardHeader>
                    </Card>
                  )
                })}
              </TabsContent>
            )
          })}

          {/* Enhanced Presets tab with compliance support */}
          <TabsContent value="presets" className="space-y-4">
            {PRESET_CATEGORIES.map((category) => {
              const filteredFields = filterPresetFields(category.fields)

              // Hide category if no fields match search
              if (searchTerm && filteredFields.length === 0) return null

              return (
                <div key={category.id} className="space-y-2">
                  <div className="border-b border-gray-200 pb-2">
                    <h3 className="text-sm font-semibold text-gray-700">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>

                  <div className="space-y-1">
                    {filteredFields.map((field) => {
                      const complianceLabel = getComplianceLabel(field.compliance)

                      return (
                        <Card
                          key={field.id}
                          className="cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-all duration-200"
                          onClick={() => handleAddPresetField(field.id)}
                        >
                          <CardHeader className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-sm font-medium text-gray-900">{field.name}</CardTitle>
                                  {complianceLabel && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center">
                                          <Shield className="h-3 w-3 text-blue-600" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">{complianceLabel}</p>
                                        {field.compliance?.urar && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Follows URAR formatting standards
                                          </p>
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{field.label}</p>
                              </div>
                              <div className="flex flex-col gap-1">
                                {complianceLabel && (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    {complianceLabel}
                                  </Badge>
                                )}
                                {field.width && (
                                  <Badge variant="secondary" className={`text-xs ${getWidthBadgeColor(field.width)}`}>
                                    {field.width}
                                  </Badge>
                                )}
                                {field.validation && (
                                  <Badge variant="outline" className="text-xs">
                                    validated
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {searchTerm && PRESET_CATEGORIES.every((cat) => filterPresetFields(cat.fields).length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No matching preset fields found</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

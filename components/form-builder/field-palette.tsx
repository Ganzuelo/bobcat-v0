"use client"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FIELD_CATEGORIES, CATEGORIZED_FIELDS } from "@/lib/form-types"
import { PRESET_CATEGORIES, type PresetField, getPresetFieldById, getComplianceLabel } from "@/lib/field-presets"
import { Search, ShieldCheck } from "lucide-react"
import { useState } from "react"

interface FieldPaletteProps {
  onAddField: (fieldType: string) => void
  onAddPresetField?: (presetField: PresetField) => void
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
    const presetField = getPresetFieldById(presetFieldId)
    if (presetField) {
      onAddPresetField?.(presetField)
    }
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
                          className="cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-all duration-200 relative"
                          onClick={() => handleAddPresetField(field.id)}
                        >
                          <CardHeader className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 pr-6">
                                <CardTitle className="text-sm font-medium text-gray-900">{field.name}</CardTitle>
                                <p className="text-xs text-gray-500 mt-1">{field.label}</p>
                              </div>
                            </div>

                            {/* URAR Compliance Indicator */}
                            {field.compliance?.urar && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="absolute top-2 right-2">
                                    <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">URAR Compliant – Follows UAD 3.6 format</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
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

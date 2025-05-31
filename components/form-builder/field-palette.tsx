"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { FIELD_CATEGORIES, CATEGORIZED_FIELDS } from "@/lib/form-types"
import { FIELD_PRESETS, type FieldPreset } from "@/lib/field-presets"
import { Search, MapPin, User, CalendarDays, Package } from "lucide-react"
import { useState } from "react"

interface FieldPaletteProps {
  onAddField: (fieldType: string) => void
  onAddPreset?: (presetId: string) => void
}

export function FieldPalette({ onAddField, onAddPreset }: FieldPaletteProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<string>(FIELD_CATEGORIES.BASIC)

  const handleAddField = (fieldType: string) => {
    console.log("Adding field:", fieldType)
    onAddField(fieldType)
  }

  const handleAddPreset = (presetId: string) => {
    console.log("Adding preset:", presetId)
    onAddPreset?.(presetId)
  }

  // Filter fields based on search term
  const filterFields = (fields: string[]) => {
    if (!searchTerm) return fields
    return fields.filter((field) => field.replace(/_/g, " ").toLowerCase().includes(searchTerm.toLowerCase()))
  }

  // Filter presets based on search term
  const filterPresets = (presets: FieldPreset[]) => {
    if (!searchTerm) return presets
    return presets.filter(
      (preset) =>
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  // Get icon for preset
  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case "map-pin":
        return <MapPin className="h-4 w-4" />
      case "user":
        return <User className="h-4 w-4" />
      case "calendar-days":
        return <CalendarDays className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="w-72 border-r bg-gradient-to-b from-gray-50 to-white p-4 flex flex-col h-full overflow-y-auto shadow-sm">
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

        {/* New Presets tab */}
        <TabsContent value="presets" className="space-y-2">
          {filterPresets(FIELD_PRESETS).length === 0 && searchTerm && (
            <p className="text-sm text-gray-500 text-center py-4">No matching presets found</p>
          )}

          {filterPresets(FIELD_PRESETS).map((preset) => (
            <Card
              key={preset.id}
              className="cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-200"
              onClick={() => handleAddPreset(preset.id)}
            >
              <CardHeader className="p-3">
                <div className="flex items-start gap-2">
                  <div className="text-green-600 mt-0.5">{getPresetIcon(preset.icon)}</div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium text-gray-900">{preset.name}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0">
                <div className="text-xs text-gray-400">
                  {preset.fields.length} field{preset.fields.length !== 1 ? "s" : ""}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

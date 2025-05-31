"use client"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { FIELD_CATEGORIES, CATEGORIZED_FIELDS } from "@/lib/field-types"
import { Search } from "lucide-react"
import { useState } from "react"

interface FieldPaletteProps {
  onAddField: (fieldType: string) => void
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<string>(FIELD_CATEGORIES.BASIC)

  const handleAddField = (fieldType: string) => {
    console.log("Adding field:", fieldType)
    onAddField(fieldType)
  }

  // Filter fields based on search term
  const filterFields = (fields: string[]) => {
    if (!searchTerm) return fields
    return fields.filter((field) => field.replace(/_/g, " ").toLowerCase().includes(searchTerm.toLowerCase()))
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
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value={FIELD_CATEGORIES.BASIC}>Basic</TabsTrigger>
          <TabsTrigger value={FIELD_CATEGORIES.LAYOUT}>Layout</TabsTrigger>
          <TabsTrigger value={FIELD_CATEGORIES.ADVANCED}>Advanced</TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  )
}

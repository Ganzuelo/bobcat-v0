"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Search, FileText, Layout, ChevronDown, ChevronRight } from "lucide-react"
import { getFieldTypesByCategory, type FieldType, type FieldCategory } from "@/lib/form-types"
import { AddSectionModal } from "./add-section-modal"
import { AddPageModal } from "./add-page-modal"

interface FieldPaletteProps {
  onAddField: (fieldType: FieldType) => void
  onAddPage?: (pageData: { title: string; description?: string }) => void
  onAddSection?: (sectionData: { title: string; description?: string }) => void
}

const CATEGORY_LABELS: Record<FieldCategory, string> = {
  input: "Text Inputs",
  selection: "Selections",
  date: "Date & Time",
  file: "Uploads",
  interactive: "Interactive",
  location: "Location",
  calculated: "Calculated",
  layout: "Layout",
}

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "input", label: "Text Inputs" },
  { value: "selection", label: "Selections" },
  { value: "date", label: "Date & Time" },
  { value: "file", label: "Uploads" },
  { value: "interactive", label: "Interactive" },
]

export function FieldPalette({ onAddField, onAddPage, onAddSection }: FieldPaletteProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [showAddSectionModal, setShowAddSectionModal] = useState(false)
  const [showAddPageModal, setShowAddPageModal] = useState(false)

  const fieldGroups = getFieldTypesByCategory()

  const filteredGroups = useMemo(() => {
    let groups = fieldGroups

    // Apply category filter
    if (selectedFilter !== "all") {
      groups = groups.filter((group) => group.category === selectedFilter)
    }

    // Apply search filter
    if (searchQuery) {
      groups = groups
        .map((group) => ({
          ...group,
          fields: group.fields.filter(
            (field) =>
              field.config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              field.config.description.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((group) => group.fields.length > 0)
    }

    return groups
  }, [fieldGroups, selectedFilter, searchQuery])

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories)
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category)
    } else {
      newCollapsed.add(category)
    }
    setCollapsedCategories(newCollapsed)
  }

  const handleAddSection = (sectionData: { title: string; description?: string }) => {
    onAddSection?.(sectionData)
    setShowAddSectionModal(false)
  }

  const handleAddPage = (pageData: { title: string; description?: string }) => {
    onAddPage?.(pageData)
    setShowAddPageModal(false)
  }

  return (
    <>
      <div className="w-96 border-r bg-gray-50/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-white">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Builder Palette</h3>
              <p className="text-sm text-muted-foreground">Add elements to build your form</p>
            </div>

            {/* Structure Actions */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Form Structure</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => setShowAddPageModal(true)}
                  disabled={!onAddPage}
                >
                  <FileText className="h-3 w-3 mr-1.5" />
                  Add Page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => setShowAddSectionModal(true)}
                  disabled={!onAddSection}
                >
                  <Layout className="h-3 w-3 mr-1.5" />
                  Add Section
                </Button>
              </div>
            </div>

            <Separator />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search field types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            {/* Category Filters */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categories</p>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {FILTER_OPTIONS.map((option) => (
                    <Badge
                      key={option.value}
                      variant={selectedFilter === option.value ? "default" : "secondary"}
                      className={`cursor-pointer whitespace-nowrap transition-all duration-200 ${
                        selectedFilter === option.value
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "hover:bg-blue-100 hover:text-blue-800"
                      }`}
                      onClick={() => setSelectedFilter(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Field Categories */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No field types found</p>
                {searchQuery && <p className="text-xs mt-1">Try adjusting your search terms</p>}
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isCollapsed = collapsedCategories.has(group.category)

                return (
                  <Card key={group.category} className="shadow-sm border-border/50 overflow-hidden">
                    <CardHeader
                      className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleCategory(group.category)}
                    >
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <span>{CATEGORY_LABELS[group.category]}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {group.fields.length}
                          </Badge>
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>

                    {!isCollapsed && (
                      <CardContent className="pt-0 pb-4">
                        <div className="space-y-1">
                          {group.fields.map(({ type, config }) => {
                            const Icon = config.icon
                            return (
                              <Button
                                key={type}
                                variant="ghost"
                                className="w-full justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 group"
                                onClick={() => {
                                  console.log("Adding field type:", type)
                                  onAddField(type)
                                }}
                              >
                                <div className="flex items-start gap-3 w-full">
                                  <Icon className="h-4 w-4 text-blue-600 mt-1 group-hover:text-blue-700 transition-colors flex-shrink-0" />
                                  <div className="flex-1 text-left min-w-0 pr-2">
                                    <div className="font-medium text-sm text-foreground group-hover:text-blue-900 transition-colors">
                                      {config.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                      {config.description}
                                    </div>
                                  </div>
                                </div>
                              </Button>
                            )
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })
            )}

            {/* Quick Add Section */}
            {selectedFilter === "all" && !searchQuery && (
              <div className="pt-2">
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Add</h4>
                  <div className="flex flex-wrap gap-2">
                    {["text", "email", "select", "checkbox", "date", "number"].map((type) => (
                      <Badge
                        key={type}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors px-3 py-1"
                        onClick={() => onAddField(type as FieldType)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Modals */}
      <AddSectionModal open={showAddSectionModal} onOpenChange={setShowAddSectionModal} onConfirm={handleAddSection} />

      <AddPageModal open={showAddPageModal} onOpenChange={setShowAddPageModal} onConfirm={handleAddPage} />
    </>
  )
}

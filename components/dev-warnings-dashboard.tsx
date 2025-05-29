"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, AlertCircle, XCircle, X, RefreshCw } from "lucide-react"
import { devWarnings, WarningLevel, WarningCategory, type DevWarning } from "@/lib/dev-warnings"

interface DevWarningsDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export function DevWarningsDashboard({ isOpen, onClose }: DevWarningsDashboardProps) {
  const [warnings, setWarnings] = useState<DevWarning[]>([])
  const [selectedCategory, setSelectedCategory] = useState<WarningCategory | "all">("all")

  useEffect(() => {
    if (isOpen) {
      const updateWarnings = () => setWarnings(devWarnings.getWarnings())
      updateWarnings()

      // Update warnings every second while open
      const interval = setInterval(updateWarnings, 1000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const isDevelopment =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      : false

  if (!isOpen || !isDevelopment) {
    return null
  }

  const filteredWarnings =
    selectedCategory === "all" ? warnings : warnings.filter((w) => w.category === selectedCategory)

  const warningsByLevel = warnings.reduce(
    (acc, warning) => {
      acc[warning.level] = (acc[warning.level] || 0) + 1
      return acc
    },
    {} as Record<WarningLevel, number>,
  )

  const warningsByCategory = warnings.reduce(
    (acc, warning) => {
      acc[warning.category] = (acc[warning.category] || 0) + 1
      return acc
    },
    {} as Record<WarningCategory, number>,
  )

  const getWarningIcon = (level: WarningLevel) => {
    switch (level) {
      case WarningLevel.INFO:
        return <Info className="h-4 w-4 text-blue-500" />
      case WarningLevel.WARN:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case WarningLevel.ERROR:
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case WarningLevel.CRITICAL:
        return <XCircle className="h-4 w-4 text-red-700" />
    }
  }

  const getLevelColor = (level: WarningLevel) => {
    switch (level) {
      case WarningLevel.INFO:
        return "bg-blue-100 text-blue-800"
      case WarningLevel.WARN:
        return "bg-yellow-100 text-yellow-800"
      case WarningLevel.ERROR:
        return "bg-red-100 text-red-800"
      case WarningLevel.CRITICAL:
        return "bg-red-200 text-red-900"
    }
  }

  const getCategoryColor = (category: WarningCategory) => {
    const colors = {
      [WarningCategory.PERFORMANCE]: "bg-orange-100 text-orange-800",
      [WarningCategory.ACCESSIBILITY]: "bg-purple-100 text-purple-800",
      [WarningCategory.DATA_INTEGRITY]: "bg-red-100 text-red-800",
      [WarningCategory.VALIDATION]: "bg-yellow-100 text-yellow-800",
      [WarningCategory.SECURITY]: "bg-red-100 text-red-800",
      [WarningCategory.BEST_PRACTICES]: "bg-blue-100 text-blue-800",
      [WarningCategory.DEPRECATION]: "bg-gray-100 text-gray-800",
      [WarningCategory.CONFIGURATION]: "bg-green-100 text-green-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Development Warnings Dashboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                devWarnings.clearWarnings()
                setWarnings([])
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[calc(90vh-120px)]">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{warnings.length}</div>
                <div className="text-sm text-gray-600">Total Warnings</div>
              </CardContent>
            </Card>
            {Object.entries(warningsByLevel).map(([level, count]) => (
              <Card key={level}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    {getWarningIcon(level as WarningLevel)}
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{level}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All ({warnings.length})
              </Button>
              {Object.entries(warningsByCategory).map(([category, count]) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category as WarningCategory)}
                >
                  {category.replace(/-/g, " ")} ({count})
                </Button>
              ))}
            </div>
          </div>

          {/* Warnings List */}
          <div className="space-y-4">
            {filteredWarnings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  {selectedCategory === "all" ? "No warnings found" : `No ${selectedCategory} warnings found`}
                </CardContent>
              </Card>
            ) : (
              filteredWarnings.map((warning, index) => (
                <Card key={`${warning.id}-${index}`} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getWarningIcon(warning.level)}
                        <Badge className={getLevelColor(warning.level)}>{warning.level.toUpperCase()}</Badge>
                        <Badge className={getCategoryColor(warning.category)}>
                          {warning.category.replace(/-/g, " ").toUpperCase()}
                        </Badge>
                        {warning.component && <Badge variant="outline">{warning.component}</Badge>}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(warning.timestamp).toLocaleTimeString()}</div>
                    </div>

                    <div className="mb-2">
                      <div className="font-medium text-gray-900">{warning.message}</div>
                      <div className="text-sm text-gray-600 mt-1">ID: {warning.id}</div>
                    </div>

                    {warning.suggestion && (
                      <div className="mb-2 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">💡 Suggestion:</div>
                        <div className="text-sm text-blue-700">{warning.suggestion}</div>
                      </div>
                    )}

                    {warning.documentation && (
                      <div className="mb-2">
                        <a
                          href={warning.documentation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          📚 View Documentation
                        </a>
                      </div>
                    )}

                    {warning.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600">View Details</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(warning.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook to toggle the dashboard
export function useDevWarningsDashboard() {
  const [isOpen, setIsOpen] = useState(false)

  const SIDEBAR_KEYBOARD_SHORTCUT = "W"

  const toggleSidebar = () => {
    setIsOpen((prevState) => !prevState)
  }

  useEffect(() => {
    const isDevelopment =
      typeof window !== "undefined"
        ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        : false

    if (isDevelopment) {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Ctrl/Cmd + Shift + W to toggle dashboard
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  }
}

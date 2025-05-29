"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { DevWarningsDashboard, useDevWarningsDashboard } from "./dev-warnings-dashboard"
import { devWarnings } from "@/lib/dev-warnings"

const isDevelopment =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    : false

export function DevModeIndicator() {
  const { isOpen, open, close } = useDevWarningsDashboard()
  const [warningCount, setWarningCount] = React.useState(0)

  React.useEffect(() => {
    if (isDevelopment) {
      const updateCount = () => setWarningCount(devWarnings.getWarnings().length)
      updateCount()

      const interval = setInterval(updateCount, 1000)
      return () => clearInterval(interval)
    }
  }, [])

  if (!isDevelopment) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Development Mode
          </Badge>

          <Button onClick={open} variant="outline" size="sm" className="flex items-center gap-2 bg-white shadow-lg">
            <AlertTriangle className="h-4 w-4" />
            Warnings
            {warningCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {warningCount}
              </Badge>
            )}
          </Button>

          <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
            Press Ctrl+Shift+W to toggle warnings
          </div>
        </div>
      </div>

      <DevWarningsDashboard isOpen={isOpen} onClose={close} />
    </>
  )
}

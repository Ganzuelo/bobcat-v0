"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

const isDevelopment =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    : false

export function DevModeIndicator() {
  if (!isDevelopment) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="flex flex-col items-end gap-2">
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          Development Mode
        </Badge>

        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          Form Builder Active
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { AppSettingsService } from "@/lib/app-settings-service"

export function AppSettingsInitializer() {
  useEffect(() => {
    // Initialize app settings on app start
    AppSettingsService.initialize()
  }, [])

  return null // This component doesn't render anything
}

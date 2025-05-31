"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface OnboardingTipProps {
  message: string
  storageKey: string
}

export function OnboardingTip({ message, storageKey }: OnboardingTipProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if tip has been dismissed in this session
    const dismissed = sessionStorage.getItem(storageKey)
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [storageKey])

  const handleDismiss = () => {
    sessionStorage.setItem(storageKey, "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="w-full bg-muted rounded-lg p-4 shadow-sm border mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span>💡</span>
          <span>{message}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleDismiss} className="shrink-0">
          Got it
        </Button>
      </div>
    </div>
  )
}

import type React from "react"
import * as LucideIcons from "lucide-react"

// Get all available Lucide icon names
export const LUCIDE_ICON_NAMES = Object.keys(LucideIcons)
  .filter((key) => key !== "createLucideIcon" && key !== "default")
  .sort()

// Validate if an icon name exists
export function isValidLucideIcon(iconName: string): boolean {
  return LUCIDE_ICON_NAMES.includes(iconName)
}

// Get icon component by name
export function getLucideIcon(iconName: string): React.ComponentType<any> | null {
  if (!isValidLucideIcon(iconName)) {
    return null
  }
  return (LucideIcons as any)[iconName] || null
}

// Popular icon suggestions for the app
export const POPULAR_ICONS = [
  "Cat",
  "Building",
  "Home",
  "Briefcase",
  "Star",
  "Heart",
  "Shield",
  "Zap",
  "Rocket",
  "Crown",
  "Diamond",
  "Gem",
  "Target",
  "Trophy",
  "Lightbulb",
  "Compass",
  "Globe",
  "Mountain",
  "Sunrise",
  "Leaf",
]

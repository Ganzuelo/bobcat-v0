"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Settings } from "lucide-react"
import { useState } from "react"

export function PageActionButton() {
  const pathname = usePathname()
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Get the current page context
  const getPageAction = () => {
    if (pathname === "/dashboard/form-builder" || pathname === "/form-builder") {
      return {
        label: "Create Form",
        icon: Plus,
        action: () => {
          // Trigger the create form modal
          const event = new CustomEvent("openCreateFormModal")
          window.dispatchEvent(event)
        },
      }
    }

    if (pathname === "/dashboard/rules-engine" || pathname === "/rules-engine") {
      return {
        label: "New Rule",
        icon: Plus,
        action: () => {
          // Trigger the create rule modal
          const event = new CustomEvent("openCreateRuleModal")
          window.dispatchEvent(event)
        },
      }
    }

    if (pathname === "/dashboard/decision-manager" || pathname === "/decision-manager") {
      return {
        label: "Filter Decisions",
        icon: Filter,
        action: () => {
          // Trigger filter modal or functionality
          const event = new CustomEvent("openFilterModal")
          window.dispatchEvent(event)
        },
      }
    }

    if (pathname === "/dashboard/settings" || pathname === "/settings") {
      return {
        label: "Export Settings",
        icon: Settings,
        action: () => {
          // Trigger settings export
          const event = new CustomEvent("exportSettings")
          window.dispatchEvent(event)
        },
      }
    }

    if (pathname === "/dashboard/forms" || pathname === "/forms") {
      return {
        label: "Create Form",
        icon: Plus,
        action: () => router.push("/form-builder"),
      }
    }

    // Default action for other pages
    return null
  }

  const pageAction = getPageAction()

  if (!pageAction) return null

  const Icon = pageAction.icon

  return (
    <Button onClick={pageAction.action} size="sm" className="flex items-center h-9">
      <Icon className="mr-2 h-4 w-4" />
      {pageAction.label}
    </Button>
  )
}

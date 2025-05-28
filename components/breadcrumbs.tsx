"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem as UiBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useFormContext } from "@/hooks/use-form-context"
import { useRuleContext } from "@/hooks/use-rule-context"

interface BreadcrumbItem {
  label: string
  href?: string
  isCurrentPage?: boolean
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const { currentForm } = useFormContext()
  const { currentRule } = useRuleContext()
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    const generateBreadcrumbs = () => {
      const pathSegments = pathname.split("/").filter(Boolean)
      const breadcrumbItems: BreadcrumbItem[] = []

      // Always add dashboard as first item unless we're on the dashboard
      if (pathSegments[0] !== "dashboard") {
        breadcrumbItems.push({
          label: "Dashboard",
          href: "/dashboard",
        })
      }

      // Handle different routes
      if (pathSegments[0] === "dashboard") {
        breadcrumbItems.push({
          label: "Dashboard",
          isCurrentPage: true,
        })
      } else if (pathSegments[0] === "form-builder") {
        breadcrumbItems.push({
          label: "Form Builder",
          href: "/form-builder",
        })

        // If we're editing a specific form
        if (pathSegments.length > 1 && pathSegments[1] !== "new") {
          breadcrumbItems.push({
            label: currentForm?.title || "Loading...",
            isCurrentPage: true,
          })
        } else if (pathSegments.length > 1 && pathSegments[1] === "new") {
          breadcrumbItems.push({
            label: "New Form",
            isCurrentPage: true,
          })
        }
      } else if (pathSegments[0] === "rules-engine") {
        breadcrumbItems.push({
          label: "Rules Engine",
          href: "/rules-engine",
        })

        // If we're editing a specific rule
        if (pathSegments.length > 1) {
          breadcrumbItems.push({
            label: currentRule?.name || "Loading...",
            isCurrentPage: true,
          })
        }
      } else if (pathSegments[0] === "decision-manager") {
        breadcrumbItems.push({
          label: "Decision Manager",
          isCurrentPage: true,
        })
      } else if (pathSegments[0] === "settings") {
        breadcrumbItems.push({
          label: "Settings",
          isCurrentPage: true,
        })
      } else if (pathSegments[0] === "profile") {
        breadcrumbItems.push({
          label: "Profile",
          isCurrentPage: true,
        })
      }

      return breadcrumbItems
    }

    setBreadcrumbs(generateBreadcrumbs())
  }, [pathname, currentForm, currentRule])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <>
            <UiBreadcrumbItem key={`item-${index}`}>
              {item.isCurrentPage ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href || "#"}>{item.label}</BreadcrumbLink>
              )}
            </UiBreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator key={`separator-${index}`} />}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
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

      // Handle different routes
      if (pathSegments[0] === "dashboard") {
        // Don't show breadcrumbs on dashboard - return empty array
        return []
      } else if (pathSegments[0] === "form-builder") {
        breadcrumbItems.push({
          label: "Form Builder",
          href: "/form-builder",
          isCurrentPage: pathSegments.length === 1,
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
          isCurrentPage: pathSegments.length === 1,
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
      } else if (pathSegments[0] === "forms") {
        breadcrumbItems.push({
          label: "Forms",
          href: "/forms",
          isCurrentPage: pathSegments.length === 1,
        })

        if (pathSegments.length > 1) {
          if (pathSegments[2] === "edit") {
            breadcrumbItems.push({
              label: "Edit Form",
              isCurrentPage: true,
            })
          }
        }
      }

      return breadcrumbItems
    }

    setBreadcrumbs(generateBreadcrumbs())
  }, [pathname, currentForm, currentRule])

  // Don't render anything if there are no breadcrumbs (like on dashboard)
  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            {item.isCurrentPage ? (
              item.label
            ) : (
              <BreadcrumbLink key={`breadcrumb-link-${index}`} href={item.href || "#"}>
                {item.label}
              </BreadcrumbLink>
            )}
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator key={`separator-${index}`} />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

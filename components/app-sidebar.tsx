"use client"

import type React from "react"

import { Building2, FileText, Settings, Zap, BarChart3, Home } from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navigation = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Form Builder",
        url: "/form-builder",
        icon: FileText,
      },
      {
        title: "Rules Engine",
        url: "/rules-engine",
        icon: Zap,
      },
      {
        title: "Decision Manager",
        url: "/decision-manager",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <Building2 className="h-6 w-6" />
          <span className="font-semibold text-lg">Project Bobcat</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

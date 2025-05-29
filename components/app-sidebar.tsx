"use client"

import type React from "react"

import { Cat, FileText, Settings, Zap, BarChart3, Home, User, LogOut, Shield, ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CustomAvatar } from "@/components/ui/custom-avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { useSidebar } from "@/components/ui/sidebar"

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

const avatarColors = [
  "#2563eb", // blue-600
  "#059669", // emerald-600
  "#9333ea", // purple-600
  "#db2777", // pink-600
  "#4f46e5", // indigo-600
  "#d97706", // amber-600
  "#dc2626", // red-600
  "#0d9488", // teal-600
  "#ea580c", // orange-600
  "#0891b2", // cyan-600
]

function UserProfile() {
  const { user, profile, signOut } = useAuth()
  const { state } = useSidebar()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!user || !profile) return null

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getInitials = () => {
    const firstName = profile.first_name || ""
    const lastName = profile.last_name || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"
  }

  const getDisplayName = () => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    }
    return user.email?.split("@")[0] || "User"
  }

  const getAvatarColor = () => {
    const email = user.email || ""
    const hash = email.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    const colorIndex = Math.abs(hash) % avatarColors.length
    return avatarColors[colorIndex]
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-2 w-full p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors duration-200 text-left ${state === "collapsed" ? "justify-center" : ""}`}
          data-state={state}
        >
          <CustomAvatar
            src={profile.avatar_url}
            alt={getDisplayName()}
            initials={getInitials()}
            backgroundColor={getAvatarColor()}
            size="md"
          />
          {state !== "collapsed" && (
            <>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold">{getDisplayName()}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground flex-shrink-0" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
        collisionPadding={10}
        avoidCollisions={true}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <CustomAvatar
              src={profile.avatar_url}
              alt={getDisplayName()}
              initials={getInitials()}
              backgroundColor={getAvatarColor()}
              size="md"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{getDisplayName()}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        {profile.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex h-16 shrink-0 items-center justify-start border-b border-sidebar-border">
        <div className="flex h-full items-center gap-2 px-4">
          <Cat className="h-6 w-6" />
          {state !== "collapsed" && <span className="font-semibold text-lg">Project Bobcat</span>}
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
                    <SidebarMenuButton asChild tooltip={item.title}>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserProfile />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

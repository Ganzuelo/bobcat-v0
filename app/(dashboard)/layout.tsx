import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DynamicBreadcrumbs } from "@/components/breadcrumbs"
import { FormProvider } from "@/hooks/use-form-context"
import { RuleProvider } from "@/hooks/use-rule-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { MessageCircle, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <FormProvider>
        <RuleProvider>
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <DynamicBreadcrumbs />

                  {/* Right side controls */}
                  <div className="ml-auto flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageCircle className="h-4 w-4" />
                          <span className="sr-only">Feedback</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send Feedback</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">Documentation</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Documentation</p>
                      </TooltipContent>
                    </Tooltip>

                    <ThemeToggle />
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </RuleProvider>
      </FormProvider>
    </ProtectedRoute>
  )
}

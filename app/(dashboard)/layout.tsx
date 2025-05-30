import type React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Footer } from "@/components/footer"
import { FormProvider } from "@/hooks/use-form-context"
import { RuleProvider } from "@/hooks/use-rule-context"
import { PageHeader } from "@/components/page-header"
import { Separator } from "@/components/ui/separator"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <FormProvider>
        <RuleProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex-1">
                  <PageHeader />
                </div>
              </header>
              <main className="flex-1 py-6 pr-6 pl-2">{children}</main>
              <Footer />
            </SidebarInset>
          </SidebarProvider>
        </RuleProvider>
      </FormProvider>
    </ProtectedRoute>
  )
}

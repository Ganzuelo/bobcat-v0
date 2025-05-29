import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Footer } from "@/components/footer"
import { FormProvider } from "@/hooks/use-form-context"
import { RuleProvider } from "@/hooks/use-rule-context"

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
              <main className="flex-1 p-6">{children}</main>
              <Footer />
            </SidebarInset>
          </SidebarProvider>
        </RuleProvider>
      </FormProvider>
    </ProtectedRoute>
  )
}

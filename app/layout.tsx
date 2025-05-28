import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Project Bobcat",
  description:
    "Build UAD 3.6-compliant appraisal forms faster with Bobcat. Modular, intelligent, and built for real estate professionals. Powered by smart form logic.",
  openGraph: {
    title: "Project Bobcat",
    description:
      "Build UAD 3.6-compliant appraisal forms faster with Bobcat. Modular, intelligent, and built for real estate professionals. Powered by smart form logic.",
  },
  twitter: {
    title: "Project Bobcat",
    description:
      "Build UAD 3.6-compliant appraisal forms faster with Bobcat. Modular, intelligent, and built for real estate professionals. Powered by smart form logic.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

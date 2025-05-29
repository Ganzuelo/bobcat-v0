"use client"

import { useState, useEffect } from "react"

export function Footer() {
  const [companyName, setCompanyName] = useState("Your Company")
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    // Load saved company name from localStorage
    const savedCompanyName = localStorage.getItem("companyName")
    if (savedCompanyName) {
      setCompanyName(savedCompanyName)
    }

    // Listen for company name changes
    const handleCompanyNameChange = (event: CustomEvent) => {
      setCompanyName(event.detail)
    }

    window.addEventListener("companyNameChanged", handleCompanyNameChange as EventListener)

    return () => {
      window.removeEventListener("companyNameChanged", handleCompanyNameChange as EventListener)
    }
  }, [])

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center text-sm text-muted-foreground md:text-left">
            © {currentYear} {companyName} - All Rights Reserved
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

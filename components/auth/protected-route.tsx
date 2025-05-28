"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // Only redirect after loading is complete and we're sure there's no user
    if (!loading && !user) {
      // Add a small delay to prevent redirect during hot reload
      const timer = setTimeout(() => {
        setShouldRedirect(true)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [loading, user])

  useEffect(() => {
    if (shouldRedirect) {
      router.push("/auth/login")
    }
  }, [shouldRedirect, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!user || shouldRedirect) {
    return null
  }

  return <>{children}</>
}

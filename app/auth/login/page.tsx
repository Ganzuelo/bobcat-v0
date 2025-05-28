"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { Eye, EyeOff, Building2, FileText, BarChart3, Shield, Zap, ChevronLeft, ChevronRight } from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "Intelligent Form Builder",
    description:
      "Create URAR-compliant forms with drag-and-drop simplicity. Pre-built templates and smart field validation ensure accuracy every time.",
  },
  {
    icon: Zap,
    title: "Automated Rules Engine",
    description:
      "Set up business rules that automatically validate data, calculate values, and route forms for review. Reduce errors and save time.",
  },
  {
    icon: BarChart3,
    title: "Smart Decision Manager",
    description:
      "AI-powered insights help you make better decisions faster. Track performance, identify trends, and optimize your workflow.",
  },
  {
    icon: Shield,
    title: "MISMO Compliance",
    description:
      "Built-in compliance with URAR and MISMO standards. Automatic field mapping and validation ensure regulatory compliance.",
  },
]

export default function LoginPage() {
  // Add these safety checks and error handling
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  const { signIn, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Add this safety check before the auto-advance carousel useEffect
  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [mounted])

  // Replace the redirect useEffect with this safer version
  useEffect(() => {
    if (!mounted || authLoading) return

    if (user) {
      const redirectTo = searchParams?.get("redirectTo") || "/dashboard"
      router.push(redirectTo)
    }
  }, [user, authLoading, router, searchParams, mounted])

  // Replace the handleSubmit function with this safer version
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mounted) return

    setError("")
    setLoading(true)

    try {
      if (!email || !password) {
        setError("Please enter both email and password")
        return
      }

      const result = await signIn(email, password)
      if (result?.error) {
        setError(result.error.message || "Login failed")
      } else {
        const redirectTo = searchParams?.get("redirectTo") || "/dashboard"
        router.push(redirectTo)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length)
  }

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length)
  }

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Add this early return for safety
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render if user is already authenticated (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form (40% width) */}
      <div className="w-2/5 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to your Project Bobcat account</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-12"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 pr-12"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="font-medium text-primary hover:text-primary/80">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Feature Carousel (60% width) */}
      <div className="w-3/5 relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/bobcat-background.png')",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full p-12 text-white">
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Project Bobcat</h1>
            <p className="text-xl text-gray-200 max-w-md">Build Smarter. Stay Compliant. Move Faster.</p>
          </div>

          {/* Feature Carousel */}
          <div className="w-full max-w-lg">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              {/* Feature Content */}
              <div className="text-center min-h-[200px] flex flex-col justify-center">
                <div className="flex justify-center mb-6">
                  {React.createElement(features[currentFeature].icon, {
                    className: "h-12 w-12 text-white",
                  })}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{features[currentFeature].title}</h3>
                <p className="text-gray-200 leading-relaxed">{features[currentFeature].description}</p>
              </div>

              {/* Navigation Arrows */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevFeature}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextFeature}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center space-x-2 mt-8">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentFeature ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-12">
            <p className="text-gray-300 text-sm">Trusted by real estate professionals nationwide</p>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth/auth-provider"
import { Cat, FileText, Zap, BarChart3, Shield, Grid3X3, Settings, Eye, EyeOff } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { AppSettingsService } from "@/lib/app-settings-service"

const features = [
  {
    icon: Grid3X3,
    title: "Drag & Drop Form Builder",
    description:
      "Create URAR-compliant forms with our intuitive drag-and-drop interface. Pre-built field types, smart validation, and responsive layouts make form creation effortless.",
  },
  {
    icon: Zap,
    title: "Intelligent Rules Engine",
    description:
      "Set up business rules that automatically validate data, calculate values, and route forms for review. Reduce errors and ensure compliance with automated workflows.",
  },
  {
    icon: BarChart3,
    title: "Smart Decision Manager",
    description:
      "AI-powered insights help you make better decisions faster. Track form performance, identify bottlenecks, and optimize your appraisal workflow with real-time analytics.",
  },
  {
    icon: Shield,
    title: "MISMO & UAD Compliance",
    description:
      "Built-in compliance with URAR, MISMO, and UAD 3.6 standards. Automatic field mapping, XML export, and validation ensure regulatory compliance every time.",
  },
  {
    icon: FileText,
    title: "Dynamic Field Prefill",
    description:
      "Automatically populate forms with data from multiple sources - internal context, external APIs, or lookup tables. Save time and reduce data entry errors.",
  },
  {
    icon: Settings,
    title: "Advanced Customization",
    description:
      "Power-user features including conditional logic, calculated fields, custom validation rules, and XML mapping. Build exactly what your workflow needs.",
  },
]

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [rememberPassword, setRememberPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [appName, setAppName] = useState("Project Bobcat")
  const [logoIconName, setLogoIconName] = useState("Cat")
  const [companyName, setCompanyName] = useState("Your Company")

  const { signIn, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)

    // Load saved credentials on mount
    loadSavedCredentials()

    // Load app settings from database
    const loadSettings = async () => {
      try {
        const settings = await AppSettingsService.getAllSettings()
        setAppName(settings.app_name)
        setLogoIconName(settings.logo_icon)
        setCompanyName(settings.company_name)
      } catch (error) {
        console.error("Error loading app settings:", error)
      }
    }

    loadSettings()

    // Listen for app name and logo icon changes
    const handleAppNameChange = (event: CustomEvent) => {
      setAppName(event.detail)
    }

    const handleLogoIconChange = (event: CustomEvent) => {
      setLogoIconName(event.detail)
    }

    const handleCompanyNameChange = (event: CustomEvent) => {
      setCompanyName(event.detail)
    }

    window.addEventListener("appNameChanged", handleAppNameChange as EventListener)
    window.addEventListener("logoIconChanged", handleLogoIconChange as EventListener)
    window.addEventListener("companyNameChanged", handleCompanyNameChange as EventListener)

    return () => {
      window.removeEventListener("appNameChanged", handleAppNameChange as EventListener)
      window.removeEventListener("logoIconChanged", handleLogoIconChange as EventListener)
      window.removeEventListener("companyNameChanged", handleCompanyNameChange as EventListener)
    }
  }, [])

  // Load saved credentials from localStorage
  const loadSavedCredentials = () => {
    try {
      const savedEmail = localStorage.getItem("bobcat_saved_email")
      const savedPassword = localStorage.getItem("bobcat_saved_password")
      const savedRememberMe = localStorage.getItem("bobcat_remember_me") === "true"
      const savedRememberPassword = localStorage.getItem("bobcat_remember_password") === "true"

      if (savedEmail && savedRememberMe) {
        setEmail(savedEmail)
        setRememberMe(true)
      }

      if (savedPassword && savedRememberPassword) {
        setPassword(savedPassword)
        setRememberPassword(true)
      }
    } catch (error) {
      console.error("Error loading saved credentials:", error)
    }
  }

  // Save credentials to localStorage
  const saveCredentials = () => {
    try {
      if (rememberMe && email) {
        localStorage.setItem("bobcat_saved_email", email)
        localStorage.setItem("bobcat_remember_me", "true")
      } else {
        localStorage.removeItem("bobcat_saved_email")
        localStorage.removeItem("bobcat_remember_me")
      }

      if (rememberPassword && password) {
        localStorage.setItem("bobcat_saved_password", password)
        localStorage.setItem("bobcat_remember_password", "true")
      } else {
        localStorage.removeItem("bobcat_saved_password")
        localStorage.removeItem("bobcat_remember_password")
      }
    } catch (error) {
      console.error("Error saving credentials:", error)
    }
  }

  // Clear saved credentials
  const clearSavedCredentials = () => {
    try {
      localStorage.removeItem("bobcat_saved_email")
      localStorage.removeItem("bobcat_saved_password")
      localStorage.removeItem("bobcat_remember_me")
      localStorage.removeItem("bobcat_remember_password")
    } catch (error) {
      console.error("Error clearing credentials:", error)
    }
  }

  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 5000) // Slightly longer interval for more features
    return () => clearInterval(interval)
  }, [mounted])

  useEffect(() => {
    if (!mounted || authLoading) return

    if (user) {
      const redirectTo = searchParams?.get("redirectTo") || "/dashboard"
      router.push(redirectTo)
    }
  }, [user, authLoading, router, searchParams, mounted])

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

      // Save credentials before attempting login
      saveCredentials()

      const result = await signIn(email, password)
      if (result?.error) {
        setError(result.error.message || "Login failed")
        // Clear saved password on login failure for security
        if (rememberPassword) {
          localStorage.removeItem("bobcat_saved_password")
          setRememberPassword(false)
        }
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

  // Get the icon component dynamically
  const getLogoIcon = () => {
    const IconComponent = (LucideIcons as any)[logoIconName]
    return IconComponent || Cat // Fallback to Cat if icon not found
  }

  const LogoIcon = getLogoIcon()

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex" aria-label="Login page">
      {/* Left Panel - Login Form (40% width) */}
      <div className="w-2/5 flex flex-col bg-gray-50 px-4 sm:px-6 lg:px-8" aria-label="Login form section">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="flex justify-center">
                <LogoIcon className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-600">Sign in to your {appName} account</p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Sign in to your account">
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
                      aria-label="Email address"
                      aria-describedby="email-description"
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
                        aria-label="Password"
                        aria-describedby="password-description"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Remember Me Options */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-email"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        disabled={loading}
                        aria-label="Remember my email address"
                      />
                      <Label htmlFor="remember-email" className="text-sm font-normal cursor-pointer">
                        Remember my email address
                      </Label>
                    </div>

                    {rememberMe && (
                      <div className="text-xs text-gray-500">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={clearSavedCredentials}
                          aria-label="Clear saved login credentials"
                        >
                          Clear saved credentials
                        </Button>
                      </div>
                    )}
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
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 py-4">
          © {new Date().getFullYear()} {companyName}
        </div>
      </div>

      {/* Right Panel - Feature Carousel (60% width) */}
      <div className="w-3/5 relative" style={{ backgroundColor: "#18181B" }} aria-label="Feature showcase">
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full p-12 text-white">
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{appName}</h1>
            <p className="text-xl text-gray-200 max-w-md">Modular. Compliant. Appraisal-ready.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

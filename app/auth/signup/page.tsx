"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  EyeOff,
  Building2,
  AlertCircle,
  CheckCircle,
  Users,
  Clock,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import * as LucideIcons from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import type { SignUpFormData } from "@/lib/auth-types"

const benefits = [
  {
    icon: Users,
    title: "Join 10,000+ Professionals",
    description: "Real estate appraisers, inspectors, and agents trust Project Bobcat for their form management needs.",
  },
  {
    icon: Clock,
    title: "Save 5+ Hours Per Week",
    description: "Automate repetitive tasks and streamline your workflow. Spend more time on what matters most.",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description: "Your data is protected with bank-level encryption and compliance with industry standards.",
  },
  {
    icon: Zap,
    title: "Get Started in Minutes",
    description: "No complex setup required. Import your existing forms or start with our proven templates.",
  },
]

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()

  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentBenefit, setCurrentBenefit] = useState(0)
  const [appName, setAppName] = useState("Project Bobcat")
  const [logoIconName, setLogoIconName] = useState("Cat")

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Load app settings
  useEffect(() => {
    const savedAppName = localStorage.getItem("appName")
    const savedLogoIcon = localStorage.getItem("logoIcon")

    if (savedAppName) {
      setAppName(savedAppName)
    }

    if (savedLogoIcon) {
      setLogoIconName(savedLogoIcon)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const nextBenefit = () => {
    setCurrentBenefit((prev) => (prev + 1) % benefits.length)
  }

  const prevBenefit = () => {
    setCurrentBenefit((prev) => (prev - 1 + benefits.length) % benefits.length)
  }

  // Get the icon component dynamically
  const getLogoIcon = () => {
    const IconComponent = (LucideIcons as any)[logoIconName]
    return IconComponent || Building2 // Fallback to Building2 if icon not found
  }

  const LogoIcon = getLogoIcon()

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle>Check your email</CardTitle>
              <CardDescription>We've sent you a confirmation link at {formData.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Click the link in the email to verify your account and complete the signup process.
                </p>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Return to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Signup Form (1/3 width) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <LogoIcon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">Join thousands of real estate professionals</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Create your {appName} account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className="h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <div className="mt-6">
                <Separator />
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Background Image with Benefits Carousel (2/3 width) */}
      <div className="hidden lg:block lg:w-2/3 relative">
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
            <div className="flex justify-center mb-4">
              <LogoIcon className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Join {appName}</h1>
            <p className="text-xl text-gray-200 max-w-md">Transform your real estate workflow today</p>
          </div>

          {/* Benefits Carousel */}
          <div className="w-full max-w-lg">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              {/* Benefit Content */}
              <div className="text-center min-h-[200px] flex flex-col justify-center">
                <div className="flex justify-center mb-6">
                  {React.createElement(benefits[currentBenefit].icon, {
                    className: "h-12 w-12 text-white",
                  })}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{benefits[currentBenefit].title}</h3>
                <p className="text-gray-200 leading-relaxed">{benefits[currentBenefit].description}</p>
              </div>

              {/* Navigation Arrows */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevBenefit}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextBenefit}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center space-x-2 mt-8">
                {benefits.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBenefit(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentBenefit ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-12">
            <p className="text-gray-300 text-sm">Free 14-day trial • No credit card required</p>
          </div>
        </div>
      </div>
    </div>
  )
}

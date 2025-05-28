"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Camera, Save, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { AuthService } from "@/lib/auth-service"

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    email: profile?.email || "",
    avatar_url: profile?.avatar_url || "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await updateProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        avatar_url: profileForm.avatar_url,
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ type: "success", text: "Profile updated successfully!" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      setLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long" })
      setLoading(false)
      return
    }

    try {
      const { error } = await AuthService.updatePassword(passwordForm.newPassword)

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ type: "success", text: "Password updated successfully!" })
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    const firstName = profile.first_name || ""
    const lastName = profile.last_name || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "editor":
        return "bg-blue-100 text-blue-800"
      case "viewer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt="Profile picture" />
                    <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold">
                    {profile.first_name || profile.last_name
                      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                      : "No name set"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>

                <Badge className={getRoleColor(profile.role)}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last login</span>
                  <span>{profile.last_login_at ? new Date(profile.last_login_at).toLocaleDateString() : "Never"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email verified</span>
                  <span className={profile.email_verified ? "text-green-600" : "text-red-600"}>
                    {profile.email_verified ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          value={profileForm.first_name}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          value={profileForm.last_name}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" type="email" value={profileForm.email} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if you need to update your email.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avatarUrl">Avatar URL</Label>
                      <Input
                        id="avatarUrl"
                        type="url"
                        value={profileForm.avatar_url}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, avatar_url: e.target.value }))}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>

                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm new password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

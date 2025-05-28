"use client"

import { useEffect, useState } from "react"
import { DatabaseService } from "@/lib/database-service"
import type { Form } from "@/lib/database-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Zap, BarChart3, Plus, TrendingUp, Users, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [recentForms, setRecentForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecentForms() {
      try {
        setIsLoading(true)
        const forms = await DatabaseService.getForms()
        // Get the 3 most recent forms
        setRecentForms(forms.slice(0, 3))
      } catch (err) {
        console.error("Error fetching recent forms:", err)
        setError("Failed to load recent forms")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentForms()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Project Bobcat - Your comprehensive form builder platform</p>
        </div>
        <Button asChild>
          <Link href="/form-builder">
            <Plus className="mr-2 h-4 w-4" />
            New Form
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decisions Made</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Form Builder
            </CardTitle>
            <CardDescription>Create and customize forms with our intuitive builder</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/form-builder">Create New Form</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Rules Engine
            </CardTitle>
            <CardDescription>Define business rules and validation logic</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/rules-engine">Manage Rules</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Decision Manager
            </CardTitle>
            <CardDescription>Review and analyze automated decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/decision-manager">View Decisions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Forms</CardTitle>
            <CardDescription>Latest form submissions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : recentForms.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No forms created yet</p>
                <Button asChild className="mt-2" size="sm">
                  <Link href="/form-builder">Create Your First Form</Link>
                </Button>
              </div>
            ) : (
              recentForms.map((form) => (
                <div key={form.id} className="flex items-center space-x-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{form.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {form.status === "published" ? "Published" : form.status === "draft" ? "Draft" : "In Progress"} •
                      Updated {new Date(form.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/forms/${form.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Recent system events and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">New rule activated</p>
                <p className="text-xs text-muted-foreground">Property value validation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">User registered</p>
                <p className="text-xs text-muted-foreground">john.appraiser@email.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Scheduled maintenance</p>
                <p className="text-xs text-muted-foreground">Tomorrow at 2:00 AM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

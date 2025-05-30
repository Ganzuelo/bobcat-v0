"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Copy, BarChart3, AlertCircle } from "lucide-react"
import { DatabaseService } from "@/lib/database-service"
import { CreateFormModal } from "@/components/form-builder/create-form-modal"
import { createFormStructure, type FormConfig } from "@/lib/form-templates"
import type { Form } from "@/lib/database-types"
import { OnboardingTip } from "@/components/onboarding-tip"

export default function FormBuilderPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadForms()

    // Listen for the create form modal event from the header button
    const handleOpenCreateModal = () => setShowCreateModal(true)
    window.addEventListener("openCreateFormModal", handleOpenCreateModal)

    return () => {
      window.removeEventListener("openCreateFormModal", handleOpenCreateModal)
    }
  }, [])

  const loadForms = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Loading forms...")
      const userId = await DatabaseService.getCurrentUserId()
      console.log("Current user ID:", userId)

      if (!userId) {
        throw new Error("User not authenticated")
      }

      const formsData = await DatabaseService.getForms(userId)
      console.log("Forms loaded:", formsData)
      setForms(formsData)
    } catch (error) {
      console.error("Error loading forms:", error)
      setError(error instanceof Error ? error.message : "Failed to load forms")
    } finally {
      setLoading(false)
    }
  }

  // Add error state rendering
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <div className="text-lg font-semibold mb-2">Error Loading Forms</div>
            <div className="text-muted-foreground mb-4">{error}</div>
            <Button onClick={loadForms}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || form.status === statusFilter
    const matchesType = typeFilter === "all" || form.form_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      case "template":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get display name for form type
  const getFormTypeDisplay = (formType: string) => {
    // Check if there's an original form type in settings
    const form = forms.find((f) => f.form_type === formType)
    if (form?.settings?.originalFormType) {
      switch (form.settings.originalFormType) {
        case "uad_3_6":
          return "UAD 3.6"
        case "uad_2_6":
          return "UAD 2.6"
        case "bpo":
          return "BPO"
        default:
          return formType.charAt(0).toUpperCase() + formType.slice(1)
      }
    }

    // Default display based on database form_type
    switch (formType) {
      case "urar":
        return "URAR"
      case "assessment":
        return "Assessment"
      case "custom":
        return "Custom"
      default:
        return formType.charAt(0).toUpperCase() + formType.slice(1)
    }
  }

  const deleteForm = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return

    try {
      await DatabaseService.deleteForm(id)
      setForms(forms.filter((f) => f.id !== id))
    } catch (error) {
      console.error("Error deleting form:", error)
    }
  }

  const handleCreateForm = async (formConfig: FormConfig) => {
    try {
      // Create form structure based on config
      const formStructure = createFormStructure(formConfig)

      // Save the form structure to database
      const savedStructure = await DatabaseService.saveFormStructure(formStructure)

      // Navigate to the form builder with the new form
      router.push(`/form-builder/${savedStructure.form.id}`)
    } catch (error) {
      console.error("Error creating form:", error)
    }
  }

  const handleEditForm = (id: string) => {
    router.push(`/form-builder/${id}`)
  }

  return (
    <div className="space-y-6">
      {/* Add Create Form button to header */}
      {typeof window !== "undefined" &&
        (() => {
          const headerActions = document.getElementById("header-actions")
          if (headerActions) {
            headerActions.innerHTML = ""
            const button = document.createElement("button")
            button.className =
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            button.innerHTML =
              '<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>Create Form'
            button.onclick = () => setShowCreateModal(true)
            headerActions.appendChild(button)
          }
        })()}

      <OnboardingTip
        message="Tip: Create and manage your forms here. Use &quot;Create Form&quot; to start a new one."
        storageKey="form-builder-tip-dismissed"
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="template">Template</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="urar">URAR</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="survey">Survey</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Forms Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredForms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {forms.length === 0 ? "No forms created yet" : "No forms match your filters"}
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{form.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{form.description || "No description"}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getFormTypeDisplay(form.form_type)}</Badge>
                    <Badge variant="outline">v{form.version}</Badge>
                    {form.tags && form.tags.length > 0 && <Badge variant="secondary">{form.tags[0]}</Badge>}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Updated {new Date(form.updated_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handleEditForm(form.id)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteForm(form.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateFormModal open={showCreateModal} onOpenChange={setShowCreateModal} onCreateForm={handleCreateForm} />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateUserDialog } from "@/components/settings/create-user-dialog"
import { fetchAllUsers } from "@/app/actions/fetch-users"
import { syncUsersFromAuth } from "@/app/actions/sync-users"
import { cleanupTestUsers } from "@/app/actions/cleanup-test-users"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, UserPlus, Trash2, MoreVertical, CheckCircle2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteUserDialog } from "@/components/settings/delete-user-dialog"
import { EditUserDialog } from "@/components/settings/edit-user-dialog"
import { updateUserRole } from "@/app/actions/update-user-role"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TriangleAlertIcon as WarningTriangle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const generalSettingsSchema = z.object({
  appName: z.string().min(2).max(50),
  companyName: z.string().min(2).max(50),
  logoIcon: z.string().optional(),
  emailNotificationsEnabled: z.boolean().default(false),
  pushNotificationsEnabled: z.boolean().default(false),
  termsOfService: z.string().optional(),
  privacyPolicy: z.string().optional(),
})

export default function SettingsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null)
  const { toast } = useToast()

  // General Settings State
  const [appName, setAppName] = useState("")
  const [tempAppName, setTempAppName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [logoIcon, setLogoIcon] = useState("")
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false)
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false)
  const [termsOfService, setTermsOfService] = useState("")
  const [privacyPolicy, setPrivacyPolicy] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Auth Hook
  const { profile } = useAuth()
  const isAdmin = profile?.role === "admin"

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const result = await fetchAllUsers()
      if (result.success) {
        setUsers(result.users)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load users",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleSyncUsers = async () => {
    setIsSyncing(true)
    try {
      const result = await syncUsersFromAuth()
      if (result.success) {
        toast({
          title: "Users synced",
          description: `${result.syncedCount} users were synced from Auth`,
        })
        loadUsers()
      } else {
        toast({
          title: "Sync failed",
          description: result.error || "Failed to sync users",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during sync",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCleanupTestUsers = async () => {
    setIsCleaningUp(true)
    try {
      const result = await cleanupTestUsers()
      if (result.success) {
        toast({
          title: "Test users cleaned up",
          description: result.message,
        })
        loadUsers()
      } else {
        toast({
          title: "Cleanup failed",
          description: result.error || "Failed to clean up test users",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during cleanup",
        variant: "destructive",
      })
    } finally {
      setIsCleaningUp(false)
    }
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdatingRole(userId)
    try {
      const result = await updateUserRole(userId, newRole)

      if (result.success) {
        toast({
          title: "Role updated",
          description: `User role changed to ${newRole}`,
        })

        // Update the local state to reflect the change
        setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
      } else {
        toast({
          title: "Error updating role",
          description: result.error || "Failed to update user role",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating role",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingRole(null)
    }
  }

  // General Settings Form
  const form = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      appName: "",
      companyName: "",
      logoIcon: "",
      emailNotificationsEnabled: false,
      pushNotificationsEnabled: false,
      termsOfService: "",
      privacyPolicy: "",
    },
    mode: "onChange",
  })

  // Reset form when state changes
  useEffect(() => {
    form.reset({
      appName: appName,
      companyName: companyName,
      logoIcon: logoIcon,
      emailNotificationsEnabled: emailNotificationsEnabled,
      pushNotificationsEnabled: pushNotificationsEnabled,
      termsOfService: termsOfService,
      privacyPolicy: privacyPolicy,
    })
  }, [
    appName,
    companyName,
    logoIcon,
    emailNotificationsEnabled,
    pushNotificationsEnabled,
    termsOfService,
    privacyPolicy,
    form,
  ])

  useEffect(() => {
    // Load saved settings from localStorage
    const savedAppName = localStorage.getItem("appName")
    const savedCompanyName = localStorage.getItem("companyName")
    const savedLogoIcon = localStorage.getItem("logoIcon")

    if (savedAppName) {
      setAppName(savedAppName)
      setTempAppName(savedAppName)
    }

    if (savedCompanyName) {
      setCompanyName(savedCompanyName)
    }

    if (savedLogoIcon) {
      setLogoIcon(savedLogoIcon)
    }
  }, [])

  const handleSaveGeneralSettings = async (values: z.infer<typeof generalSettingsSchema>) => {
    setIsSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem("appName", values.appName)
      localStorage.setItem("companyName", values.companyName)
      localStorage.setItem("logoIcon", values.logoIcon || "")

      // Dispatch events for other components to listen
      window.dispatchEvent(new CustomEvent("appNameChanged", { detail: values.appName }))
      window.dispatchEvent(new CustomEvent("companyNameChanged", { detail: values.companyName }))
      window.dispatchEvent(new CustomEvent("logoIconChanged", { detail: values.logoIcon || "" }))

      // Update local state
      setAppName(values.appName)
      setTempAppName(values.appName)
      setCompanyName(values.companyName)
      setLogoIcon(values.logoIcon || "")
      setEmailNotificationsEnabled(values.emailNotificationsEnabled)
      setPushNotificationsEnabled(values.pushNotificationsEnabled)
      setTermsOfService(values.termsOfService || "")
      setPrivacyPolicy(values.privacyPolicy || "")

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save general settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAdmin ? (
                <Alert variant="destructive">
                  <WarningTriangle className="h-4 w-4" />
                  <AlertTitle>Unauthorized Access</AlertTitle>
                  <AlertDescription>
                    You do not have permission to view or modify these settings. Please contact an administrator.
                  </AlertDescription>
                </Alert>
              ) : null}

              {appName !== tempAppName ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Pending Changes</AlertTitle>
                  <AlertDescription>
                    There are unsaved changes to your general settings. Please save to apply them.
                  </AlertDescription>
                </Alert>
              ) : null}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveGeneralSettings)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="appName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Acme Corp"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                setTempAppName(e.target.value)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="logoIcon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo Icon</FormLabel>
                          <FormControl>
                            <Input placeholder="A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Preferences</h3>
                    <p className="text-sm text-muted-foreground">Customize the look and feel of your application.</p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium leading-none">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable email notifications for important updates.
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="emailNotificationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium leading-none">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable push notifications for mobile devices.
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="pushNotificationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Legal</h3>
                    <p className="text-sm text-muted-foreground">Define the legal agreements for your application.</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="termsOfService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms of Service URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.example.com/terms" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacyPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Privacy Policy URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.example.com/privacy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSaving || !form.formState.isValid}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and their permissions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadUsers} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="ml-2">Refresh</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSyncUsers} disabled={isSyncing}>
                  {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync from Auth"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCleanupTestUsers} disabled={isCleaningUp}>
                  {isCleaningUp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cleanup Test Users
                    </>
                  )}
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-muted/50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium">
                                  {user.first_name || user.last_name
                                    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                                    : "No name provided"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge
                                  variant={
                                    user.role === "admin" ? "default" : user.role === "editor" ? "outline" : "secondary"
                                  }
                                  className="cursor-pointer hover:opacity-80"
                                >
                                  {isUpdatingRole === user.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : null}
                                  {user.role || "user"}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                                  Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "editor")}>
                                  Editor
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "user")}>
                                  User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "viewer")}>
                                  Viewer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.email_verified ? "outline" : "secondary"}>
                              {user.email_verified ? "Verified" : "Unverified"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>Edit User</DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security settings for your application</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Security settings content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>Manage your application's database settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Database settings content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification settings for your application</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notification settings content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onUserCreated={loadUsers}
        isAdmin={isAdmin}
      />

      {selectedUser && (
        <>
          <DeleteUserDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            user={selectedUser}
            onSuccess={loadUsers}
          />

          <EditUserDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            user={selectedUser}
            onSuccess={loadUsers}
          />
        </>
      )}
    </div>
  )
}

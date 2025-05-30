"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { updateUserRole } from "@/app/actions/update-user-role"
import type { UserProfile } from "@/lib/auth-types"

interface AdminSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoleUpdated: () => void
  currentUser: UserProfile | null
}

export function AdminSetupDialog({ open, onOpenChange, onRoleUpdated, currentUser }: AdminSetupDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleGrantAdminAccess = async () => {
    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "No user ID found",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await updateUserRole(currentUser.id, "admin")

      if (result.success) {
        toast({
          title: "Admin access granted",
          description: "You now have admin privileges. Please refresh the page.",
        })
        onOpenChange(false)
        onRoleUpdated()

        // Refresh the page to update the auth context
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        toast({
          title: "Error granting admin access",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error granting admin access:", error)
      toast({
        title: "Error granting admin access",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Setup Admin Access</DialogTitle>
          <DialogDescription>Grant yourself admin privileges to manage users and system settings.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Current Account:</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">{currentUser?.email}</span>
              <Badge variant="secondary">{currentUser?.role}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Admin Privileges Include:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Create and manage user accounts</li>
              <li>• Configure system settings</li>
              <li>• Manage security policies</li>
              <li>• Access all administrative features</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleGrantAdminAccess} disabled={isLoading}>
            {isLoading ? "Granting Access..." : "Grant Admin Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

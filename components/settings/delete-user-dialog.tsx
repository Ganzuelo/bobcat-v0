"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteUser } from "@/app/actions/delete-user"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    email: string
    first_name?: string
    last_name?: string
  }
  onSuccess: () => void
}

export function DeleteUserDialog({ isOpen, onClose, user, onSuccess }: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteUser(user.id)

      if (result.success) {
        toast({
          title: "User deleted",
          description: `${user.email} has been removed successfully.`,
        })
        onSuccess()
        onClose()
      } else {
        toast({
          title: "Failed to delete user",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ")
  const displayName = fullName || user.email

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-medium mb-1">User:</p>
          <p className="text-sm">{displayName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>

          <div className="mt-4 p-3 bg-destructive/10 rounded-md border border-destructive/20 text-sm">
            <p className="font-medium text-destructive">Warning:</p>
            <p>This will permanently delete the user account and all associated data, including:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>User profile information</li>
              <li>Forms created by this user</li>
              <li>Authentication credentials</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

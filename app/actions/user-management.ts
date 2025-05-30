"use server"

import { createClient } from "@supabase/supabase-js"
import type { UserProfile } from "@/lib/auth-types"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    console.log(`Server: Updating user ${userId}`, updates)

    // Update user in the users table
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Server: Error updating user:", error)
      throw error
    }

    // If updating email or name, also update auth user metadata
    if (updates.email || updates.first_name || updates.last_name) {
      const authUpdates: any = {}

      if (updates.email) {
        authUpdates.email = updates.email
      }

      if (updates.first_name || updates.last_name) {
        authUpdates.user_metadata = {
          first_name: updates.first_name,
          last_name: updates.last_name,
        }
      }

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates)

      if (authError) {
        console.error("Server: Error updating auth user:", authError)
        // Don't throw here, as the profile was updated successfully
      }
    }

    return {
      success: true,
      message: "User updated successfully",
      user: data,
    }
  } catch (error: any) {
    console.error("Server: Error in updateUserProfile:", error)
    return {
      success: false,
      error: error.message || "Failed to update user",
    }
  }
}

export async function deleteUser(userId: string) {
  try {
    console.log(`Server: Deleting user ${userId}`)

    // First delete from users table
    const { error: profileError } = await supabaseAdmin.from("users").delete().eq("id", userId)

    if (profileError) {
      console.error("Server: Error deleting user profile:", profileError)
      throw profileError
    }

    // Then delete from auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Server: Error deleting auth user:", authError)
      throw authError
    }

    return {
      success: true,
      message: "User deleted successfully",
    }
  } catch (error: any) {
    console.error("Server: Error in deleteUser:", error)
    return {
      success: false,
      error: error.message || "Failed to delete user",
    }
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    console.log(`Server: Updating user ${userId} role to ${newRole}`)

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Server: Error updating user role:", error)
      throw error
    }

    return {
      success: true,
      message: `User role updated to ${newRole}`,
      user: data,
    }
  } catch (error: any) {
    console.error("Server: Error in updateUserRole:", error)
    return {
      success: false,
      error: error.message || "Failed to update user role",
    }
  }
}

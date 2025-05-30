"use server"

import { createServerClient } from "@/lib/supabase-client"

export async function updateUserRole(userId: string, newRole: string) {
  try {
    // Validate role
    const validRoles = ["admin", "editor", "user", "viewer"]
    if (!validRoles.includes(newRole)) {
      return {
        success: false,
        error: `Invalid role: ${newRole}. Must be one of: ${validRoles.join(", ")}`,
      }
    }

    // Use server client with service role key for admin operations
    const supabaseAdmin = createServerClient()

    if (!supabaseAdmin) {
      throw new Error("Failed to create admin client")
    }

    // Update the user's role in the users table
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user role:", error)
      throw error
    }

    return {
      success: true,
      message: `User role updated to ${newRole}`,
    }
  } catch (error: any) {
    console.error("Error in updateUserRole:", error)
    return {
      success: false,
      error: error.message || "Failed to update user role",
    }
  }
}

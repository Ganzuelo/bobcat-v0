"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface UpdateUserData {
  email?: string
  first_name?: string
  last_name?: string
  role?: string
}

export async function updateUser(userId: string, data: UpdateUserData) {
  try {
    console.log(`Server: Updating user ${userId}`, data)

    // Update auth user if email is changing
    if (data.email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, { email: data.email })

      if (authError) {
        console.error("Server: Error updating auth user:", authError)
        throw authError
      }
    }

    // Update user profile
    const { error: profileError } = await supabaseAdmin
      .from("users")
      .update({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Server: Error updating user profile:", profileError)
      throw profileError
    }

    return {
      success: true,
      message: "User updated successfully",
    }
  } catch (error: any) {
    console.error("Server: Error in updateUser:", error)
    return {
      success: false,
      error: error.message || "Failed to update user",
    }
  }
}

"use server"

import { createServerClient } from "@/lib/supabase-client"

export async function syncUsersFromAuth() {
  try {
    // Use server client with service role key for admin operations
    const supabaseAdmin = createServerClient()

    if (!supabaseAdmin) {
      throw new Error("Failed to create admin client")
    }

    // Get all users from Supabase Auth (requires admin privileges)
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) throw authError

    // Get existing users from our users table
    const { data: existingUsers, error: usersError } = await supabaseAdmin.from("users").select("id")

    if (usersError) throw usersError

    const existingUserIds = new Set(existingUsers?.map((u) => u.id) || [])
    let syncedCount = 0

    // Create profiles for auth users that don't have profiles
    for (const authUser of authUsers.users) {
      if (!existingUserIds.has(authUser.id)) {
        const { error: insertError } = await supabaseAdmin.from("users").insert({
          id: authUser.id,
          email: authUser.email || "",
          first_name: authUser.user_metadata?.first_name || "",
          last_name: authUser.user_metadata?.last_name || "",
          role: "user",
          is_active: true,
          email_verified: authUser.email_confirmed_at ? true : false,
          created_at: authUser.created_at,
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error(`Error creating profile for user ${authUser.id}:`, insertError)
        } else {
          syncedCount++
        }
      }
    }

    return {
      success: true,
      syncedCount,
      message: `Successfully synced ${syncedCount} users from authentication.`,
    }
  } catch (error: any) {
    console.error("Error syncing users:", error)
    return {
      success: false,
      error: error.message || "Could not sync users from authentication.",
    }
  }
}

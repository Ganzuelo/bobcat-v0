"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function deleteUser(userId: string) {
  try {
    console.log(`Server: Deleting user ${userId}`)

    // Step 1: Handle foreign key dependencies - delete forms created by this user
    const { data: userForms, error: formsError } = await supabaseAdmin
      .from("forms")
      .select("id")
      .eq("created_by", userId)

    if (formsError) {
      console.error(`Server: Error finding forms for user ${userId}:`, formsError)
      throw formsError
    }

    if (userForms && userForms.length > 0) {
      console.log(`Server: Found ${userForms.length} forms to delete for user ${userId}`)

      // Delete all forms created by this user
      const { error: deleteFormsError } = await supabaseAdmin.from("forms").delete().eq("created_by", userId)

      if (deleteFormsError) {
        console.error(`Server: Error deleting forms for user ${userId}:`, deleteFormsError)
        throw deleteFormsError
      }

      console.log(`Server: Successfully deleted ${userForms.length} forms for user ${userId}`)
    }

    // Step 2: Delete from users table
    const { error: profileError } = await supabaseAdmin.from("users").delete().eq("id", userId)

    if (profileError) {
      console.error(`Server: Error deleting user profile:`, profileError)
      throw profileError
    }

    // Step 3: Delete from auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error(`Server: Error deleting auth user:`, authError)
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

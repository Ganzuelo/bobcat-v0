"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function cleanupTestUsers() {
  try {
    console.log("Server: Starting cleanup of test users")

    // Find all users with @example.com emails
    const { data: testUsers, error: findError } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .ilike("email", "%@example.com")

    if (findError) {
      console.error("Server: Error finding test users:", findError)
      throw findError
    }

    console.log(`Server: Found ${testUsers?.length || 0} test users`)

    if (!testUsers || testUsers.length === 0) {
      return {
        success: true,
        message: "No test users found",
        count: 0,
      }
    }

    // Delete each test user
    let deletedCount = 0
    for (const user of testUsers) {
      try {
        console.log(`Server: Processing user ${user.email} (${user.id})`)

        // STEP 1: Handle foreign key dependencies - delete forms created by this user
        const { data: userForms, error: formsError } = await supabaseAdmin
          .from("forms")
          .select("id")
          .eq("created_by", user.id)

        if (formsError) {
          console.error(`Server: Error finding forms for user ${user.email}:`, formsError)
        } else if (userForms && userForms.length > 0) {
          console.log(`Server: Found ${userForms.length} forms to delete for user ${user.email}`)

          // Delete all forms created by this user
          const { error: deleteFormsError } = await supabaseAdmin.from("forms").delete().eq("created_by", user.id)

          if (deleteFormsError) {
            console.error(`Server: Error deleting forms for user ${user.email}:`, deleteFormsError)
            continue // Skip this user if we can't delete their forms
          }

          console.log(`Server: Successfully deleted ${userForms.length} forms for user ${user.email}`)
        }

        // STEP 2: Delete from users table
        const { error: profileError } = await supabaseAdmin.from("users").delete().eq("id", user.id)

        if (profileError) {
          console.error(`Server: Error deleting user profile for ${user.email}:`, profileError)
          continue
        }

        // STEP 3: Delete from auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (authError) {
          console.error(`Server: Error deleting auth user for ${user.email}:`, authError)
          continue
        }

        console.log(`Server: Successfully deleted user ${user.email}`)
        deletedCount++
      } catch (err) {
        console.error(`Server: Error processing user ${user.email}:`, err)
      }
    }

    return {
      success: true,
      message: `Successfully deleted ${deletedCount} test user${deletedCount !== 1 ? "s" : ""}`,
      count: deletedCount,
    }
  } catch (error: any) {
    console.error("Server: Error in cleanupTestUsers:", error)
    return {
      success: false,
      error: error.message || "Failed to cleanup test users",
      count: 0,
    }
  }
}

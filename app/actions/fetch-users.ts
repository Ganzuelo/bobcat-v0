"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function fetchAllUsers() {
  try {
    console.log("Server: Fetching all users...")
    const { data, error } = await supabaseAdmin.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Server: Error fetching users:", error)
      throw error
    }

    console.log(`Server: Found ${data?.length || 0} users`)
    return {
      success: true,
      users: data || [],
    }
  } catch (error: any) {
    console.error("Server: Error in fetchAllUsers:", error)
    return {
      success: false,
      error: error.message || "Failed to fetch users",
      users: [],
    }
  }
}

"use server"

import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "admin" | "editor" | "user" | "viewer"
}

// Generate a password hash for storage in the users table
function generatePasswordHash(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export async function createUser(userData: CreateUserData) {
  try {
    const { email, password, firstName, lastName, role } = userData

    // Generate a password hash for the users table
    const passwordHash = generatePasswordHash(password)

    // 1. Create user in Supabase Auth using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      throw authError
    }

    // 2. Create user profile in users table
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin.from("users").insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        is_active: true,
        email_verified: true,
        password_hash: passwordHash, // Add the password hash
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Profile error:", profileError)
        // If profile creation fails, we should clean up the auth user
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        throw profileError
      }
    }

    return {
      success: true,
      message: `User ${email} created successfully`,
      user: authData.user,
    }
  } catch (error: any) {
    console.error("Error in createUser:", error)
    return {
      success: false,
      error: error.message || "Failed to create user",
    }
  }
}

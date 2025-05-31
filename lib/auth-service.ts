import { supabase } from "./supabase-client"
import type { UserProfile } from "./auth-types"

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, metadata?: { first_name?: string; last_name?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) return { data: null, error }

    // Note: Profile creation will be handled by a database trigger or webhook
    // For now, we'll create it manually after email confirmation
    return { data, error: null }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return { data: null, error }

    // Update last login time if user profile exists
    if (data.user) {
      await this.updateLastLogin(data.user.id)
    }

    return { data, error: null }
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  // Update password
  static async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  // Get current user
  static async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    return { user, error }
  }

  // Get user profile from our users table
  static async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

      if (error) {
        console.error("Error fetching user profile:", error)
        return { profile: null, error }
      }

      return { profile: data, error: null }
    } catch (err) {
      console.error("Unexpected error fetching user profile:", err)
      return { profile: null, error: err }
    }
  }

  // Create user profile in our users table
  static async createUserProfile(user: any, metadata?: { first_name?: string; last_name?: string }) {
    try {
      const { error } = await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        first_name: metadata?.first_name || user.user_metadata?.first_name,
        last_name: metadata?.last_name || user.user_metadata?.last_name,
        role: "user",
        email_verified: user.email_confirmed_at ? true : false,
        password_hash: "managed_by_supabase_auth", // Placeholder since Supabase manages this
      })

      return error
    } catch (err) {
      console.error("Error creating user profile:", err)
      return err
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

      return { data, error }
    } catch (err) {
      console.error("Error updating user profile:", err)
      return { data: null, error: err }
    }
  }

  // Update last login time
  static async updateLastLogin(userId: string) {
    try {
      const { error } = await supabase
        .from("users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", userId)

      return { error }
    } catch (err) {
      console.error("Error updating last login:", err)
      return { error: err }
    }
  }

  // Update user metadata in Supabase Auth
  static async updateUserMetadata(updates: { first_name?: string; last_name?: string; avatar_url?: string }) {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    })
    return { error }
  }

  // Ensure user profile exists (create if missing)
  static async ensureUserProfile(user: any): Promise<{ profile: UserProfile | null; error: any }> {
    // First try to get existing profile
    const { profile, error: fetchError } = await this.getUserProfile(user.id)

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "not found" error, other errors are real problems
      return { profile: null, error: fetchError }
    }

    if (profile) {
      return { profile, error: null }
    }

    // Profile doesn't exist, create it
    const createError = await this.createUserProfile(user)
    if (createError) {
      return { profile: null, error: createError }
    }

    // Fetch the newly created profile
    return await this.getUserProfile(user.id)
  }
}

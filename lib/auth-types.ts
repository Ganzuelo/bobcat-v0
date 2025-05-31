import type { User as SupabaseUser } from "@supabase/supabase-js"

export interface AuthUser extends SupabaseUser {
  user_metadata: {
    first_name?: string
    last_name?: string
    avatar_url?: string
  }
}

export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role: "admin" | "editor" | "viewer" | "user"
  avatar_url?: string
  is_active: boolean
  email_verified: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (
    email: string,
    password: string,
    metadata?: { first_name?: string; last_name?: string },
  ) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
}

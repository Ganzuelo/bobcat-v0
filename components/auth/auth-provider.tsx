"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { supabase } from "@/lib/supabase-client"
import { AuthService } from "@/lib/auth-service"
import type { AuthContextType, AuthUser, UserProfile } from "@/lib/auth-types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent double initialization in development
    if (initialized.current) return
    initialized.current = true

    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user) {
          setUser(session.user as AuthUser)
          await loadUserProfile(session.user)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      try {
        if (session?.user) {
          setUser(session.user as AuthUser)
          await loadUserProfile(session.user)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (authUser: any) => {
    try {
      // Use ensureUserProfile to create profile if it doesn't exist
      const { profile, error } = await AuthService.ensureUserProfile(authUser)

      if (error) {
        console.error("Error loading/creating user profile:", error)
        setProfile(null)
      } else {
        setProfile(profile)
      }
    } catch (error) {
      console.error("Unexpected error loading user profile:", error)
      setProfile(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await AuthService.signIn(email, password)
    return { error }
  }

  const signUp = async (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => {
    const { error } = await AuthService.signUp(email, password, metadata)
    return { error }
  }

  const signOut = async () => {
    await AuthService.signOut()
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error("No user logged in") }

    const { data, error } = await AuthService.updateUserProfile(user.id, updates)

    if (!error && data) {
      setProfile(data)

      const metadataUpdates: any = {}
      if (updates.first_name !== undefined) metadataUpdates.first_name = updates.first_name
      if (updates.last_name !== undefined) metadataUpdates.last_name = updates.last_name
      if (updates.avatar_url !== undefined) metadataUpdates.avatar_url = updates.avatar_url

      if (Object.keys(metadataUpdates).length > 0) {
        await AuthService.updateUserMetadata(metadataUpdates)
      }
    }

    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await AuthService.resetPassword(email)
    return { error }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

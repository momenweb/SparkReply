import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  email: string
  name?: string
  x_handle?: string
  plan_tier: string
  has_completed_onboarding: boolean
  has_configured_apis: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: Profile | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          if (session?.user) {
            setSupabaseUser(session.user)
            // Create a basic user profile
            const basicProfile: Profile = {
              id: session.user.id,
              email: session.user.email!,
              plan_tier: 'starter',
              has_completed_onboarding: false,
              has_configured_apis: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            setUser(basicProfile)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (!mounted) return

      if (session?.user) {
        setSupabaseUser(session.user)
        // Create a basic user profile
        const basicProfile: Profile = {
          id: session.user.id,
          email: session.user.email!,
          plan_tier: 'starter',
          has_completed_onboarding: false,
          has_configured_apis: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(basicProfile)
      } else {
        setSupabaseUser(null)
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    })
    
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password
    })
    
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 
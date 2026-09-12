import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { Database } from '../types/database.types'
import {
  type UserRole,
  type Permission,
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission
} from '../lib/permissions'

export type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  role: UserRole
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  signup: (data: {
    fullName: string
    email: string
    password: string
    department?: string
    role?: UserRole
  }) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const role: UserRole = useMemo(() => {
    return (profile?.role as UserRole) || 'EMPLOYEE'
  }, [profile])

  // Fetch profile from public.profiles table
  const fetchProfile = async (userId: string, emailFallback?: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.warn('[FIN-SHIELD AUTH] Profile query error:', error.message)
        return null
      }

      if (data) {
        return data
      }

      // If user exists in Auth but not in profiles, synthesize a safe default
      const defaultProfile: Profile = {
        id: userId,
        full_name: emailFallback?.split('@')[0] || 'User',
        email: emailFallback || '',
        role: 'EMPLOYEE',
        department: 'Operations',
        avatar_url: null,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return defaultProfile
    } catch (err) {
      console.error('[FIN-SHIELD AUTH] Unexpected profile retrieval error:', err)
      return null
    }
  }

  // Refresh profile explicitly
  const refreshProfile = async () => {
    if (user?.id) {
      const p = await fetchProfile(user.id, user.email)
      setProfile(p)
    }
  }

  // Initialize auth session on mount & subscribe to changes
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        if (session?.user) {
          setSession(session)
          setUser(session.user)
          const p = await fetchProfile(session.user.id, session.user.email)
          if (isMounted) setProfile(p)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        console.error('[FIN-SHIELD AUTH] Initialization failure:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!isMounted) return

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        const p = await fetchProfile(currentSession.user.id, currentSession.user.email)
        if (isMounted) setProfile(p)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Login action
  const login = async (email: string, password: string): Promise<{ error: Error | null }> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setIsLoading(false)
        return { error }
      }

      if (data.user) {
        setUser(data.user)
        setSession(data.session)
        const p = await fetchProfile(data.user.id, data.user.email)
        setProfile(p)
      }

      setIsLoading(false)
      return { error: null }
    } catch (err: any) {
      setIsLoading(false)
      return { error: err }
    }
  }

  // Signup action
  const signup = async (data: {
    fullName: string
    email: string
    password: string
    department?: string
    role?: UserRole
  }): Promise<{ error: Error | null }> => {
    setIsLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            department: data.department || 'Finance',
            role: data.role || 'FINANCE_ANALYST'
          }
        }
      })

      if (authError) {
        setIsLoading(false)
        return { error: authError }
      }

      if (authData.user) {
        // Upsert corresponding profile row
        const newProfile: Database['public']['Tables']['profiles']['Insert'] = {
          id: authData.user.id,
          full_name: data.fullName,
          email: data.email,
          role: data.role || 'FINANCE_ANALYST',
          department: data.department || 'Finance',
          status: 'ACTIVE'
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(newProfile)

        if (profileError) {
          console.warn('[FIN-SHIELD AUTH] Profile upsert warning:', profileError.message)
        }

        setUser(authData.user)
        setSession(authData.session)
        const p = await fetchProfile(authData.user.id, authData.user.email)
        setProfile(p)
      }

      setIsLoading(false)
      return { error: null }
    } catch (err: any) {
      setIsLoading(false)
      return { error: err }
    }
  }

  // Logout action
  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[FIN-SHIELD AUTH] SignOut error:', err)
    } finally {
      setUser(null)
      setSession(null)
      setProfile(null)
      setIsLoading(false)
    }
  }

  const hasPermission = (permission: Permission) => checkPermission(role, permission)
  const hasAnyPermission = (permissions: Permission[]) => checkAnyPermission(role, permissions)

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshProfile,
        hasPermission,
        hasAnyPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

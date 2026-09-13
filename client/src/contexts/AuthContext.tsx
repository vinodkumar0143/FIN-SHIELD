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
  }) => Promise<{ error: Error | null; needsEmailVerification?: boolean }>
  loginWithOAuth: (provider: 'google') => Promise<{ error: Error | null }>
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
  resendVerificationEmail: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
}

export function formatAuthError(err: any): string {
  if (!err) return ''
  const message = typeof err === 'string' ? err : err.message || err.error_description || ''
  const lower = message.toLowerCase()

  if (lower.includes('valid corporate email') || lower.includes('invalid email format')) {
    return 'Please enter a valid corporate email address.'
  }
  if (lower.includes('email not found') || lower.includes('create an account first')) {
    return 'Email not found. Please create an account first.'
  }
  if (lower.includes('incorrect password')) {
    return 'Incorrect password. Please try again.'
  }
  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit') || lower.includes('rate_limit')) {
    return 'Email sending is temporarily limited. Please wait before requesting another verification email.'
  }
  if (lower.includes('too many') || lower.includes('429')) {
    return 'Too many authentication attempts. Please wait a while before trying again.'
  }
  if (lower.includes('email not confirmed') || lower.includes('verify your email')) {
    return 'Please verify your email before signing in.'
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Incorrect password. Please try again.'
  }
  if (lower.includes('user already registered')) {
    return 'An account with this corporate email already exists.'
  }
  if (lower.includes('not currently active') || lower.includes('inactive') || lower.includes('suspended')) {
    return 'Your FinShield account is not currently active.'
  }
  if (lower.includes('provider is not enabled') || lower.includes('unsupported provider') || lower.includes('validation_failed')) {
    return 'This OAuth provider is not configured in Supabase. Please contact your administrator or sign in with your corporate email.'
  }
  if (lower.includes('database error') || lower.includes('querying schema') || lower.includes('internal error')) {
    return 'Authentication failed. Please verify your corporate credentials.'
  }
  return message || 'An unexpected authentication error occurred.'
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
  const fetchProfile = async (userId: string, _emailFallback?: string): Promise<Profile | null> => {
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

      // If user exists in Auth but not in profiles table, return null so that onboarding/context selection is accurately triggered
      return null
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
        const errMsg = error.message.toLowerCase()

        // CASE D: Unverified email
        if (errMsg.includes('email not confirmed')) {
          return { error: new Error('Please verify your email before signing in.') }
        }

        // Differentiate "Email not found" vs "Incorrect password"
        if (
          errMsg.includes('invalid login credentials') ||
          errMsg.includes('invalid credentials') ||
          errMsg.includes('database error') ||
          errMsg.includes('querying schema')
        ) {
          try {
            const checkRes = await fetch(`/api/users/check-email?email=${encodeURIComponent(email.trim())}`)
            if (checkRes.ok) {
              const checkJson = await checkRes.json()
              if (checkJson.success && checkJson.data) {
                if (!checkJson.data.exists) {
                  // CASE B: Email not found
                  return { error: new Error('Email not found. Please create an account first.') }
                } else {
                  // CASE C: Wrong password
                  return { error: new Error('Incorrect password. Please try again.') }
                }
              }
            }
          } catch (checkErr) {
            console.warn('[FIN-SHIELD AUTH] check-email lookup notice:', checkErr)
          }
          return { error: new Error('Incorrect password. Please try again.') }
        }

        return { error }
      }

      if (data.user) {
        const p = await fetchProfile(data.user.id, data.user.email)
        // Check account activity
        if (p?.status === 'INACTIVE' || p?.status === 'SUSPENDED') {
          await supabase.auth.signOut()
          setUser(null)
          setSession(null)
          setProfile(null)
          setIsLoading(false)
          return { error: new Error('Your FinShield account is not currently active.') }
        }

        setUser(data.user)
        setSession(data.session)
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
  }): Promise<{ error: Error | null; needsEmailVerification?: boolean }> => {
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

        // If no active session was returned, Supabase requires email verification
        if (!authData.session) {
          setIsLoading(false)
          return { error: null, needsEmailVerification: true }
        }

        setUser(authData.user)
        setSession(authData.session)
        const p = await fetchProfile(authData.user.id, authData.user.email)
        setProfile(p)
      }

      setIsLoading(false)
      return { error: null, needsEmailVerification: false }
    } catch (err: any) {
      setIsLoading(false)
      return { error: err }
    }
  }

  // OAuth sign in
  const loginWithOAuth = async (provider: 'google'): Promise<{ error: Error | null }> => {
    setIsLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl
        }
      })
      if (error) {
        setIsLoading(false)
        return { error }
      }
      return { error: null }
    } catch (err: any) {
      setIsLoading(false)
      return { error: err }
    }
  }

  // Password reset request
  const resetPasswordForEmail = async (email: string): Promise<{ error: Error | null }> => {
    setIsLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      })
      setIsLoading(false)
      if (error) {
        return { error }
      }
      return { error: null }
    } catch (err: any) {
      setIsLoading(false)
      return { error: err }
    }
  }

  // Update password (used during reset password flow)
  const updatePassword = async (password: string): Promise<{ error: Error | null }> => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      setIsLoading(false)
      if (error) {
        return { error }
      }
      return { error: null }
    } catch (err: any) {
      setIsLoading(false)
      return { error: err }
    }
  }

  // Resend verification email
  const resendVerificationEmail = async (email: string): Promise<{ error: Error | null }> => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })
      setIsLoading(false)
      if (error) {
        return { error }
      }
      return { error: null }
    } catch (err: any) {
      setIsLoading(false)
      return { error: err }
    }
  }

  // Update profile attributes (e.g., OAuth profile completion)
  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('No authenticated user found to update profile.') }
    }
    setIsLoading(true)
    try {
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      const payload: Database['public']['Tables']['profiles']['Insert'] = {
        id: user.id,
        full_name: profile?.full_name || fullName,
        email: user.email || profile?.email || '',
        role: (updates.role as UserRole) || profile?.role || 'EMPLOYEE',
        department: updates.department || profile?.department || 'Operations',
        status: updates.status || profile?.status || 'ACTIVE'
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(payload)

      if (error) {
        setIsLoading(false)
        return { error }
      }

      await refreshProfile()
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
        isAuthenticated: !!user && !!session,
        login,
        signup,
        loginWithOAuth,
        resetPasswordForEmail,
        updatePassword,
        resendVerificationEmail,
        updateProfile,
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


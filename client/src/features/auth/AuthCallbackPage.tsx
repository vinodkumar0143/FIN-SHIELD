import { useEffect, useState, useRef } from 'react'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabaseClient'
import { useAuth, formatAuthError } from '@/contexts/AuthContext'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import { AuthBackground } from './AuthBackground'

interface AuthCallbackPageProps {
  onNavigate: (path: string) => void
}

export function AuthCallbackPage({ onNavigate }: AuthCallbackPageProps) {
  const { session: contextSession, user: contextUser, profile: contextProfile, setAuthData, logout } = useAuth()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const isProcessedRef = useRef(false)

  useEffect(() => {
    let isMounted = true
    const startTime = performance.now()

    // 8-second safety timeout to prevent infinite loading state (Requirement 8)
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !isProcessedRef.current) {
        setErrorMsg('Google authentication is taking longer than expected.')
      }
    }, 8000)

    async function handleAuthCallback() {
      // Prevent duplicate executions in React StrictMode or re-renders
      if (isProcessedRef.current) return

      try {
        if (import.meta.env.DEV) {
          console.debug(`[FIN-SHIELD AUTH] Google callback loaded (+${Math.round(performance.now() - startTime)}ms)`)
        }

        // 1. Check for error in query or hash params (e.g. user canceled OAuth)
        const params = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'))
        const errorDescription = params.get('error_description') || hashParams.get('error_description')
        const error = params.get('error') || hashParams.get('error')

        if (error || errorDescription) {
          clearTimeout(safetyTimeout)
          if (isMounted) {
            setErrorMsg(formatAuthError(errorDescription || error))
          }
          return
        }

        // 2. Fast Session Resolution (Requirement 3 & 4)
        // Prefer already-established session if available rather than repeating network requests
        let activeSession = contextSession
        let activeUser = contextUser || activeSession?.user

        if (!activeUser) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()

          if (sessionError) {
            clearTimeout(safetyTimeout)
            if (isMounted) setErrorMsg(formatAuthError(sessionError))
            return
          }

          if (session?.user) {
            activeSession = session
            activeUser = session.user
          }
        }

        // If session is resolving via PKCE in the immediate microtask, attach a short listener
        if (!activeUser) {
          const authSession = await new Promise<any>((resolve) => {
            const shortTimer = setTimeout(() => {
              sub?.unsubscribe()
              resolve(null)
            }, 2500)

            const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, curSession) => {
              if (curSession?.user) {
                clearTimeout(shortTimer)
                sub.unsubscribe()
                resolve(curSession)
              }
            })
          })

          if (authSession?.user) {
            activeSession = authSession
            activeUser = authSession.user
          }
        }

        if (!activeUser || !activeSession) {
          clearTimeout(safetyTimeout)
          if (isMounted) {
            setErrorMsg('Unable to retrieve authenticated OAuth session. Please sign in again.')
          }
          return
        }

        if (import.meta.env.DEV) {
          console.debug(`[FIN-SHIELD AUTH] Session detected (+${Math.round(performance.now() - startTime)}ms)`)
        }

        // 3. ONE Profile Lookup (Requirement 2, 5 & 6)
        let profile = (contextProfile?.id === activeUser.id) ? contextProfile : null

        if (!profile) {
          if (import.meta.env.DEV) {
            console.debug(`[FIN-SHIELD AUTH] Profile lookup started (+${Math.round(performance.now() - startTime)}ms)`)
          }

          const { data: dbProfile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', activeUser.id)
            .maybeSingle()

          if (profileErr) {
            console.warn('[FIN-SHIELD AUTH] Google OAuth profile lookup warning:', profileErr.message)
          }
          profile = dbProfile || null

          if (import.meta.env.DEV) {
            console.debug(`[FIN-SHIELD AUTH] Profile lookup completed (+${Math.round(performance.now() - startTime)}ms)`)
          }
        }

        // 4. Verify account status if profile exists (Requirement 5 & 16)
        if (profile && (profile.status === 'INACTIVE' || profile.status === 'SUSPENDED')) {
          clearTimeout(safetyTimeout)
          await logout()
          if (isMounted) {
            setErrorMsg('Your FinShield account is not currently active. Please contact your system administrator.')
          }
          return
        }

        // 5. Check if profile is incomplete or missing Department/Role (Requirement 5, 14 & 15)
        const isProfileIncomplete = !profile || !profile.department || !profile.role

        // 6. Synchronously update AuthContext so downstream routes have session & profile immediately (Requirement 7)
        setAuthData(activeSession, profile)

        isProcessedRef.current = true
        clearTimeout(safetyTimeout)

        if (!isMounted) return

        if (import.meta.env.DEV) {
          console.debug(`[FIN-SHIELD AUTH] Navigation -> ${isProfileIncomplete ? '/select-context' : '/dashboard'} (+${Math.round(performance.now() - startTime)}ms)`)
        }

        // 7. Immediate Navigation without any waterfall delays
        if (isProfileIncomplete) {
          onNavigate('/select-context')
        } else {
          onNavigate('/dashboard')
        }
      } catch (err: any) {
        clearTimeout(safetyTimeout)
        console.error('[FIN-SHIELD AUTH] OAuth callback handling failure:', err)
        if (isMounted) setErrorMsg(formatAuthError(err))
      }
    }

    handleAuthCallback()

    return () => {
      isMounted = false
      clearTimeout(safetyTimeout)
    }
  }, [contextSession, contextUser, contextProfile, onNavigate, setAuthData, logout])

  return (
    <div className="min-h-screen w-full bg-[#061120] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <FinShieldLogo variant="compact" size="md" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">FinShield</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00B87C]/15 border border-[#00B87C]/40 text-[#00B87C] font-bold uppercase tracking-wider">
              ENTERPRISE AUTH
            </span>
          </div>
        </div>

        <Card className="p-6 sm:p-8 bg-[#0B1F3A]/90 backdrop-blur-xl border-[#16365C] shadow-2xl space-y-5">
          {errorMsg ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Authentication Failed</p>
                  <p className="text-slate-300">{errorMsg}</p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => onNavigate('/login')}
                className="w-full h-10 bg-[#00B87C] hover:bg-[#009E6A] text-[#061120] font-bold text-xs gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Button>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#00B87C]" />
              <p className="text-xs text-slate-300 font-medium">
                Completing enterprise Google authentication...
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

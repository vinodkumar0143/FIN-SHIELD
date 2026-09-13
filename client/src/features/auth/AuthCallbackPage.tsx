import { useEffect, useState } from 'react'
import { Shield, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabaseClient'
import { useAuth, formatAuthError } from '@/contexts/AuthContext'
import { AuthBackground } from './AuthBackground'

interface AuthCallbackPageProps {
  onNavigate: (path: string) => void
}

export function AuthCallbackPage({ onNavigate }: AuthCallbackPageProps) {
  const { refreshProfile } = useAuth()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function handleAuthCallback() {
      try {
        // Check for error in query or hash params (e.g. user canceled OAuth)
        const params = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'))
        const errorDescription = params.get('error_description') || hashParams.get('error_description')
        const error = params.get('error') || hashParams.get('error')

        if (error || errorDescription) {
          if (isMounted) {
            setErrorMsg(formatAuthError(errorDescription || error))
          }
          return
        }

        // Allow Supabase to establish or read the active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          if (isMounted) setErrorMsg(formatAuthError(sessionError))
          return
        }

        let activeUser = session?.user
        if (!activeUser) {
          // Wait up to 3 seconds for onAuthStateChange to fire if PKCE exchange is in flight
          const authUser = await new Promise<any>((resolve) => {
            const timer = setTimeout(() => resolve(null), 3000)
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, curSession) => {
              if (curSession?.user) {
                clearTimeout(timer)
                subscription.unsubscribe()
                resolve(curSession.user)
              }
            })
          })
          activeUser = authUser
        }

        if (!activeUser) {
          if (isMounted) setErrorMsg('Unable to retrieve authenticated OAuth session. Please try again.')
          return
        }

        // Load profile from public.profiles
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', activeUser.id)
          .maybeSingle()

        if (profileErr) {
          console.warn('[FIN-SHIELD AUTH] OAuth profile lookup error:', profileErr.message)
        }

        // If profile doesn't exist or is missing required department/role, go to profile completion
        if (!profile || !profile.department || !profile.role) {
          await refreshProfile()
          if (isMounted) onNavigate('/profile-completion')
          return
        }

        // Complete! Continue to dashboard
        await refreshProfile()
        if (isMounted) onNavigate('/dashboard')
      } catch (err: any) {
        console.error('[FIN-SHIELD AUTH] Callback handling failure:', err)
        if (isMounted) setErrorMsg(formatAuthError(err))
      }
    }

    handleAuthCallback()

    return () => {
      isMounted = false
    }
  }, [onNavigate, refreshProfile])

  return (
    <div className="min-h-screen w-full bg-[#070B14] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-950/40 mb-1">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">FIN-SHIELD</h1>
        </div>

        <Card className="p-6 sm:p-8 bg-[#0F172A]/90 backdrop-blur-xl border-slate-800 shadow-2xl space-y-5">
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
                className="w-full h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Button>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <p className="text-xs text-slate-300 font-medium">
                Completing enterprise authentication...
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

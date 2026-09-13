import React, { useState, useEffect } from 'react'
import { Shield, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth, formatAuthError } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { AuthBackground } from './AuthBackground'
import { toast } from 'sonner'

interface ResetPasswordPageProps {
  onNavigate: (path: string) => void
}

export function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
  const { updatePassword, logout } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)

  // Verify that a recovery session exists
  useEffect(() => {
    async function checkRecoverySession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        // If recovery hash/code is in URL or session exists
        if (session) {
          setHasValidSession(true)
        } else {
          // Check hash params
          const hash = window.location.hash
          if (hash.includes('access_token') || hash.includes('type=recovery') || window.location.search.includes('code=')) {
            setHasValidSession(true)
          } else {
            setHasValidSession(false)
          }
        }
      } catch (err) {
        console.error('[FIN-SHIELD] Session verification error:', err)
        setHasValidSession(false)
      } finally {
        setCheckingSession(false)
      }
    }

    checkRecoverySession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setErrorMessage(null)

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const { error } = await updatePassword(newPassword)
    setIsSubmitting(false)

    if (error) {
      const userMessage = formatAuthError(error)
      setErrorMessage(userMessage)
      toast.error(userMessage)
    } else {
      setIsSuccess(true)
      toast.success('Password updated successfully. Please sign in.')
      // Ensure we don't automatically expose authenticated dashboard before clean sign in
      await logout()
      setTimeout(() => {
        onNavigate('/login')
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#070B14] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-950/40 mb-1">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">FIN-SHIELD</h1>
          <p className="text-xs text-slate-400 font-medium">
            Enterprise Security & Credential Reset
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-[#0F172A]/90 backdrop-blur-xl border-slate-800 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3.5">
            <h2 className="text-base font-semibold text-white">Reset Password</h2>
            <p className="text-xs text-slate-400 mt-1">
              Specify a strong, secure new password for your operator account.
            </p>
          </div>

          {checkingSession ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <p className="text-xs text-slate-400">Verifying security token...</p>
            </div>
          ) : !hasValidSession ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Reset Link Expired or Invalid</p>
                  <p className="text-slate-300">
                    This password reset link is invalid, expired, or has already been used. Please request a new password reset link.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  onClick={() => onNavigate('/forgot-password')}
                  className="w-full h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-2"
                >
                  Request New Link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate('/login')}
                  className="w-full h-10 border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Sign In
                </Button>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Password Updated Successfully</p>
                  <p className="text-slate-300">
                    Your password has been changed. Redirecting you to Sign In...
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => onNavigate('/login')}
                className="w-full h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-2"
              >
                Sign In Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      disabled={isSubmitting}
                      autoComplete="new-password"
                      className="w-full h-10 pl-9 pr-10 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      disabled={isSubmitting}
                      autoComplete="new-password"
                      className="w-full h-10 pl-9 pr-3 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono disabled:opacity-60"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-2 shadow-md shadow-cyan-950/50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

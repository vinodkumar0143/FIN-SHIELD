import React, { useState, useEffect } from 'react'
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth, formatAuthError } from '@/contexts/AuthContext'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import { AuthBackground } from './AuthBackground'
import { toast } from 'sonner'

interface ForgotPasswordPageProps {
  onNavigate: (path: string) => void
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const { resetPasswordForEmail, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('/dashboard')
    }
  }, [isAuthenticated, onNavigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || cooldown > 0) return
    setErrorMessage(null)

    const trimmedEmail = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid corporate email address.')
      return
    }

    setIsSubmitting(true)
    const { error } = await resetPasswordForEmail(trimmedEmail)
    setIsSubmitting(false)

    if (error) {
      const userMessage = formatAuthError(error)
      setErrorMessage(userMessage)
      toast.error(userMessage)
    } else {
      setIsSubmitted(true)
      setCooldown(60)
      toast.success('Password reset link requested.')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#070B14] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* FinShield Branding Header */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <FinShieldLogo variant="compact" size="md" className="shadow-lg shadow-cyan-950/50 border-cyan-800/60" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">FinShield</h1>
          <p className="text-xs text-slate-400 font-medium">
            Account Recovery &amp; Access Management
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card className="p-6 sm:p-8 bg-[#0F172A]/90 backdrop-blur-xl border-slate-800 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3.5">
            <h2 className="text-base font-semibold text-white">Forgot Password</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your corporate email address to receive a secure password reset link.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Reset Link Dispatched</p>
                  <p className="text-slate-300">
                    If an account exists for <span className="text-cyan-400 font-mono">{email}</span>, we've sent a password reset link.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || cooldown > 0}
                  onClick={handleSubmit}
                  className="w-full h-10 border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    `Resend link in ${cooldown}s`
                  ) : (
                    'Resend Reset Link'
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="w-full h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    disabled={isSubmitting}
                    autoComplete="email"
                    className="w-full h-10 pl-9 pr-3 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || cooldown > 0}
                className="w-full h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-2 shadow-md shadow-cyan-950/50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
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
          )}
        </Card>
      </div>
    </div>
  )
}

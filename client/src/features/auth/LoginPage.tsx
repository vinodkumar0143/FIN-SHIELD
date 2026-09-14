import React, { useState, useEffect } from 'react'
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth, formatAuthError } from '@/contexts/AuthContext'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import { AuthBackground } from './AuthBackground'
import { toast } from 'sonner'

interface LoginPageProps {
  onNavigate: (path: string) => void
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, loginWithOAuth, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('/select-context')
    }
  }, [isAuthenticated, onNavigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || isGoogleLoading) return
    setErrorMessage(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both corporate email and password.')
      return
    }

    // CASE A: Validate email format before calling Supabase authentication
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid corporate email address.')
      toast.error('Please enter a valid corporate email address.')
      return
    }

    setIsSubmitting(true)
    const { error } = await login(trimmedEmail, password)
    setIsSubmitting(false)

    if (error) {
      const userMessage = formatAuthError(error)
      setErrorMessage(userMessage)
      toast.error(userMessage)
    } else {
      toast.success('Authenticated successfully. Please select your workspace.')
      onNavigate('/select-context')
    }
  }

  const handleGoogleAuth = async () => {
    if (isSubmitting || isGoogleLoading) return
    setErrorMessage(null)
    setIsGoogleLoading(true)

    const { error } = await loginWithOAuth('google')
    setIsGoogleLoading(false)

    if (error) {
      const userMessage = formatAuthError(error)
      setErrorMessage(userMessage)
      toast.error(userMessage)
    }
  }

  const isBusy = isSubmitting || isGoogleLoading

  return (
    <div className="min-h-screen w-full bg-[#061120] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* FinShield Branding Header */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <FinShieldLogo variant="compact" size="md" className="filter drop-shadow-[0_4px_16px_rgba(0,184,124,0.3)]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">FinShield</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00B87C]/15 border border-[#00B87C]/30 text-[#00B87C] font-bold uppercase tracking-wider">
              ENTERPRISE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Autonomous Financial Risk &amp; Operations Intelligence
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="p-6 sm:p-8 bg-[#0B1F3A]/90 backdrop-blur-xl border-[#16365C] shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3.5">
            <h2 className="text-base font-semibold text-white">Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your corporate credentials to access FinShield.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              {errorMessage.includes('create an account') && (
                <div className="pl-6">
                  <button
                    type="button"
                    onClick={() => onNavigate('/signup')}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    Create Account Now →
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {/* Email Field */}
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
                  disabled={isBusy}
                  autoComplete="email"
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('/forgot-password')}
                  disabled={isBusy}
                  className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isBusy}
                  autoComplete="current-password"
                  className="w-full h-10 pl-9 pr-10 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isBusy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isBusy}
              className="w-full h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-2 transition-all shadow-md shadow-cyan-950/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Social OAuth Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-[#0F172A] px-2 text-slate-500 font-mono">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth Button - Full width */}
          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isBusy}
              className="w-full h-10 px-4 rounded-md bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 text-xs text-slate-200 font-medium flex items-center justify-center gap-2.5 transition-all hover:border-slate-600 disabled:opacity-60 shadow-sm"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          {/* Create Account Link */}
          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an enterprise account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/signup')}
              disabled={isBusy}
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold transition-colors"
            >
              Create Account
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

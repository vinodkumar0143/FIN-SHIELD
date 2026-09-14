import React, { useState, useEffect } from 'react'
import { Lock, Mail, User, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth, formatAuthError } from '@/contexts/AuthContext'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import { AuthBackground } from './AuthBackground'
import { toast } from 'sonner'

interface SignupPageProps {
  onNavigate: (path: string) => void
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const { signup, loginWithOAuth, resendVerificationEmail, isAuthenticated } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Verification state tracking
  const [verificationPending, setVerificationPending] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('/dashboard')
    }
  }, [isAuthenticated, onNavigate])

  const validateInputs = (): string | null => {
    if (!fullName.trim()) return 'Please enter your full name.'
    if (!email.trim()) return 'Please enter your corporate email.'

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid corporate email address.'
    }

    // Password strength check: minimum 8 characters
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.'
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }

    return null
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || isGoogleLoading) return
    setErrorMessage(null)

    const validationError = validateInputs()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)
    const trimmedEmail = email.trim()
    const { error, needsEmailVerification } = await signup({
      fullName: fullName.trim(),
      email: trimmedEmail,
      password
    })
    setIsSubmitting(false)

    if (error) {
      const userMessage = formatAuthError(error)
      setErrorMessage(userMessage)
      toast.error(userMessage)
    } else if (needsEmailVerification) {
      setRegisteredEmail(trimmedEmail)
      setVerificationPending(true)
      setResendCooldown(60)
      toast.info("Account created. Please verify your email to continue.")
    } else {
      toast.success('Registration successful! Please sign in with your credentials.')
      onNavigate('/login')
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

  const handleResend = async () => {
    if (resendLoading || resendCooldown > 0) return
    setErrorMessage(null)
    setResendSuccess(false)
    setResendLoading(true)

    const { error } = await resendVerificationEmail(registeredEmail)
    setResendLoading(false)

    if (error) {
      const userMessage = formatAuthError(error)
      setErrorMessage(userMessage)
      toast.error(userMessage)
    } else {
      setResendSuccess(true)
      setResendCooldown(60)
      toast.success('A new verification email has been sent.')
    }
  }

  const isBusy = isSubmitting || isGoogleLoading

  // Verification Screen View
  if (verificationPending) {
    return (
      <div className="min-h-screen w-full bg-[#061120] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative">
        <AuthBackground />

        <div className="w-full max-w-md relative z-10 space-y-6">
          <div className="text-center space-y-2.5">
            <div className="flex justify-center">
              <FinShieldLogo variant="compact" size="md" className="filter drop-shadow-[0_4px_16px_rgba(0,184,124,0.3)]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">FinShield</h1>
          </div>

          <Card className="p-6 sm:p-8 bg-[#0B1F3A]/90 backdrop-blur-xl border-[#16365C] shadow-2xl space-y-5">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">Check your email</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                We've sent a verification link to{' '}
                <span className="text-cyan-400 font-mono font-medium block mt-1">{registeredEmail}</span>
              </p>
              <p className="text-xs text-slate-400">
                Verify your corporate email to activate your account, then sign in.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {resendSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Verification email resent. Please check your inbox and spam folder.</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={resendLoading || resendCooldown > 0}
                onClick={handleResend}
                className="w-full h-10 border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-200"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend email in ${resendCooldown}s`
                ) : (
                  'Resend verification email'
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
          </Card>
        </div>
      </div>
    )
  }

  // Standard Signup View
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
            Create an Enterprise Operator Account
          </p>
        </div>

        {/* Signup Card */}
        <Card className="p-6 sm:p-8 bg-[#0B1F3A]/90 backdrop-blur-xl border-[#16365C] shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white">Create Account</h2>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              disabled={isBusy}
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  required
                  disabled={isBusy}
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder:text-slate-500 outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Corporate Email */}
            <div className="space-y-1">
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

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isBusy}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isBusy}
                  autoComplete="new-password"
                  className="w-full h-10 pl-9 pr-10 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isBusy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isBusy}
              className="w-full h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-2 mt-2 shadow-md shadow-cyan-950/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
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

          {/* Sign In Link */}
          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an enterprise account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              disabled={isBusy}
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold transition-colors"
            >
              Sign In
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

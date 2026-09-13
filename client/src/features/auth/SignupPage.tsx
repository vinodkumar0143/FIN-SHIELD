import React, { useState, useEffect } from 'react'
import { Shield, Lock, Mail, User, Building, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth, formatAuthError } from '@/contexts/AuthContext'
import type { UserRole } from '@/lib/permissions'
import { AuthBackground } from './AuthBackground'
import { toast } from 'sonner'

interface SignupPageProps {
  onNavigate: (path: string) => void
}

const DEPARTMENTS = [
  'Finance',
  'Treasury',
  'Forensics',
  'Operations',
  'Procurement'
]

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'FINANCE_ANALYST', label: 'Finance Analyst' },
  { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'ADMIN', label: 'Admin' }
]

export function SignupPage({ onNavigate }: SignupPageProps) {
  const { signup, loginWithOAuth, resendVerificationEmail, isAuthenticated } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [department, setDepartment] = useState('Finance')
  const [role, setRole] = useState<UserRole>('FINANCE_ANALYST')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
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
      return 'Please enter a valid email address.'
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
    if (isSubmitting || oauthLoading) return
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
      password,
      department,
      role
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
      toast.success('Registration successful! Welcome to FinShield.')
      onNavigate('/dashboard')
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (isSubmitting || oauthLoading) return
    setErrorMessage(null)
    setOauthLoading(provider)

    const { error } = await loginWithOAuth(provider)
    setOauthLoading(null)

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

  const isBusy = isSubmitting || oauthLoading !== null

  // Verification Screen View
  if (verificationPending) {
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
                Verify your email to activate your account and continue to FinShield.
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
    <div className="min-h-screen w-full bg-[#070B14] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* FinShield Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-950/40 mb-1">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">FIN-SHIELD</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-bold uppercase tracking-wider">
              ENTERPRISE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Create an Enterprise Operator Account
          </p>
        </div>

        {/* Signup Card */}
        <Card className="p-6 sm:p-8 bg-[#0F172A]/90 backdrop-blur-xl border-slate-800 shadow-2xl space-y-4">
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

          <form onSubmit={handleSignup} className="space-y-3">
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
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder:text-slate-500 outline-none transition-all disabled:opacity-60"
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
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder:text-slate-500 outline-none transition-all font-mono disabled:opacity-60"
                />
              </div>
            </div>

            {/* Department & Role */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    disabled={isBusy}
                    className="w-full h-9 pl-9 pr-2 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 text-xs text-white outline-none transition-all disabled:opacity-60"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept} className="bg-slate-900 text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  disabled={isBusy}
                  className="w-full h-9 px-3 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 text-xs text-white outline-none transition-all disabled:opacity-60"
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value} className="bg-slate-900 text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isBusy}
                    autoComplete="new-password"
                    className="w-full h-9 pl-8 pr-2 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 text-xs text-white outline-none transition-all font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isBusy}
                    autoComplete="new-password"
                    className="w-full h-9 pl-8 pr-2 rounded-md bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 text-xs text-white outline-none transition-all font-mono disabled:opacity-60"
                  />
                </div>
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
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-[#0F172A] px-2 text-slate-500 font-mono">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={isBusy}
              className="h-9 px-3 rounded-md bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 text-xs text-slate-200 font-medium flex items-center justify-center gap-2 transition-all hover:border-slate-600 disabled:opacity-60"
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={isBusy}
              className="h-9 px-3 rounded-md bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 text-xs text-slate-200 font-medium flex items-center justify-center gap-2 transition-all hover:border-slate-600 disabled:opacity-60"
            >
              {oauthLoading === 'github' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              )}
              GitHub
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

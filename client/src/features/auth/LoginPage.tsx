import React, { useState } from 'react'
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface LoginPageProps {
  onNavigate: (path: string) => void
}

const DEMO_ACCOUNTS = [
  {
    role: 'ADMIN',
    name: 'Dr. Evelyn Vance',
    title: 'Chief Risk Officer & Admin',
    email: 'admin@finshield.ai',
    badge: 'error' as const
  },
  {
    role: 'FINANCE_MANAGER',
    name: 'Marcus Sterling',
    title: 'Senior Finance Manager',
    email: 'marcus.s@finshield.ai',
    badge: 'warning' as const
  },
  {
    role: 'FINANCE_ANALYST',
    name: 'Sarah Chen',
    title: 'Forensic Accounting Lead',
    email: 'sarah.c@finshield.ai',
    badge: 'info' as const
  },
  {
    role: 'EMPLOYEE',
    name: 'Ananya Roy',
    title: 'Procurement Operations',
    email: 'ananya.r@finshield.ai',
    badge: 'neutral' as const
  }
]

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      onNavigate('/dashboard')
    }
  }, [isAuthenticated, onNavigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)
    const { error } = await login(email, password)
    setIsSubmitting(false)

    if (error) {
      console.error('[FIN-SHIELD] Login error:', error)
      setErrorMessage(error.message || 'Invalid credentials or connection issue.')
      toast.error('Authentication Failed: ' + (error.message || 'Invalid email or password'))
    } else {
      toast.success('Authenticated successfully. Welcome to FIN-SHIELD!')
      onNavigate('/dashboard')
    }
  }

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('FinShield2026!')
    setErrorMessage(null)
    toast.info(`Filled credentials for ${demoEmail}`)
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 mb-2">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">FIN-SHIELD</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-bold uppercase tracking-wider">
              ENTERPRISE
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Autonomous Financial Risk & Operations Intelligence
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 bg-[#111827]/80 backdrop-blur-xl border-border/80 shadow-2xl space-y-6">
          <div className="border-b border-border/50 pb-4">
            <h2 className="text-lg font-bold text-foreground">Sign In to Sentinel Cockpit</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter your corporate credentials to access verified financial intelligence.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@finshield.ai"
                  required
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-secondary/30 border border-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-10 pl-9 pr-10 rounded-md bg-secondary/30 border border-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs gap-2 transition-all shadow-md shadow-cyan-950"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate & Launch
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="pt-3 border-t border-border/50 text-center text-xs text-muted-foreground">
            Don't have an enterprise account?{' '}
            <button
              onClick={() => onNavigate('/signup')}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Register here
            </button>
          </div>
        </Card>

        {/* 1-Click Demo Profiles Switcher */}
        <Card className="p-4 bg-[#111827]/60 border-border/60 space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-foreground">1-Click Enterprise Test Accounts</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Select a pre-seeded account to test role permissions directly:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemoAccount(acc.email)}
                className="p-2.5 rounded-md bg-secondary/30 hover:bg-secondary/60 border border-border/50 hover:border-cyan-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <Badge variant={acc.badge} size="sm">{acc.role}</Badge>
                  <CheckCircle2 className="w-3 h-3 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="text-xs font-semibold text-foreground truncate">{acc.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">{acc.email}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Shield, Lock, Mail, User, Building, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/lib/permissions'
import { toast } from 'sonner'

interface SignupPageProps {
  onNavigate: (path: string) => void
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const { signup, isAuthenticated } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [department, setDepartment] = useState('Finance')
  const [role, setRole] = useState<UserRole>('FINANCE_ANALYST')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  React.useEffect(() => {
    if (isAuthenticated) {
      onNavigate('/dashboard')
    }
  }, [isAuthenticated, onNavigate])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    setIsSubmitting(true)
    const { error } = await signup({
      fullName,
      email,
      password,
      department,
      role
    })
    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      toast.error('Signup Failed: ' + error.message)
    } else {
      toast.success('Registration successful! Welcome to FIN-SHIELD.')
      onNavigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 mb-2">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">FIN-SHIELD</h1>
          <p className="text-xs text-muted-foreground">
            Create an Enterprise Operator Account
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-[#111827]/80 backdrop-blur-xl border-border/80 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="text-base font-bold text-foreground">Operator Registration</h2>
            <button
              onClick={() => onNavigate('/login')}
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Login
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  required
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/30 border border-border focus:border-cyan-500 text-xs text-foreground outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@finshield.ai"
                  required
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/30 border border-border focus:border-cyan-500 text-xs text-foreground outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full h-9 pl-9 pr-2 rounded-md bg-secondary/30 border border-border focus:border-cyan-500 text-xs text-foreground outline-none"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Treasury">Treasury</option>
                    <option value="Forensics">Forensics</option>
                    <option value="Operations">Operations</option>
                    <option value="Procurement">Procurement</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full h-9 px-3 rounded-md bg-secondary/30 border border-border focus:border-cyan-500 text-xs text-foreground outline-none"
                >
                  <option value="FINANCE_ANALYST">Finance Analyst</option>
                  <option value="FINANCE_MANAGER">Finance Manager</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-9 pl-8 pr-2 rounded-md bg-secondary/30 border border-border focus:border-cyan-500 text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Confirm
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-9 pl-8 pr-2 rounded-md bg-secondary/30 border border-border focus:border-cyan-500 text-xs text-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs gap-2 mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

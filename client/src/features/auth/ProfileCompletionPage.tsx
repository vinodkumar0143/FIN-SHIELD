import React, { useState, useEffect } from 'react'
import { Building, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth, formatAuthError } from '@/contexts/AuthContext'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import type { UserRole } from '@/lib/permissions'
import { AuthBackground } from './AuthBackground'
import { toast } from 'sonner'

interface ProfileCompletionPageProps {
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

export function ProfileCompletionPage({ onNavigate }: ProfileCompletionPageProps) {
  const { user, profile, updateProfile, isLoading } = useAuth()
  const [department, setDepartment] = useState('Finance')
  const [role, setRole] = useState<UserRole>('FINANCE_ANALYST')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Pre-fill from profile if already set
  useEffect(() => {
    if (profile?.department) {
      setDepartment(profile.department)
    }
    if (profile?.role) {
      setRole(profile.role as UserRole)
    }
  }, [profile])

  // If user has no auth session, redirect to login
  useEffect(() => {
    if (!isLoading && !user) {
      onNavigate('/login')
    }
  }, [isLoading, user, onNavigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setErrorMessage(null)

    setIsSubmitting(true)
    const { error } = await updateProfile({
      department,
      role
    })
    setIsSubmitting(false)

    if (error) {
      const userMessage = formatAuthError(error)
      setErrorMessage(userMessage)
      toast.error(userMessage)
    } else {
      toast.success('Profile completed successfully!')
      onNavigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#061120] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <FinShieldLogo variant="compact" size="md" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">FinShield</h1>
          <p className="text-xs text-slate-400 font-medium">
            Organizational Assignment
          </p>
        </div>

        {/* Profile Completion Card */}
        <Card className="p-6 sm:p-8 bg-[#0B1F3A]/90 backdrop-blur-xl border-[#16365C] shadow-2xl space-y-5">
          <div className="border-b border-[#16365C] pb-3.5">
            <h2 className="text-base font-semibold text-white">Complete Profile</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your department and operational role to configure your FinShield access.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-[#071322]/80 border border-[#16365C] focus:border-[#00B87C] text-xs text-white outline-none transition-all disabled:opacity-60"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept} className="bg-[#0B1F3A] text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                disabled={isSubmitting}
                className="w-full h-10 px-3 rounded-md bg-[#071322]/80 border border-[#16365C] focus:border-[#00B87C] text-xs text-white outline-none transition-all disabled:opacity-60"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value} className="bg-[#0B1F3A] text-white">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-[#00B87C] hover:bg-[#009E6A] text-[#061120] font-bold text-xs gap-2 mt-2 shadow-md shadow-[#00B87C]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  Continue
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

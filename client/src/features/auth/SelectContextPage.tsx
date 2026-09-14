import React, { useState, useEffect } from 'react'
import { Building, UserCheck, ArrowRight, AlertCircle, Loader2, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth, formatAuthError } from '@/contexts/AuthContext'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import { apiClient } from '@/services/apiClient'
import type { UserRole } from '@/lib/permissions'
import { AuthBackground } from './AuthBackground'
import { toast } from 'sonner'

interface SelectContextPageProps {
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
  { value: 'ADMIN', label: 'Admin' },
  { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
  { value: 'FINANCE_ANALYST', label: 'Finance Analyst' },
  { value: 'EMPLOYEE', label: 'Employee' }
]

function getRoleLabel(roleValue: string): string {
  const match = ROLES.find(r => r.value === roleValue)
  return match ? match.label : roleValue
}

export function SelectContextPage({ onNavigate }: SelectContextPageProps) {
  const { user, profile, updateProfile, refreshProfile, logout, isLoading } = useAuth()
  const [selectedDepartment, setSelectedDepartment] = useState<string>(profile?.department || 'Finance')
  const [selectedRole, setSelectedRole] = useState<string>(profile?.role || 'ADMIN')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      onNavigate('/login')
    }
  }, [isLoading, user, onNavigate])

  // Sync with loaded profile if available
  useEffect(() => {
    if (profile?.department) {
      setSelectedDepartment(profile.department)
    }
    if (profile?.role) {
      setSelectedRole(profile.role)
    }
  }, [profile])

  // Check if profile is active; if inactive or suspended, force sign out
  useEffect(() => {
    if (profile && (profile.status === 'INACTIVE' || profile.status === 'SUSPENDED')) {
      logout()
      toast.error('Your FinShield account is not currently active.')
      onNavigate('/login')
    }
  }, [profile, logout, onNavigate])

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setErrorMessage(null)

    if (!selectedDepartment) {
      setErrorMessage('Please select your Department.')
      return
    }

    if (!selectedRole) {
      setErrorMessage('Please select your Role.')
      return
    }

    setIsSubmitting(true)

    try {
      // HACKATHON PROTOTYPE: Any authenticated user may select any Department + Role.
      // Persist selection via backend context endpoint
      try {
        await apiClient.post('/api/users/context', {
          department: selectedDepartment,
          role: selectedRole
        })
      } catch (backendErr: any) {
        console.warn('[FIN-SHIELD RBAC] Backend context route fallback:', backendErr.message)
        const { error: fallbackErr } = await updateProfile({
          department: selectedDepartment,
          role: selectedRole as UserRole,
          status: 'ACTIVE'
        })

        if (fallbackErr) {
          setIsSubmitting(false)
          const userMessage = formatAuthError(fallbackErr)
          setErrorMessage(userMessage)
          toast.error(userMessage)
          return
        }
      }

      await refreshProfile()
      setIsSubmitting(false)
      toast.success(`Workspace confirmed: ${selectedDepartment} / ${getRoleLabel(selectedRole)}`)
      onNavigate('/dashboard')
    } catch (err: any) {
      setIsSubmitting(false)
      console.error('[FIN-SHIELD RBAC] Context selection error:', err)
      setErrorMessage(err.message || 'Validation failed. Please try again.')
    }
  }

  const handleSignOut = async () => {
    await logout()
    onNavigate('/login')
  }

  return (
    <div className="min-h-screen w-full bg-[#061120] text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* FinShield Branding Header */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <FinShieldLogo variant="compact" size="md" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">FinShield</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00B87C]/15 border border-[#00B87C]/40 text-[#00B87C] font-bold uppercase tracking-wider">
              ENTERPRISE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Autonomous Financial Risk & Operations Intelligence
          </p>
        </div>

        {/* Workspace Context Selection Card */}
        <Card className="p-6 sm:p-8 bg-[#0B1F3A]/90 backdrop-blur-xl border-[#16365C] shadow-2xl space-y-5">
          <div className="border-b border-[#16365C] pb-3.5">
            <h2 className="text-base font-semibold text-white">Select your FinShield workspace</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose your department and role to continue.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleConfirm} className="space-y-4">
            {/* Department Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedDepartment}
                  onChange={e => {
                    setSelectedDepartment(e.target.value)
                    setErrorMessage(null)
                  }}
                  disabled={isSubmitting}
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-[#071322]/80 border border-[#16365C] focus:border-[#00B87C] text-xs text-white outline-none transition-all disabled:opacity-60"
                >
                  <option value="" disabled className="bg-[#0B1F3A] text-slate-500">
                    [ Select Department ▼ ]
                  </option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept} className="bg-[#0B1F3A] text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Role
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedRole}
                  onChange={e => {
                    setSelectedRole(e.target.value)
                    setErrorMessage(null)
                  }}
                  disabled={isSubmitting}
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-[#071322]/80 border border-[#16365C] focus:border-[#00B87C] text-xs text-white outline-none transition-all disabled:opacity-60"
                >
                  <option value="" disabled className="bg-[#0B1F3A] text-slate-500">
                    [ Select Role ▼ ]
                  </option>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value} className="bg-[#0B1F3A] text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Confirm & Continue Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-[#00B87C] hover:bg-[#009E6A] text-[#061120] font-bold text-xs gap-2 mt-2 shadow-md shadow-[#00B87C]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  Confirm & Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* User Sign Out option */}
          <div className="pt-3 border-t border-[#16365C] flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] truncate max-w-[200px] text-slate-500">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

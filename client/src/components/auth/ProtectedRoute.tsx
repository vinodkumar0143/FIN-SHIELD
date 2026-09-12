import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { Permission, UserRole } from '@/lib/permissions'
import { ForbiddenPage } from '@/features/auth/ForbiddenPage'
import { Shield } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: Permission
  requiredRole?: UserRole | UserRole[]
  onNavigate: (path: string) => void
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  onNavigate
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role, hasPermission } = useAuth()

  // 1. Sleek Sentinel loading skeleton to prevent any auth flicker
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center animate-pulse">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="absolute inset-0 rounded-xl border-2 border-cyan-500/40 animate-ping pointer-events-none" />
        </div>
        <div className="text-center space-y-1">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
            Verifying Sentinel Clearance...
          </span>
          <span className="text-[11px] text-muted-foreground">
            Authenticating cryptographic session with Supabase
          </span>
        </div>
      </div>
    )
  }

  // 2. Unauthenticated check -> Redirect to /login
  if (!isAuthenticated) {
    return <ForbiddenPage type="401" onNavigate={onNavigate} />
  }

  // 3. Permission check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <ForbiddenPage
        type="403"
        requiredPermission={requiredPermission}
        onNavigate={onNavigate}
      />
    )
  }

  // 4. Role check
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(role)) {
      return (
        <ForbiddenPage
          type="403"
          requiredPermission={`Role in [${roles.join(', ')}]`}
          onNavigate={onNavigate}
        />
      )
    }
  }

  return <>{children}</>
}

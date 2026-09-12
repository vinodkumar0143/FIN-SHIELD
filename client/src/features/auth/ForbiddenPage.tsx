import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'

interface ForbiddenPageProps {
  type?: '403' | '401'
  requiredPermission?: string
  onNavigate: (path: string) => void
}

export function ForbiddenPage({
  type = '403',
  requiredPermission,
  onNavigate
}: ForbiddenPageProps) {
  const { role, profile, logout } = useAuth()

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-card/80 border-border/80 text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-rose-400" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-rose-400 font-bold bg-rose-950/50 px-2.5 py-0.5 rounded border border-rose-800">
            {type === '403' ? '403 ACCESS FORBIDDEN' : '401 AUTHENTICATION REQUIRED'}
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {type === '403' ? 'Permission Boundary Enforced' : 'Session Expired or Missing'}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {type === '403' ? (
              <>
                Your assigned corporate role (<span className="text-cyan-400 font-bold">{role}</span>) does not possess the requisite clearance to access this financial intelligence sector.
              </>
            ) : (
              'You must be signed into a verified enterprise operator session to view this resource.'
            )}
          </p>

          {requiredPermission && (
            <div className="pt-2">
              <span className="text-[10px] font-mono text-muted-foreground block mb-1">Required Authority Clearance:</span>
              <Badge variant="warning" size="sm">{requiredPermission}</Badge>
            </div>
          )}
        </div>

        <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 text-left text-xs font-mono space-y-1">
          <div className="text-muted-foreground">Operator: <strong className="text-foreground">{profile?.full_name || 'Guest'}</strong></div>
          <div className="text-muted-foreground">Current Role: <strong className="text-cyan-400">{role}</strong></div>
          <div className="text-muted-foreground">Security Layer: <strong className="text-foreground">FIN-SHIELD Sentinel RBAC v3.0</strong></div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs gap-1.5"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Dashboard
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto text-xs text-rose-400 hover:text-rose-300 gap-1.5"
            onClick={async () => {
              await logout()
              onNavigate('/login')
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch Account
          </Button>
        </div>
      </Card>
    </div>
  )
}

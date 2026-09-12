import { useState, useEffect } from 'react'
import { TrendingUp, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_ESCALATIONS, type EscalationRecord as MockEscalation } from './data/operationsMockData'
import { workflowService, type EscalationRecord } from '@/services/workflowService'
import { type RiskLevel } from '@/lib/utils'
import { toast } from 'sonner'

import { ConfirmActionModal } from '@/components/ui/ConfirmActionModal'

interface EscalationsPageProps {
  onNavigate?: (path: string) => void
}

export function EscalationsPage({ onNavigate: _onNavigate }: EscalationsPageProps) {
  const [escalations, setEscalations] = useState<MockEscalation[]>(MOCK_ESCALATIONS)
  const [loading, setLoading] = useState(false)
  const [pendingResolve, setPendingResolve] = useState<MockEscalation | null>(null)

  const loadEscalations = async () => {
    try {
      setLoading(true)
      const data: EscalationRecord[] = await workflowService.getEscalations()
      if (data && data.length > 0) {
        const mapped: MockEscalation[] = data.map(d => ({
          id: d.id,
          escalationId: `ESC-${d.id.slice(0, 6).toUpperCase()}`,
          entity: `${d.entity_type} ${d.entity_id}`,
          severity: (d.severity.toLowerCase() as RiskLevel),
          reason: d.reason,
          assignedRole: 'Fraud & Forensic Committee',
          assignedUser: d.assigned_to ? 'Assigned Investigator' : 'Triage Queue',
          age: 'Active',
          status: (d.status === 'RESOLVED' ? 'RESOLVED' : d.status === 'INVESTIGATING' ? 'UNDER_REVIEW' : 'ACTIVE'),
          priority: (d.severity === 'CRITICAL' ? 'URGENT' : d.severity === 'HIGH' ? 'HIGH' : 'MEDIUM')
        }))

        const existingEntities = new Set(mapped.map(m => m.entity))
        const combined = [...mapped, ...MOCK_ESCALATIONS.filter(m => !existingEntities.has(m.entity))]
        setEscalations(combined)
      }
    } catch (err) {
      console.warn('[EscalationsPage] Using seed escalations', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEscalations()

    const unsubscribe = workflowService.subscribeToOperations((payload) => {
      if (payload.table === 'escalations') {
        loadEscalations()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleConfirmResolve = async (reason: string) => {
    if (!pendingResolve) return
    try {
      await workflowService.resolveEscalation(pendingResolve.id, reason)
      setEscalations(prev =>
        prev.map(e => (e.id === pendingResolve.id ? { ...e, status: 'RESOLVED' } : e))
      )
      toast.success(`Escalation ${pendingResolve.escalationId} marked as RESOLVED`)
      setPendingResolve(null)
    } catch {
      setEscalations(prev =>
        prev.map(e => (e.id === pendingResolve.id ? { ...e, status: 'RESOLVED' } : e))
      )
      toast.success(`Escalation ${pendingResolve.escalationId} marked as RESOLVED`)
      setPendingResolve(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400 bg-rose-950/50 border border-rose-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-rose-400" />
              OPERATIONS
            </span>
            <span className="text-xs text-muted-foreground">Executive Escalation Matrix</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Management Escalations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Active high-severity financial breaches routed to CFO, Audit Committee, and Division Directors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={loadEscalations}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Escalations'}
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Active Escalations</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {escalations.filter(e => e.status !== 'RESOLVED').length} Open Cases
          </div>
          <span className="text-xs text-rose-400/80">Pending executive committee action</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Highest Priority</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">URGENT</div>
          <span className="text-xs text-muted-foreground">INV-20481 / Acme Industrial</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Average Resolution SLA</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">48 Hours</div>
          <span className="text-xs text-emerald-400">All within compliance window</span>
        </Card>
      </div>

      {/* Escalations Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Escalation ID</th>
                <th className="py-3 px-4">Subject Entity</th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4">Reason & Findings</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {escalations.map(esc => {
                const isUrgent = esc.priority === 'URGENT'
                const isOpen = esc.status !== 'RESOLVED'
                return (
                  <tr
                    key={esc.id}
                    className={`transition-colors ${
                      isUrgent ? 'bg-rose-950/20 hover:bg-rose-950/35 border-l-2 border-l-rose-500' : 'hover:bg-accent/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {esc.escalationId}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {esc.entity}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <RiskBadge level={esc.severity} score={esc.severity === 'critical' ? 88 : 72} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground max-w-sm">
                      {esc.reason}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {esc.assignedRole}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isUrgent ? (
                        <Badge variant="error" size="sm">URGENT</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">HIGH</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {esc.status === 'RESOLVED' ? (
                        <Badge variant="success" size="sm">RESOLVED</Badge>
                      ) : esc.status === 'UNDER_REVIEW' ? (
                        <Badge variant="warning" size="sm">REVIEWING</Badge>
                      ) : (
                        <Badge variant="error" size="sm">OPEN</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isOpen ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/20"
                          onClick={() => setPendingResolve(esc)}
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Resolve
                        </Button>
                      ) : (
                        <span className="text-[11px] font-mono text-muted-foreground">Closed</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resolution Confirmation Modal */}
      {pendingResolve && (
        <ConfirmActionModal
          open={!!pendingResolve}
          onOpenChange={(val) => {
            if (!val) setPendingResolve(null)
          }}
          title={`Resolve Escalation ${pendingResolve.escalationId}`}
          description={`Provide sign-off rationale for resolving this executive escalation concerning ${pendingResolve.entity}.`}
          actionType="RELEASE"
          entityId={pendingResolve.escalationId}
          entityName={pendingResolve.entity}
          onConfirm={handleConfirmResolve}
          confirmButtonText="Sign-Off & Resolve"
        />
      )}
    </div>
  )
}

import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_ESCALATIONS } from './data/operationsMockData'
import { toast } from 'sonner'

interface EscalationsPageProps {
  onNavigate: (path: string) => void
}

export function EscalationsPage({ onNavigate }: EscalationsPageProps) {

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

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => toast.success('Escalation SLA monitors updated')}
        >
          Check SLA Timers
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Active Escalations</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">{MOCK_ESCALATIONS.length} Open Cases</div>
          <span className="text-xs text-rose-400/80">Pending executive committee action</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Highest Priority</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">URGENT</div>
          <span className="text-xs text-muted-foreground">INV-28491 (ABC Supplies)</span>
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
                <th className="py-3 px-4">Breach Rationale</th>
                <th className="py-3 px-4">Assigned Authority</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {MOCK_ESCALATIONS.map(esc => (
                <tr key={esc.id} className="hover:bg-accent/30 cursor-pointer transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                    {esc.escalationId}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    {esc.entity}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <RiskBadge level={esc.severity} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground max-w-xs leading-relaxed text-xs">
                    {esc.reason}
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-foreground text-xs">{esc.assignedUser}</div>
                    <div className="text-[10px] text-muted-foreground">{esc.assignedRole}</div>
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground font-mono">
                    {esc.age}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={esc.status === 'ACTIVE' ? 'error' : 'warning'} size="sm">
                      {esc.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-cyan-400"
                      onClick={() => {
                        if (esc.id === 'esc-1') onNavigate('/investigations/inv-28491')
                        else onNavigate('/budgets/bgt-ops')
                      }}
                    >
                      Dossier
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

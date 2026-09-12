import {
  GitBranch,
  ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_WORKFLOWS } from './data/operationsMockData'
import { toast } from 'sonner'

interface WorkflowsPageProps {
  onNavigate: (path: string) => void
}

export function WorkflowsPage({ onNavigate }: WorkflowsPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <GitBranch className="w-3 h-3 text-cyan-400" />
              ENTERPRO INTEGRATION
            </span>
            <span className="text-xs text-muted-foreground">Automated Operational Pipelines</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Workflow Orchestration Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time execution telemetry for autonomous payment holds, escalation routing, and multi-signature approvals.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => toast.success('EnterPro workflow bus synchronized')}
        >
          Sync EnterPro Bus
        </Button>
      </div>

      {/* Pipeline Stage Indicators */}
      <Card className="p-4 bg-card/60 border-border/70">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          FIN-SHIELD → EnterPro Execution Lifecycle
        </div>
        <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs font-mono pb-1">
          {['1. Trigger Detection', '2. Forensic Analysis', '3. Escrow Hold', '4. Human Review', '5. Final Settlement'].map((stage, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded bg-secondary/50 border border-border/60 text-foreground font-semibold">
                {stage}
              </span>
              {i < 4 && <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Workflows Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            Active & Historical Workflow Instances
          </h3>
          <Badge variant="neutral" size="sm">{MOCK_WORKFLOWS.length} Orchestrations Tracked</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Workflow ID</th>
                <th className="py-3 px-4">Triggering Event</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Current Active Step</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {MOCK_WORKFLOWS.map(wf => (
                <tr
                  key={wf.id}
                  onClick={() => onNavigate(`/workflows/${wf.id}`)}
                  className="hover:bg-accent/30 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    <span className="text-cyan-400">{wf.workflowId}</span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-foreground">
                    {wf.triggerEvent}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-muted-foreground">
                    {wf.targetEntity}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-amber-300">
                    {wf.currentStep}
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                    {wf.duration}
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans">
                    {wf.status === 'HOLD_PLACED' ? (
                      <Badge variant="warning" size="sm">HOLD ACTIVE</Badge>
                    ) : (
                      <Badge variant="info" size="sm">ACTIVE</Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-cyan-400"
                      onClick={() => onNavigate(`/workflows/${wf.id}`)}
                    >
                      Inspect
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

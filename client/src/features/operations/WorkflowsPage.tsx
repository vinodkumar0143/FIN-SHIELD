import { useState, useEffect } from 'react'
import {
  GitBranch,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_WORKFLOWS, type WorkflowItem } from './data/operationsMockData'
import { workflowService, type WorkflowExecution } from '@/services/workflowService'
import { toast } from 'sonner'

interface WorkflowsPageProps {
  onNavigate: (path: string) => void
}

export function WorkflowsPage({ onNavigate }: WorkflowsPageProps) {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(MOCK_WORKFLOWS)
  const [loading, setLoading] = useState(false)

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      const data: WorkflowExecution[] = await workflowService.getWorkflows()
      if (data && data.length > 0) {
        const mapped: WorkflowItem[] = data.map(d => ({
          id: d.taskId,
          workflowId: d.taskId,
          triggerEvent: `${d.workflowType} Triggered`,
          targetEntity: `${d.entityType} ${d.entityId}`,
          status: (d.status === 'COMPLETED' ? 'COMPLETED' : d.erpSyncStatus === 'ERP_LOCKED' ? 'HOLD_PLACED' : 'ACTIVE'),
          currentStep: d.steps.find(s => s.status === 'in_progress')?.name || 'Operational Review',
          startTime: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:14 AM',
          duration: 'Active',
          steps: d.steps
        }))

        const existingIds = new Set(mapped.map(m => m.workflowId))
        const combined = [...mapped, ...MOCK_WORKFLOWS.filter(m => !existingIds.has(m.workflowId))]
        setWorkflows(combined)
      }
    } catch (err) {
      console.warn('[WorkflowsPage] Using seed workflows', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows()

    const unsubscribe = workflowService.subscribeToOperations((payload) => {
      if (payload.table === 'workflow_tasks') {
        loadWorkflows()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleSync = async () => {
    toast.promise(loadWorkflows(), {
      loading: 'Polling EnterPro ERP webhook bridge...',
      success: 'EnterPro workflow bus synchronized',
      error: 'Sync completed with cached state'
    })
  }

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
          onClick={handleSync}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
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
          <Badge variant="neutral" size="sm">{workflows.length} Orchestrations Tracked</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Workflow ID</th>
                <th className="py-3 px-4">Trigger Event</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Current Milestone</th>
                <th className="py-3 px-4 font-mono text-center">Start Time</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {workflows.map(wf => (
                <tr
                  key={wf.id}
                  onClick={() => onNavigate(`/workflows/${wf.workflowId}`)}
                  className="cursor-pointer hover:bg-accent/40 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                    {wf.workflowId}
                  </td>

                  <td className="py-3.5 px-4 text-foreground font-medium">
                    {wf.triggerEvent}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-cyan-300">
                    {wf.targetEntity}
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      {wf.currentStep}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-center text-muted-foreground">
                    {wf.startTime}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {wf.status === 'HOLD_PLACED' ? (
                      <Badge variant="warning" size="sm">HOLD PLACED</Badge>
                    ) : wf.status === 'COMPLETED' ? (
                      <Badge variant="success" size="sm">COMPLETED</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">ACTIVE</Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono text-[11px] text-cyan-400 underline decoration-cyan-500/40">
                      Inspect Trace →
                    </span>
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

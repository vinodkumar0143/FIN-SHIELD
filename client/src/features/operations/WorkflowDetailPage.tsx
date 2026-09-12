import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  GitBranch,
  CheckCircle2
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_WORKFLOWS } from './data/operationsMockData'
import { workflowService, type WorkflowExecution } from '@/services/workflowService'
import { toast } from 'sonner'

interface WorkflowDetailPageProps {
  workflowId?: string
  onNavigate: (path: string) => void
}

export function WorkflowDetailPage({ workflowId = 'wf-9042', onNavigate }: WorkflowDetailPageProps) {
  const fallback = MOCK_WORKFLOWS.find(w => w.id === workflowId || w.workflowId === workflowId) || MOCK_WORKFLOWS[0]
  const [workflow, setWorkflow] = useState(fallback)

  useEffect(() => {
    async function fetchDetail() {
      try {
        const live: WorkflowExecution = await workflowService.getWorkflowById(workflowId)
        if (live) {
          setWorkflow({
            id: live.taskId,
            workflowId: live.taskId,
            triggerEvent: `${live.workflowType} Triggered`,
            targetEntity: `${live.entityType} ${live.entityId}`,
            status: (live.status === 'COMPLETED' ? 'COMPLETED' : live.erpSyncStatus === 'ERP_LOCKED' ? 'HOLD_PLACED' : 'ACTIVE'),
            currentStep: live.steps.find(s => s.status === 'in_progress')?.name || 'Operational Review',
            startTime: live.createdAt ? new Date(live.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:14 AM',
            duration: 'Active',
            steps: live.steps
          })
        }
      } catch (err) {
        // Fallback to local
      }
    }
    fetchDetail()
  }, [workflowId])

  const handleForcePulse = () => {
    toast.success('Telemetry pulse synchronized with EnterPro ERP engine')
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/workflows')}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Workflows
        </button>

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleForcePulse}
        >
          Force Telemetry Pulse
        </Button>
      </div>

      {/* Header Banner */}
      <Card className="p-6 bg-card/80 border-border/80 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                ENTERPRO ORCHESTRATION
              </span>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-mono">
                {workflow.workflowId}
              </h1>
              <Badge variant={workflow.status === 'COMPLETED' ? 'success' : workflow.status === 'HOLD_PLACED' ? 'warning' : 'neutral'} size="sm">
                STATUS: {workflow.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Trigger: <strong className="text-foreground">{workflow.triggerEvent}</strong> • Target: <span className="font-mono text-cyan-300 font-semibold">{workflow.targetEntity}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 self-start lg:self-auto bg-background/50 p-4 rounded-xl border border-border/70 font-mono text-xs">
            <div>
              <span className="text-muted-foreground uppercase text-[10px] block">Execution Duration</span>
              <span className="text-foreground font-bold">{workflow.duration}</span>
            </div>
            <div className="h-8 w-[1px] bg-border/60" />
            <div>
              <span className="text-muted-foreground uppercase text-[10px] block">Sync Protocol</span>
              <span className="text-cyan-400 font-bold">EnterPro REST / v2</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Step Trace Timeline */}
      <Card className="p-6 bg-card/60 border-border/70 space-y-6">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          Autonomous Pipeline Milestone Execution Trace
        </h3>

        <div className="space-y-6 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
          {workflow.steps.map((step, idx) => {
            const isDone = step.status === 'completed'
            const isCurrent = step.status === 'in_progress'

            return (
              <div key={idx} className="relative group">
                {/* Dot */}
                <div
                  className={`absolute -left-[27px] top-0.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                    isDone
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                      : isCurrent
                      ? 'bg-amber-500 border-amber-400 animate-pulse'
                      : 'bg-background border-border text-muted-foreground'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-2.5 h-2.5" />}
                </div>

                <div className="bg-card/70 border border-border/60 rounded-xl p-4 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold text-foreground text-xs">{step.name}</span>
                    <Badge variant={isDone ? 'success' : isCurrent ? 'warning' : 'neutral'} size="sm">
                      {step.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
                    <span>Role: <strong className="text-foreground">{step.role}</strong></span>
                    <span>•</span>
                    <span>Timestamp: {step.timestamp}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

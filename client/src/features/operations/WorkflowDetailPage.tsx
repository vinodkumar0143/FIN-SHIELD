import {
  ArrowLeft,
  GitBranch,
  CheckCircle2
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_WORKFLOWS } from './data/operationsMockData'
import { toast } from 'sonner'

interface WorkflowDetailPageProps {
  workflowId?: string
  onNavigate: (path: string) => void
}

export function WorkflowDetailPage({ workflowId = 'wf-9042', onNavigate }: WorkflowDetailPageProps) {
  const workflow = MOCK_WORKFLOWS.find(w => w.id === workflowId) || MOCK_WORKFLOWS[0]

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
          onClick={() => toast.info('Forcing pipeline step transition evaluation')}
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
              <Badge variant="warning" size="sm">
                STATUS: {workflow.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Trigger: <strong className="text-foreground">{workflow.triggerEvent}</strong> • Target: <span className="font-mono text-cyan-300 font-semibold">{workflow.targetEntity}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase">Active Runtime</span>
            <div className="text-2xl font-bold font-mono text-foreground mt-0.5">{workflow.duration}</div>
            <div className="text-xs text-muted-foreground font-mono">Started: {workflow.startTime}</div>
          </div>
        </div>
      </Card>

      {/* Step Progression Timeline */}
      <Card className="p-6 bg-card/60 border-border/70 space-y-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          Step Progression Pipeline
        </h3>

        <div className="space-y-4">
          {workflow.steps.map((step, idx) => {
            const isDone = step.status === 'completed'
            const isCurrent = step.status === 'in_progress'

            return (
              <div key={idx} className="flex items-start gap-3 relative">
                {idx < workflow.steps.length - 1 && (
                  <div className="absolute left-2.5 top-5 bottom-0 w-px bg-border/80" />
                )}

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 ${
                    isDone
                      ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-400'
                      : isCurrent
                      ? 'bg-amber-500/20 border border-amber-400 text-amber-300 animate-pulse'
                      : 'bg-secondary border border-border text-muted-foreground'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  )}
                </div>

                <div className="flex-1 p-3 rounded-lg bg-secondary/25 border border-border/40 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isCurrent ? 'text-amber-300' : 'text-foreground'}`}>
                      {step.name}
                    </span>
                    <span className="font-mono text-muted-foreground text-[11px]">{step.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Responsible Role: <strong className="text-foreground">{step.role}</strong>
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

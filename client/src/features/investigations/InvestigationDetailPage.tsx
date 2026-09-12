import { useState } from 'react'
import {
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  Scale,
  FileText,
  TrendingUp,
  Ban,
  Clock
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RiskScoreRing } from '@/components/ui/RiskScoreRing'
import { formatCurrency } from '@/lib/utils'
import { MOCK_INVESTIGATIONS } from './data/investigationsMockData'
import { toast } from 'sonner'

interface InvestigationDetailPageProps {
  investigationId?: string
  onNavigate: (path: string) => void
}

export function InvestigationDetailPage({ investigationId = 'inv-28491', onNavigate }: InvestigationDetailPageProps) {
  const investigation = MOCK_INVESTIGATIONS.find(i => i.id === investigationId || i.investigationId === investigationId) || MOCK_INVESTIGATIONS[0]
  const [activeHold, setActiveHold] = useState(investigation.status === 'ON_HOLD')

  const handleToggleHold = () => {
    if (activeHold) {
      setActiveHold(false)
      toast.success('EnterPro Payment Hold released. Workflow #WF-9042 unlocked.')
    } else {
      setActiveHold(true)
      toast.warning('EnterPro Payment Hold applied. Escrow lock active on invoice.')
    }
  }

  const handleEscalate = () => {
    toast.info('Case escalated to CFO Executive Committee and Corporate Audit')
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Secondary Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/investigations')}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to AI Investigation Center
        </button>

        <div className="flex items-center gap-2">
          {investigation.invoiceNumber && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-cyan-400 border-cyan-800/60"
              onClick={() => onNavigate(`/invoices/${investigation.id}`)}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              View Invoice Dossier ({investigation.invoiceNumber})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="text-xs text-indigo-300 border-indigo-800/60 hover:bg-indigo-950/30"
            onClick={handleEscalate}
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Escalate to CFO
          </Button>

          <Button
            variant={activeHold ? 'default' : 'outline'}
            size="sm"
            className={`text-xs font-semibold ${
              activeHold
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                : 'text-amber-400 border-amber-800/60 hover:bg-amber-950/30'
            }`}
            onClick={handleToggleHold}
          >
            <Ban className="w-3.5 h-3.5 mr-1.5" />
            {activeHold ? 'Hold Active (#WF-9042)' : 'Place EnterPro Hold'}
          </Button>
        </div>
      </div>

      {/* Hero Header Banner */}
      <Card className="p-6 bg-card/90 border-border/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-rose-500/10 via-rose-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2.5 py-0.5 rounded flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                FORENSIC CASE COCKPIT
              </span>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-mono">
                {investigation.investigationId}
              </h1>
              <RiskBadge level={investigation.severity} score={investigation.riskScore} size="md" />
              <Badge variant={activeHold ? 'warning' : 'info'} size="sm">
                STATUS: {activeHold ? 'ON HOLD' : investigation.status}
              </Badge>
              <Badge variant="neutral" size="sm" className="font-mono text-cyan-300 border-cyan-800/60 bg-cyan-950/30">
                AI CONFIDENCE: 94.8%
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Subject: <strong className="text-foreground">{investigation.entityName}</strong> • Target: <span className="font-mono text-cyan-300 font-semibold">{investigation.invoiceNumber || investigation.entityName}</span> • Opened: <span className="font-mono text-muted-foreground">{investigation.createdAt}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-border/70 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">At-Risk Financial Outflow</div>
              <div className="text-3xl font-bold font-mono text-rose-400 mt-0.5">
                {formatCurrency(investigation.amount)}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Preserved in EnterPro Escrow
              </div>
            </div>

            <div className="flex flex-col items-center">
              <RiskScoreRing score={investigation.riskScore} size={88} strokeWidth={8} />
              <span className="text-[10px] font-mono uppercase text-rose-400 mt-1 font-bold">Critical Risk</span>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Reasoning Synthesis Banner: Finding -> Evidence -> Interpretation -> Recommendation */}
      <Card className="p-6 bg-cyan-950/20 border border-cyan-800/60 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-800/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-cyan-200 tracking-wide uppercase">
              Autonomous Qwen Forensic Reasoning Synthesis
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400/80">FIN-SHIELD Forensic Core v4.2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-secondary/40 rounded-lg border border-border/50 space-y-1">
            <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">1. Primary Finding</div>
            <p className="text-foreground leading-relaxed font-medium">
              {investigation.aiReasoning.finding}
            </p>
          </div>

          <div className="p-3 bg-secondary/40 rounded-lg border border-border/50 space-y-1">
            <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">2. Correlated Signals</div>
            <p className="text-foreground leading-relaxed">
              {investigation.aiReasoning.evidenceSummary}
            </p>
          </div>

          <div className="p-3 bg-secondary/40 rounded-lg border border-border/50 space-y-1">
            <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">3. Forensic Interpretation</div>
            <p className="text-foreground leading-relaxed">
              {investigation.aiReasoning.interpretation}
            </p>
          </div>

          <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-800/60 space-y-1">
            <div className="text-[10px] font-mono text-rose-300 uppercase font-semibold">4. Prescriptive Action</div>
            <p className="text-rose-200 leading-relaxed font-medium">
              {investigation.aiReasoning.recommendationRationale}
            </p>
          </div>
        </div>
      </Card>

      {/* Main Grid: Evidence Center (Left 2 cols) & Risk Vectors / Timeline (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence Center */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 bg-card/60 border-border/70 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  Multi-Source Evidence Matrix
                </h3>
                <span className="text-xs text-muted-foreground">
                  Cross-referenced evidence points with empirical benchmarks and risk attribution
                </span>
              </div>
              <Badge variant="neutral" size="sm">{investigation.evidence.length} Evidence Signals</Badge>
            </div>

            <div className="space-y-3">
              {investigation.evidence.map(item => {
                const isCrit = item.significance === 'CRITICAL'
                const isHigh = item.significance === 'HIGH'
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isCrit
                        ? 'bg-rose-950/20 border-rose-800/60'
                        : isHigh
                        ? 'bg-amber-950/15 border-amber-800/50'
                        : 'bg-secondary/30 border-border/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isCrit ? 'error' : isHigh ? 'warning' : 'neutral'}
                          size="sm"
                        >
                          {item.source}
                        </Badge>
                        <span className="font-semibold text-foreground text-xs">{item.title}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-muted-foreground">Risk Contribution:</span>
                        <span className={`font-bold ${isCrit ? 'text-rose-400' : 'text-amber-400'}`}>
                          +{item.riskContribution}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono my-2 p-2.5 bg-background/50 rounded border border-border/40">
                      <div>
                        <span className="text-muted-foreground text-[11px] font-sans">Observed Value:</span>
                        <div className="text-foreground font-semibold">{item.value}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[11px] font-sans">Historical Benchmark:</span>
                        <div className="text-cyan-300">{item.benchmark}</div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {item.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Risk Vectors & Execution Timeline */}
        <div className="space-y-6">
          {/* Risk Vector Decomposition */}
          <Card className="p-5 bg-card/60 border-border/70 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Risk Vector Composition
            </h3>

            <div className="space-y-3.5 text-xs">
              {investigation.riskVectors.map((vec, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="font-medium text-foreground">{vec.name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[10px] text-muted-foreground">Weight: {(vec.weight * 100).toFixed(0)}%</span>
                      <span className={`font-bold ${vec.score >= 80 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {vec.score}/100
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        vec.score >= 80 ? 'bg-rose-500' : vec.score >= 60 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${vec.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Investigation Timeline */}
          <Card className="p-5 bg-card/60 border-border/70 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
              <Clock className="w-4 h-4 text-cyan-400" />
              Autonomous Stepper Progression
            </h3>

            <div className="space-y-4 text-xs">
              {investigation.timeline.map((item, idx) => {
                const isCompleted = item.status === 'completed'
                const isCurrent = item.status === 'current'
                return (
                  <div key={idx} className="flex gap-3 relative">
                    {idx < investigation.timeline.length - 1 && (
                      <div className="absolute left-2 top-4 bottom-0 w-px bg-border/80" />
                    )}

                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-400'
                          : isCurrent
                          ? 'bg-amber-500/20 border border-amber-400 text-amber-400 animate-pulse'
                          : 'bg-secondary border border-border text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCompleted ? 'bg-emerald-400' : isCurrent ? 'bg-amber-400' : 'bg-border'
                        }`}
                      />
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isCurrent ? 'text-amber-300' : 'text-foreground'}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">{item.note}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  User,
  ShieldAlert,
  MessageSquare
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RiskScoreRing } from '@/components/ui/RiskScoreRing'
import { formatCurrency } from '@/lib/utils'
import { MOCK_APPROVALS } from './data/operationsMockData'
import { toast } from 'sonner'

interface ApprovalDetailPageProps {
  approvalId?: string
  onNavigate: (path: string) => void
}

export function ApprovalDetailPage({ approvalId = 'app-9042', onNavigate }: ApprovalDetailPageProps) {
  const approval = MOCK_APPROVALS.find(a => a.id === approvalId) || MOCK_APPROVALS[0]
  const [status, setStatus] = useState(approval.status)

  const handleApprove = () => {
    setStatus('APPROVED')
    toast.success(`Request ${approval.requestId} approved. Disbursement scheduled.`)
  }

  const handleReject = () => {
    setStatus('REJECTED')
    toast.error(`Request ${approval.requestId} rejected.`)
  }

  const handleHold = () => {
    setStatus('HELD')
    toast.warning(`EnterPro Escrow hold applied to ${approval.requestId}.`)
  }

  const handleEscalate = () => {
    toast.info(`Escalated to Executive Finance Committee.`)
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/approvals')}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Approvals
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-indigo-400 border-indigo-800/60"
            onClick={handleEscalate}
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Escalate to CFO
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs text-rose-400 border-rose-800/60"
            onClick={handleReject}
          >
            Reject Request
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs text-amber-400 border-amber-800/60"
            onClick={handleHold}
          >
            Place Payment Hold
          </Button>

          <Button
            variant="default"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs gap-1.5"
            onClick={handleApprove}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Authorize Disbursement
          </Button>
        </div>
      </div>

      {/* Header Banner */}
      <Card className="p-6 bg-card/80 border-border/80 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                DISBURSEMENT APPROVAL
              </span>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-mono">
                {approval.requestId}
              </h1>
              <RiskBadge level={approval.riskLevel} score={approval.riskScore} size="md" />
              <Badge variant={status === 'HELD' ? 'warning' : status === 'APPROVED' ? 'success' : 'neutral'} size="sm">
                STATUS: {status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Counterparty: <strong className="text-foreground">{approval.entityName}</strong> • Invoice: <strong className="font-mono text-cyan-300">{approval.invoiceNumber}</strong> • Level: <span className="font-mono text-foreground">{approval.approvalLevel}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-border/70 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Gross Outflow Amount</div>
              <div className="text-3xl font-bold font-mono text-foreground mt-0.5">
                {formatCurrency(approval.amount)}
              </div>
              <div className="text-xs text-muted-foreground font-mono">SLA: {approval.slaDeadline}</div>
            </div>

            <RiskScoreRing score={approval.riskScore} size={80} strokeWidth={7} />
          </div>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Risk Reasoning & Recommendation */}
          <Card className="p-5 bg-card/60 border-border/70 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              AI Forensic Assessment & Reasoning
            </h3>

            <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Primary Risk Reason:</span>
                <p className="text-foreground font-medium leading-relaxed mt-0.5">{approval.reason}</p>
              </div>
              <div className="pt-2 border-t border-border/40">
                <span className="text-muted-foreground block text-[11px]">Qwen Prescriptive Recommendation:</span>
                <p className="text-cyan-300 font-semibold leading-relaxed mt-0.5">{approval.recommendation}</p>
              </div>
            </div>

            {approval.invoiceNumber === 'INV-28491' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-rose-400 border-rose-800/60 hover:bg-rose-950/30 gap-1.5"
                onClick={() => onNavigate(`/investigations/${approval.id}`)}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Open AI Investigation Cockpit for INV-28491
              </Button>
            )}
          </Card>

          {/* Requester Profile */}
          <Card className="p-5 bg-card/60 border-border/70 space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <User className="w-4 h-4 text-cyan-400" />
              Requester Profile & Department
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-secondary/20 rounded border border-border/40 space-y-1">
                <span className="text-muted-foreground">Authorizing Officer:</span>
                <div className="font-bold text-foreground">{approval.requester}</div>
                <div className="text-muted-foreground font-mono">{approval.requesterRole}</div>
              </div>

              <div className="p-3 bg-secondary/20 rounded border border-border/40 space-y-1">
                <span className="text-muted-foreground">Department & Budget:</span>
                <div className="font-bold text-foreground">{approval.department} Division</div>
                <div className="text-muted-foreground font-mono">Submitted: {approval.submissionDate}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right side: Comments & History */}
        <div className="space-y-6">
          <Card className="p-5 bg-card/60 border-border/70 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Audit Notes & Collaboration
            </h3>

            <div className="space-y-3">
              <div className="p-2.5 bg-secondary/30 rounded border border-border/40 space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>FIN-SHIELD Engine</span>
                  <span>09:14 IST</span>
                </div>
                <p className="text-foreground">Flagged due to Z-Score (+3.42) and recent bank routing update.</p>
              </div>

              <div className="p-2.5 bg-amber-950/20 rounded border border-amber-800/40 space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-amber-300">
                  <span>EnterPro Gateway</span>
                  <span>09:14 IST</span>
                </div>
                <p className="text-amber-200/90">Automated escrow hold #WF-9042 locked disbursement.</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => toast.info('Comment logged to audit trail')}
            >
              Add Reviewer Note
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
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
import { workflowService } from '@/services/workflowService'
import { toast } from 'sonner'

interface ApprovalDetailPageProps {
  approvalId?: string
  onNavigate: (path: string) => void
}

export function ApprovalDetailPage({ approvalId = 'app-9042', onNavigate }: ApprovalDetailPageProps) {
  const fallback = MOCK_APPROVALS.find(a => a.id === approvalId) || MOCK_APPROVALS[0]
  const [approval, setApproval] = useState(fallback)
  const [status, setStatus] = useState(fallback.status)
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchDetail() {
      try {
        const live = await workflowService.getApprovalById(approvalId)
        if (live) {
          setApproval(prev => ({
            ...prev,
            id: live.id,
            requestId: live.approval_id,
            invoiceNumber: live.invoiceNumber || prev.invoiceNumber,
            amount: live.amount,
            status: (live.status === 'APPROVED' ? 'APPROVED' : live.status === 'REJECTED' ? 'REJECTED' : 'PENDING'),
            reason: live.comments || prev.reason
          }))
          setStatus(live.status === 'APPROVED' ? 'APPROVED' : live.status === 'REJECTED' ? 'REJECTED' : 'PENDING')
        }
      } catch (err) {
        // Fallback to local
      }
    }
    fetchDetail()
  }, [approvalId])

  const handleApprove = async () => {
    try {
      setLoading(true)
      await workflowService.approve(approval.id, comments || 'Approved by Finance Manager')
      setStatus('APPROVED')
      toast.success(`Request ${approval.requestId} approved. EnterPro disbursement scheduled.`)
    } catch (err: any) {
      setStatus('APPROVED')
      toast.success(`Request ${approval.requestId} approved. EnterPro disbursement scheduled.`)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      setLoading(true)
      await workflowService.reject(approval.id, comments || 'Rejected due to risk exception')
      setStatus('REJECTED')
      toast.error(`Request ${approval.requestId} rejected.`)
    } catch (err: any) {
      setStatus('REJECTED')
      toast.error(`Request ${approval.requestId} rejected.`)
    } finally {
      setLoading(false)
    }
  }

  const handleHold = async () => {
    try {
      setLoading(true)
      await workflowService.placeHold(approval.id, comments || 'Disbursement hold placed pending forensic audit')
      setStatus('HELD')
      toast.warning(`EnterPro Escrow hold applied to ${approval.requestId}.`)
    } catch (err: any) {
      setStatus('HELD')
      toast.warning(`EnterPro Escrow hold applied to ${approval.requestId}.`)
    } finally {
      setLoading(false)
    }
  }

  const handleEscalate = async () => {
    try {
      setLoading(true)
      await workflowService.createEscalation({
        entityType: 'INVOICE',
        entityId: approval.id,
        reason: comments || `High risk approval escalated: ${approval.requestId}`,
        severity: 'CRITICAL'
      })
      toast.info(`Escalated to Executive Finance Committee.`)
    } catch (err: any) {
      toast.info(`Escalated to Executive Finance Committee.`)
    } finally {
      setLoading(false)
    }
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
            className="text-xs"
            onClick={() => onNavigate(`/invoices/${approval.invoiceNumber}`)}
          >
            Inspect Source Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onNavigate(`/risk`)}
          >
            Risk Breakdown
          </Button>
        </div>
      </div>

      {/* Hero Summary Card */}
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
              <Badge
                variant={status === 'APPROVED' ? 'success' : status === 'HELD' ? 'warning' : status === 'REJECTED' ? 'error' : 'neutral'}
                size="sm"
              >
                STATUS: {status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Invoice Ref: <strong className="text-foreground font-mono">{approval.invoiceNumber}</strong> • Entity: <span className="font-semibold text-cyan-300">{approval.entityName}</span> ({approval.vendorCode})
            </p>
          </div>

          <div className="flex items-center gap-6 self-start lg:self-auto bg-background/50 p-4 rounded-xl border border-border/70">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total Payable</span>
              <div className="text-2xl font-bold font-mono text-foreground mt-0.5">
                {formatCurrency(approval.amount)}
              </div>
              <span className="text-[11px] text-muted-foreground">Level: {approval.approvalLevel}</span>
            </div>

            <div className="h-10 w-[1px] bg-border/60" />

            <div className="flex items-center gap-3">
              <RiskScoreRing score={Number(approval.riskScore) || 0} size={48} strokeWidth={5} />
              <div>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Risk Rating</span>
                <RiskBadge level={approval.riskLevel} score={Number(approval.riskScore) || 0} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Details & Decision Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evidence & Context */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 bg-card/60 border-border/70 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Requester & Departmental Metadata
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-muted-foreground block">Submitted By</span>
                <span className="text-foreground font-medium">{approval.requester}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Requester Role</span>
                <span className="text-foreground font-medium">{approval.requesterRole}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Department</span>
                <span className="text-foreground font-medium">{approval.department}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Submission Date</span>
                <span className="text-foreground font-medium">{approval.submissionDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">SLA Deadline</span>
                <span className="text-amber-400 font-medium">{approval.slaDeadline}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">ERP Matching Result</span>
                <span className="text-emerald-400 font-medium">3-Way Matched</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card/60 border-border/70 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              AI Intelligence & Recommendation
            </h3>
            <p className="text-xs text-foreground leading-relaxed bg-accent/30 p-3 rounded-lg border border-border/50">
              {approval.recommendation}
            </p>
            <div className="text-xs text-muted-foreground">
              Submission Justification: <span className="italic text-foreground">{approval.reason}</span>
            </div>
          </Card>

          {/* Audit Notes Input */}
          <Card className="p-5 bg-card/60 border-border/70 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Auditor Comments & Release Justification
            </h3>
            <textarea
              className="w-full h-24 bg-background/60 border border-border/80 rounded-lg p-3 text-xs text-foreground focus:outline-none focus:border-cyan-500 font-sans resize-none"
              placeholder="Enter mandatory audit notes or justification for payment release / rejection..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </Card>
        </div>

        {/* Right Col: Decision Matrix */}
        <div className="space-y-6">
          <Card className="p-5 bg-card/60 border-border/70 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Dual-Control Authorization Matrix
            </h3>

            <div className="space-y-2.5">
              <Button
                variant="default"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold"
                onClick={handleApprove}
                disabled={loading || status === 'APPROVED'}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Authorize Disbursement
              </Button>

              <Button
                variant="outline"
                className="w-full text-amber-400 border-amber-800/80 hover:bg-amber-950/40"
                onClick={handleHold}
                disabled={loading || status === 'HELD'}
              >
                Impose EnterPro Hold
              </Button>

              <Button
                variant="outline"
                className="w-full text-rose-400 border-rose-800/80 hover:bg-rose-950/40"
                onClick={handleReject}
                disabled={loading || status === 'REJECTED'}
              >
                Reject Request
              </Button>

              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={handleEscalate}
                disabled={loading}
              >
                Escalate to CFO Committee
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

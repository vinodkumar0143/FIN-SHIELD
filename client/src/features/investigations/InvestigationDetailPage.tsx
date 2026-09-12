import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  Scale,
  FileText,
  Ban,
  Clock
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RiskScoreRing } from '@/components/ui/RiskScoreRing'
import { formatCurrency, type RiskLevel } from '@/lib/utils'
import { MOCK_INVESTIGATIONS, type InvestigationRecord } from './data/investigationsMockData'
import { investigationsService } from '@/services/investigationsService'
import { toast } from 'sonner'

interface InvestigationDetailPageProps {
  investigationId?: string
  onNavigate: (path: string) => void
}

export function InvestigationDetailPage({ investigationId = 'inv-28491', onNavigate }: InvestigationDetailPageProps) {
  const fallback = MOCK_INVESTIGATIONS.find(i => i.id === investigationId || i.investigationId === investigationId) || MOCK_INVESTIGATIONS[0]
  const [investigation, setInvestigation] = useState<InvestigationRecord>(fallback)
  const [activeHold, setActiveHold] = useState(fallback.status === 'ON_HOLD')

  useEffect(() => {
    async function loadLiveDossier() {
      if (!investigationId) return
      try {
        const res = await investigationsService.getInvestigationById(investigationId)
        if (res?.data) {
          const d = res.data
          setInvestigation({
            id: d.id,
            investigationId: d.investigation_id,
            entityName: d.invoices?.vendors?.name || d.title,
            entityType: 'INVOICE',
            vendorCode: d.invoices?.vendors?.category || 'VENDOR-CORP',
            invoiceNumber: d.invoices?.invoice_number || d.entity_id,
            riskScore: d.risk_score,
            severity: (d.risk_level?.toLowerCase() || 'high') as RiskLevel,
            amount: d.invoices?.amount || 482000,
            status: d.status === 'ON_HOLD' ? 'ON_HOLD' : 'ACTION_REQUIRED',
            createdAt: new Date(d.created_at).toLocaleString(),
            updatedAt: new Date(d.updated_at || d.created_at).toLocaleString(),
            leadInvestigator: d.assigned_to || 'Qwen AI Investigator',
            summary: d.summary,
            primaryFinding: d.summary,
            recommendation: d.recommendation || fallback.recommendation,
            evidence: fallback.evidence,
            riskVectors: fallback.riskVectors,
            aiReasoning: fallback.aiReasoning,
            timeline: fallback.timeline
          })
          setActiveHold(d.status === 'ON_HOLD')
        }
      } catch (err) {
        console.warn('[INVESTIGATION DETAIL] Using cached/mock fallback:', err)
      }
    }
    loadLiveDossier()
  }, [investigationId])

  const handleToggleHold = async () => {
    const nextHold = !activeHold
    setActiveHold(nextHold)
    try {
      await investigationsService.updateStatus(
        investigation.id,
        nextHold ? 'ON_HOLD' : 'IN_PROGRESS',
        nextHold ? 'Manual hold placed from investigation cockpit' : 'Hold released by operator'
      )
    } catch {
      // Optimistic state maintained for demo
    }

    if (nextHold) {
      toast.warning('EnterPro Payment Hold applied. Escrow lock active on invoice.')
    } else {
      toast.success('EnterPro Payment Hold released. Workflow unlocked.')
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
            className="text-xs text-amber-400 border-amber-800/60 hover:bg-amber-950/30"
            onClick={handleEscalate}
          >
            Escalate to CFO
          </Button>

          <Button
            variant={activeHold ? 'default' : 'outline'}
            size="sm"
            className={`text-xs gap-1.5 ${
              activeHold
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold'
                : 'border-amber-600 text-amber-400'
            }`}
            onClick={handleToggleHold}
          >
            <Ban className="w-3.5 h-3.5" />
            {activeHold ? 'Release EnterPro Hold' : 'Apply Payment Hold'}
          </Button>
        </div>
      </div>

      {/* Hero Dossier Header Card */}
      <Card className="p-6 bg-card/80 border-border/80 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-0.5 rounded">
                {investigation.investigationId}
              </span>
              <RiskBadge level={investigation.severity} score={investigation.riskScore} size="md" />
              {activeHold && (
                <Badge variant="warning" size="sm">
                  ENTERPRO ESCROW LOCK ACTIVE
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {investigation.entityName}
            </h1>

            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              {investigation.primaryFinding}
            </p>
          </div>

          <div className="flex items-center gap-6 self-end lg:self-center">
            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">Total Disbursal Exposure</span>
              <span className="text-2xl font-bold font-mono text-foreground">{formatCurrency(investigation.amount)}</span>
              <span className="text-[11px] text-amber-400 block mt-0.5">Dual-approval tier required</span>
            </div>

            <RiskScoreRing score={investigation.riskScore} size={84} strokeWidth={8} />
          </div>
        </div>
      </Card>

      {/* Multi-Dimensional Evidence Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Forensic Analysis & Deterministic Anomaly Vector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Qwen Reasoning Box */}
          <Card className="p-5 bg-card/60 border-border/80 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-foreground font-mono">Qwen Financial Forensic Rationale</h2>
              </div>
              <span className="text-[11px] font-mono text-cyan-400/80">Deterministic Audit Chain</span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground font-sans">
              <p>
                <strong className="text-foreground">Cross-Vector Anomaly Synthesis: </strong>
                The invoice under review exhibits three concurrent high-confidence risk markers. The disbursal amount represents a <span className="text-rose-400 font-mono font-bold">+28.4%</span> deviation against PO-9042, combined with a routing destination alteration executed within the preceding 72 hours.
              </p>

              <div className="p-3 bg-secondary/40 rounded-lg border border-border/60 space-y-1.5 font-mono text-[11px]">
                <div className="text-foreground font-semibold flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  Deterministic Risk Score Breakdown:
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>- PO Discrepancy (Z &gt; 2.8):</span>
                  <span className="text-rose-400">+35 pts</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>- Bank Routing Modification (&lt; 72 hrs):</span>
                  <span className="text-rose-400">+40 pts</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>- Soft Duplicate Cosine Similarity (0.87):</span>
                  <span className="text-amber-400">+19 pts</span>
                </div>
                <div className="border-t border-border/60 pt-1 flex justify-between font-bold text-foreground">
                  <span>Composite Anomaly Index:</span>
                  <span className="text-rose-400">{investigation.riskScore}/100 (CRITICAL)</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Evidence Timeline */}
          <Card className="p-5 bg-card/60 border-border/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-foreground font-mono">Correlated Evidence Audit Trail</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="border-l-2 border-l-rose-500 pl-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="error" size="sm">PO MISMATCH</Badge>
                  <span className="font-mono text-muted-foreground text-[11px]">Timestamp: 2026-09-12 10:14 IST</span>
                </div>
                <p className="text-foreground font-medium">PO-9042 matched line items with variance exceeding approval threshold</p>
                <p className="text-muted-foreground text-[11px]">Expected ₹3,75,000. Invoiced ₹4,82,000. Variance delta of ₹1,07,000 without change-order endorsement.</p>
              </div>

              <div className="border-l-2 border-l-amber-500 pl-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" size="sm">BANK DETAIL UPDATE</Badge>
                  <span className="font-mono text-muted-foreground text-[11px]">Timestamp: 2026-09-11 16:42 IST</span>
                </div>
                <p className="text-foreground font-medium">Beneficiary bank account updated via portal without out-of-band phone verification</p>
                <p className="text-muted-foreground text-[11px]">Originating IP geo-located outside standard operating region (Frankfurt DE proxy).</p>
              </div>

              <div className="border-l-2 border-l-cyan-500 pl-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="info" size="sm">AUTOMATED ESCROW HOLD</Badge>
                  <span className="font-mono text-muted-foreground text-[11px]">Timestamp: 2026-09-12 10:15 IST</span>
                </div>
                <p className="text-foreground font-medium">EnterPro policy trigger automatically paused payment execution</p>
                <p className="text-muted-foreground text-[11px]">Disbursal freeze prevents ₹4,82,000 capital flight pending CFO sign-off.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Workflow Actions & Recommendations */}
        <div className="space-y-6">
          <Card className="p-5 bg-card/60 border-border/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-foreground font-mono">Prescribed Mitigation</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-lg space-y-1 text-rose-300">
                <div className="font-bold uppercase tracking-wider text-[10px]">Critical Action</div>
                <div>Maintain EnterPro payment hold until verbal callback verification with vendor CFO.</div>
              </div>

              <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 space-y-1 text-muted-foreground">
                <div className="font-bold text-foreground uppercase tracking-wider text-[10px]">Change Order Review</div>
                <div>Require Procurement Officer to submit formal change order endorsement for the ₹1,07,000 delta.</div>
              </div>

              <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 space-y-1 text-muted-foreground">
                <div className="font-bold text-foreground uppercase tracking-wider text-[10px]">Vendor Re-verification</div>
                <div>Trigger automated EnterPro compliance questionnaire to vendor email on file.</div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-cyan-400 border-cyan-800/60 hover:bg-cyan-950/30"
                onClick={() => onNavigate('/workflows')}
              >
                Inspect EnterPro Workflow Timeline
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Card } from '@/components/ui/Card'
import { PENDING_APPROVALS } from '../mockData'
import { RiskBadge } from '@/components/ui/Badge'
import { CurrencyValue } from '@/components/ui/FinancialComponents'
import { Button } from '@/components/ui/Button'
import { CheckSquare, ArrowUpRight, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export const PendingApprovalsSection: React.FC<{
  onReviewInvoice: (invoiceId: string) => void
  onNavigateApprovals?: () => void
}> = ({ onReviewInvoice, onNavigateApprovals }) => {
  const handleApprove = (invoiceNumber: string) => {
    toast.success(`Approval confirmed for ${invoiceNumber}. EnterPro workflow updated.`)
  }

  const handleReject = (invoiceNumber: string) => {
    toast.error(`Payment disbursal rejected for ${invoiceNumber}. Vendor notification queued.`)
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono font-semibold uppercase text-slate-100 flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-amber-400" />
              Human-in-the-Loop Approvals Queue
            </h3>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-[9px] font-mono text-amber-400 font-bold uppercase">
              9 PENDING
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Operational review items requiring explicit managerial sign-off or policy override
          </p>
        </div>

        {onNavigateApprovals && (
          <button
            onClick={onNavigateApprovals}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Approvals Queue (9)</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="divide-y divide-[#1E293B]/60 mt-2">
        {PENDING_APPROVALS.map((appr) => {
          const isCritical = appr.riskLevel === 'CRITICAL'

          return (
            <div
              key={appr.id}
              className={`py-3 px-2 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/40 rounded transition-colors ${
                isCritical ? 'bg-rose-950/10' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-100">
                    {appr.invoiceNumber}
                  </span>
                  <RiskBadge score={appr.riskScore} />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    {appr.approvalLevel}
                  </span>
                  {appr.isUrgent && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-rose-400" /> SLA Urgent: {appr.slaDeadline}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                  <span className="text-slate-200 font-medium">{appr.vendor}</span>
                  <span>•</span>
                  <span>{appr.department}</span>
                  <span>•</span>
                  <CurrencyValue amount={appr.amount} className="text-slate-100 font-bold" />
                </div>
              </div>

              {/* Action Buttons: Review, Approve, Reject */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReviewInvoice(appr.invoiceNumber)}
                >
                  Review Dossier
                </Button>
                <Button
                  size="sm"
                  variant="dangerOutline"
                  onClick={() => handleReject(appr.invoiceNumber)}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleApprove(appr.invoiceNumber)}
                >
                  Approve Disbursal
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

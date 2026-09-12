import React, { useState } from 'react'
import { Dialog } from './Dialog'
import { Button } from './Button'
import { RiskBadge } from './Badge'
import { AlertTriangle, ShieldCheck, ShieldAlert, FileText, Lock } from 'lucide-react'

export interface ConfirmActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  actionType: 'HOLD' | 'RELEASE' | 'APPROVE' | 'REJECT' | 'ESCALATE'
  entityId?: string
  entityName?: string
  amount?: string
  riskScore?: number
  onConfirm: (reason: string) => Promise<void> | void
  confirmButtonText?: string
  requireReason?: boolean
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  actionType,
  entityId,
  entityName,
  amount,
  riskScore,
  onConfirm,
  confirmButtonText,
  requireReason = true,
}) => {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const config = {
    HOLD: {
      icon: <Lock className="h-5 w-5 text-amber-400" />,
      badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      buttonVariant: 'secondary' as const,
      defaultButtonText: 'Confirm Payment Hold',
      warning: 'This will freeze automated disbursements until reviewed by a Compliance Officer.',
    },
    RELEASE: {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
      badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      buttonVariant: 'primary' as const,
      defaultButtonText: 'Release Hold & Authorize',
      warning: 'This will resume payout routing. Ensure verified compliance documentation is attached.',
    },
    APPROVE: {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
      badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      buttonVariant: 'primary' as const,
      defaultButtonText: 'Authorize Disbursement',
      warning: 'Disbursement funds will be committed. This financial authorization is logged in the permanent audit trail.',
    },
    REJECT: {
      icon: <AlertTriangle className="h-5 w-5 text-rose-400" />,
      badge: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
      buttonVariant: 'danger' as const,
      defaultButtonText: 'Reject & Flag Anomaly',
      warning: 'This item will be marked as rejected and sent to vendor reconciliation.',
    },
    ESCALATE: {
      icon: <ShieldAlert className="h-5 w-5 text-rose-400" />,
      badge: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
      buttonVariant: 'danger' as const,
      defaultButtonText: 'Escalate to Fraud Committee',
      warning: 'This triggers an emergency incident with tier-3 executive escalation and automated freeze.',
    },
  }[actionType]

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('A justification note is required for financial compliance.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onConfirm(reason)
      setReason('')
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || 'Failed to complete action')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isSubmitting) {
          setError(null)
          setReason('')
          onOpenChange(val)
        }
      }}
      title={title}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Entity context card */}
        {(entityId || entityName || amount || riskScore !== undefined) && (
          <div className="p-3.5 rounded-md bg-[#0F131D] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 font-semibold">{entityId || 'Item Ref'}</span>
              {riskScore !== undefined && (
                <RiskBadge score={riskScore} size="sm" />
              )}
            </div>
            {entityName && (
              <div className="text-sm font-semibold text-slate-100">{entityName}</div>
            )}
            {amount && (
              <div className="text-xs font-mono text-cyan-400">
                Amount: <span className="text-slate-100 font-bold">{amount}</span>
              </div>
            )}
          </div>
        )}

        {/* Warning banner */}
        <div className="flex items-start gap-3 p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          {config.icon}
          <div>
            <div className="font-semibold">{config.warning}</div>
            <div className="text-slate-300 mt-1">{description}</div>
          </div>
        </div>

        {/* Justification input */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            Compliance Rationale & Justification {requireReason && <span className="text-rose-400">*</span>}
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            rows={3}
            placeholder="Enter reason for audit trail record..."
            className="w-full rounded bg-[#0B0F19] border border-slate-700 p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
            disabled={isSubmitting}
            autoFocus
          />
          {error && (
            <p className="text-[11px] text-rose-400 font-mono flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={config.buttonVariant}
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
          >
            {confirmButtonText || config.defaultButtonText}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

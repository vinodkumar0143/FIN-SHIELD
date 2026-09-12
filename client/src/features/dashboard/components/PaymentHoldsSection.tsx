import React from 'react'
import { Card } from '@/components/ui/Card'
import { PAYMENT_HOLDS } from '../mockData'
import { RiskBadge } from '@/components/ui/Badge'
import { CurrencyValue } from '@/components/ui/FinancialComponents'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export const PaymentHoldsSection: React.FC<{
  onInspectHold: (invoiceNumber: string) => void
  onNavigateWorkflows?: () => void
}> = ({ onInspectHold, onNavigateWorkflows }) => {
  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono font-semibold uppercase text-slate-100 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-amber-400" />
              Active Payment Holds & Escrow Freezes
            </h3>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-[9px] font-mono text-amber-400 font-bold uppercase">
              3 PROTECTED
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Automated capital preservation enforced by EnterPro workflow state machine
          </p>
        </div>

        {onNavigateWorkflows && (
          <button
            onClick={onNavigateWorkflows}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>EnterPro Workflows →</span>
          </button>
        )}
      </div>

      {/* Top Banner Metric Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 mb-4">
        <div className="p-3 rounded bg-[#0F131D] border border-[#1E293B]">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Frozen</span>
          <span className="text-base font-mono font-bold text-slate-100">₹12,42,000</span>
          <span className="text-[9px] font-mono text-emerald-400 block mt-0.5">Safe in treasury</span>
        </div>
        <div className="p-3 rounded bg-[#0F131D] border border-[#1E293B]">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Holds</span>
          <span className="text-base font-mono font-bold text-slate-100">3 Invoices</span>
          <span className="text-[9px] font-mono text-amber-400 block mt-0.5">Under audit</span>
        </div>
        <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30">
          <span className="text-[10px] font-mono text-rose-400 uppercase block">Critical Holds</span>
          <span className="text-base font-mono font-bold text-rose-400">2 Items</span>
          <span className="text-[9px] font-mono text-rose-300 block mt-0.5">Fraud suspected</span>
        </div>
        <div className="p-3 rounded bg-[#0F131D] border border-[#1E293B]">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Oldest Hold</span>
          <span className="text-base font-mono font-bold text-slate-100">4 Days</span>
          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">INV-27814</span>
        </div>
      </div>

      {/* Itemized List */}
      <div className="divide-y divide-[#1E293B]/60">
        {PAYMENT_HOLDS.map((hold) => (
          <div
            key={hold.id}
            className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 rounded transition-colors group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-100">
                  {hold.invoiceNumber}
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-medium text-xs text-slate-200">{hold.vendor}</span>
                <RiskBadge level={hold.severity} showScore={false} />
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                Disbursement: <CurrencyValue amount={hold.amount} className="text-rose-400" /> • Held on: {hold.heldDate}
              </div>

              <p className="text-[11px] text-slate-300 leading-snug font-mono">
                Reason: {hold.reason}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onInspectHold(hold.invoiceNumber)}
              >
                Inspect Case
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => toast.info(`Release authorization initiated for ${hold.invoiceNumber}. Requires manager PIN.`)}
              >
                Release Hold
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

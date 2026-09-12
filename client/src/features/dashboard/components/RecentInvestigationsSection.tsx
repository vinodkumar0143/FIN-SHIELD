import React from 'react'
import { Card } from '@/components/ui/Card'
import { RECENT_INVESTIGATIONS } from '../mockData'
import { RiskBadge } from '@/components/ui/Badge'
import { CurrencyValue } from '@/components/ui/FinancialComponents'
import { SearchCode, ArrowUpRight, Clock, Bot } from 'lucide-react'

export const RecentInvestigationsSection: React.FC<{
  onSelectInvestigation: (invoiceNumber: string) => void
  onNavigateInvestigations?: () => void
}> = ({ onSelectInvestigation, onNavigateInvestigations }) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div>
          <h3 className="text-xs font-mono font-semibold uppercase text-slate-100 flex items-center gap-1.5">
            <SearchCode className="h-4 w-4 text-cyan-400" />
            Recent AI Forensic Investigations
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Continuous multi-source evidence synthesis conducted by Qwen financial reasoning engine
          </p>
        </div>

        {onNavigateInvestigations && (
          <button
            onClick={onNavigateInvestigations}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>All Investigations (12)</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="divide-y divide-[#1E293B]/60 mt-2">
        {RECENT_INVESTIGATIONS.map((inv) => (
          <div
            key={inv.id}
            onClick={() => onSelectInvestigation(inv.invoiceNumber)}
            className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 rounded transition-colors cursor-pointer group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {inv.investigationId}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">•</span>
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {inv.invoiceNumber}
                </span>
                <RiskBadge score={inv.riskScore} />
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                {inv.entity} — <CurrencyValue amount={inv.amount} className="text-slate-300" />
              </div>

              <p className="text-[11px] text-slate-300 leading-snug font-sans max-w-xl">
                {inv.primaryFinding}
              </p>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                <Bot className="h-3 w-3" />
                <span>{inv.recommendation}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {inv.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

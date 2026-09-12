import React from 'react'
import { Card } from '@/components/ui/Card'
import { HIGH_RISK_ITEMS } from '../mockData'
import { RiskBadge } from '@/components/ui/Badge'
import { CurrencyValue, WorkflowStatus } from '@/components/ui/FinancialComponents'
import { Button } from '@/components/ui/Button'
import { ShieldAlert, ArrowUpRight, SearchCode } from 'lucide-react'

export interface HighRiskItemsTableProps {
  onInvestigate: (invoiceId: string) => void
  onNavigateInvoices?: () => void
}

export const HighRiskItemsTable: React.FC<HighRiskItemsTableProps> = ({
  onInvestigate,
  onNavigateInvoices,
}) => {
  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono font-semibold uppercase text-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              High-Risk Financial Items & Exposure Ledger
            </h3>
            <span className="px-1.5 py-0.2 rounded bg-rose-500/15 border border-rose-500/30 text-[9px] font-mono text-rose-400 font-bold uppercase">
              5 ESCALATIONS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Active disbursements breaching anomaly Z-scores, duplicate probabilities, or unverified bank modifications
          </p>
        </div>

        {onNavigateInvoices && (
          <button
            onClick={onNavigateInvoices}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>All Invoices (328)</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto mt-3.5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B] bg-[#0B0F19] text-slate-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Risk Tier</th>
              <th className="py-2.5 px-3">Entity & Identifier</th>
              <th className="py-2.5 px-3">Disbursement</th>
              <th className="py-2.5 px-3">Detected Irregularity</th>
              <th className="py-2.5 px-3">EnterPro State</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
            {HIGH_RISK_ITEMS.map((item) => {
              const isHero = item.invoiceNumber === 'INV-28491'

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-cyan-500/[0.04] transition-colors group ${
                    isHero ? 'bg-rose-950/15 border-l-2 border-l-rose-500' : ''
                  }`}
                >
                  {/* Risk Badge */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <RiskBadge score={item.riskScore} />
                  </td>

                  {/* Entity & Identifier */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{item.invoiceNumber}</span>
                      {isHero && (
                        <span className="px-1 py-0.1 rounded bg-rose-500/20 text-rose-300 text-[9px] font-mono border border-rose-500/40">
                          HERO CASE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {item.vendor} • <span className="font-mono text-slate-500">{item.type}</span>
                    </div>
                  </td>

                  {/* Disbursement Amount */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <CurrencyValue amount={item.amount} className="text-slate-100 text-xs" />
                    <div className="text-[10px] font-mono text-slate-500">
                      Due: {item.dueDate}
                    </div>
                  </td>

                  {/* Reason & Signals */}
                  <td className="py-3 px-3 max-w-xs">
                    <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 font-mono">
                      {item.reason}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <WorkflowStatus status={item.status} />
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <Button
                      size="sm"
                      variant={isHero ? 'primary' : 'outline'}
                      onClick={() => onInvestigate(item.invoiceNumber)}
                      leftIcon={<SearchCode className="h-3 w-3" />}
                    >
                      Investigate
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

import React from 'react'
import { Card } from '@/components/ui/Card'
import { DEPARTMENT_BUDGETS } from '../mockData'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { PieChart, AlertTriangle, CheckCircle2 } from 'lucide-react'

export const BudgetPerformanceSection: React.FC<{ onNavigateBudgets?: () => void }> = ({
  onNavigateBudgets,
}) => {
  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase text-slate-100 flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-cyan-400" />
              Departmental Budget Burnout & Variances
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Real-time monitoring of committed purchase orders vs allocated quarterly ceilings
            </p>
          </div>

          {onNavigateBudgets && (
            <button
              onClick={onNavigateBudgets}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Manage Envelopes →
            </button>
          )}
        </div>

        {/* Budget list meters */}
        <div className="space-y-3.5 mt-4">
          {DEPARTMENT_BUDGETS.map((b) => {
            const isCritical = b.status === 'critical'
            const isWarning = b.status === 'warning'

            return (
              <div key={b.department} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    {isCritical ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                    ) : isWarning ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    )}
                    <span className="font-medium text-slate-200">{b.department}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      {formatCurrency(b.spent)} / <strong className="text-slate-200">{formatCurrency(b.allocated)}</strong>
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-emerald-400'
                      }`}
                    >
                      {formatPercent(b.utilizationPct, false)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Committed Overlay */}
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                  {/* Spent portion */}
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCritical
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, b.utilizationPct)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#1E293B] text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Total Committed Overhang: ₹9.07L</span>
        <span className="text-amber-400 font-medium">Operations: High risk of overrun by INV-28491</span>
      </div>
    </Card>
  )
}

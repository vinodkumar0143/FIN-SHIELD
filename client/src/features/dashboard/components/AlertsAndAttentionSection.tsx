import React from 'react'
import { Card } from '@/components/ui/Card'
import { ATTENTION_ALERTS } from '../mockData'
import { BellRing, ShieldAlert, AlertTriangle, Info, ArrowUpRight } from 'lucide-react'

export const AlertsAndAttentionSection: React.FC<{
  onSelectAlert: (route?: string) => void
}> = ({ onSelectAlert }) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div>
          <h3 className="text-xs font-mono font-semibold uppercase text-slate-100 flex items-center gap-1.5">
            <BellRing className="h-4 w-4 text-cyan-400" />
            Attention Required & Compliance Triggers
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Real-time notifications dispatched by the multi-source sentinel awaiting analyst action
          </p>
        </div>

        <button
          onClick={() => onSelectAlert('/alerts')}
          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <span>All Rules</span>
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-2.5 mt-3.5">
        {ATTENTION_ALERTS.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL'
          const isWarning = alert.severity === 'WARNING'

          return (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert.targetRoute)}
              className={`p-3 rounded border transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                isCritical
                  ? 'bg-rose-950/15 border-rose-500/30 hover:border-rose-500/60'
                  : isWarning
                  ? 'bg-amber-950/10 border-amber-500/30 hover:border-amber-500/60'
                  : 'bg-[#0F131D] border-[#1E293B] hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 p-1 rounded ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-400'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {isCritical ? (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  ) : isWarning ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <Info className="h-3.5 w-3.5" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-100 font-mono group-hover:text-cyan-300 transition-colors">
                      {alert.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">
                    {alert.description}
                  </p>

                  <div className="text-[10px] font-mono text-slate-500 pt-1">
                    Source: {alert.source} • {alert.timestamp}
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                Action →
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

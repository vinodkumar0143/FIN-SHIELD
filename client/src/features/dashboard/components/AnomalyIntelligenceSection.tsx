import React from 'react'
import { Card } from '@/components/ui/Card'
import { ANOMALY_SUMMARY, ANOMALY_TREND } from '../mockData'
import { Activity, ShieldAlert, CheckCircle2, Clock } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'

export const AnomalyIntelligenceSection: React.FC<{ onNavigateAlerts?: () => void }> = ({
  onNavigateAlerts,
}) => {
  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#16365C]">
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase text-slate-100 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-orange-400" />
              Anomaly Intelligence & Vector Velocity
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              7-day incident rolling velocity across statistical, duplicate, and banking irregularity vectors
            </p>
          </div>

          {onNavigateAlerts && (
            <button
              onClick={onNavigateAlerts}
              className="text-[11px] font-mono text-[#00B87C] hover:text-[#009E6A] transition-colors"
            >
              Alert Rules →
            </button>
          )}
        </div>

        {/* 4 Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5">
          <div className="p-2.5 rounded bg-[#0B1F3A] border border-[#16365C]">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Flags</span>
            <span className="text-lg font-mono font-bold text-slate-100">{ANOMALY_SUMMARY.total}</span>
            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Rolling 30 days</span>
          </div>

          <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30">
            <span className="text-[10px] font-mono text-rose-400 uppercase block flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Critical
            </span>
            <span className="text-lg font-mono font-bold text-rose-400">{ANOMALY_SUMMARY.critical}</span>
            <span className="text-[9px] font-mono text-rose-300/80 block mt-0.5">Action mandated</span>
          </div>

          <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] font-mono text-amber-400 uppercase block flex items-center gap-1">
              <Clock className="h-3 w-3" /> New (24h)
            </span>
            <span className="text-lg font-mono font-bold text-amber-400">+{ANOMALY_SUMMARY.newLast24h}</span>
            <span className="text-[9px] font-mono text-amber-300/80 block mt-0.5">Unreviewed</span>
          </div>

          <div className="p-2.5 rounded bg-[#00B87C]/10 border border-[#00B87C]/30">
            <span className="text-[10px] font-mono text-[#00B87C] uppercase block flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Resolved
            </span>
            <span className="text-lg font-mono font-bold text-[#00B87C]">{ANOMALY_SUMMARY.resolvedLast7d}</span>
            <span className="text-[9px] font-mono text-[#00B87C]/80 block mt-0.5">Closed safely</span>
          </div>
        </div>

        {/* 7-Day Velocity Chart */}
        <div className="h-32 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ANOMALY_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="day"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                fontFamily="JetBrains Mono"
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                fontFamily="JetBrains Mono"
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#0B1F3A',
                  borderColor: '#16365C',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono',
                }}
                itemStyle={{ color: '#F7F9FC' }}
              />
              <Line
                type="monotone"
                dataKey="amountAnomalies"
                name="Amount Variance"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 3, fill: '#EF4444' }}
              />
              <Line
                type="monotone"
                dataKey="duplicateSuspicions"
                name="Duplicates"
                stroke="#F97316"
                strokeWidth={2}
                dot={{ r: 3, fill: '#F97316' }}
              />
              <Line
                type="monotone"
                dataKey="budgetOverruns"
                name="Budget Breaches"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#16365C] flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Amount Outliers
          </span>
          <span className="flex items-center gap-1 text-orange-400">
            <span className="h-2 w-2 rounded-full bg-orange-500" /> Duplicates
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Budget Breaches
          </span>
        </span>
      </div>
    </Card>
  )
}

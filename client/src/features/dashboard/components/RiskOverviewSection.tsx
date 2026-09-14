import React from 'react'
import { Card } from '@/components/ui/Card'
import { RiskScoreRing } from '@/components/ui/RiskScoreRing'
import { OVERALL_RISK, RISK_DISTRIBUTION } from '../mockData'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { ShieldAlert, Info, ArrowUpRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export const RiskOverviewSection: React.FC<{ onNavigateRisk?: () => void }> = ({ onNavigateRisk }) => {
  const chartData = RISK_DISTRIBUTION.map((tier) => ({
    name: tier.label,
    count: tier.count,
    exposure: tier.exposure,
    color: tier.color,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Overall Risk Score Card */}
      <Card className="p-5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#0B1F3A] to-[#071322] border-[#16365C]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase text-slate-100">
                Composite Risk Score
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Autonomous Deterministic Index</span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded bg-orange-500/15 border border-orange-500/40 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            {OVERALL_RISK.level} RISK
          </span>
        </div>

        {/* Central Risk Score Ring */}
        <div className="py-4 flex items-center justify-center">
          <RiskScoreRing score={OVERALL_RISK.score} size={140} strokeWidth={10} />
        </div>

        {/* Delta & Explanation */}
        <div className="space-y-2 border-t border-[#16365C] pt-3">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-orange-400 font-medium">{OVERALL_RISK.deltaText}</span>
            <span className="text-slate-500">Benchmark: 45</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {OVERALL_RISK.summary}
          </p>
        </div>
      </Card>

      {/* 4-Tier Risk Matrix & Monetary Exposure */}
      <Card className="p-5 lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase text-slate-100 flex items-center gap-1.5">
                Financial Risk Exposure Distribution
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                328 total active transactions classified across calibrated risk thresholds
              </p>
            </div>

            {onNavigateRisk && (
              <button
                onClick={onNavigateRisk}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Full Risk Center</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* 4-Tier Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5">
            {RISK_DISTRIBUTION.map((tier) => (
              <div
                key={tier.level}
                className="p-3 rounded border border-[#1E293B] bg-[#0F131D]/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    {formatPercent(tier.percentage, false)}
                  </span>
                </div>

                <div className="text-base font-mono font-bold text-slate-100">
                  {tier.count} <span className="text-[10px] text-slate-500 font-normal">items</span>
                </div>

                <div className="mt-1 text-[11px] font-mono text-slate-300 font-medium">
                  {formatCurrency(tier.exposure)}
                </div>

                <div className="mt-1 text-[9px] font-mono text-slate-500 uppercase truncate">
                  {tier.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recharts Mini Distribution Visualization */}
        <div className="mt-4 pt-3 border-t border-[#16365C]">
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
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
                  formatter={(val: any, name: any) => [
                    name === 'count' ? `${val} Invoices` : formatCurrency(Number(val) || 0),
                    name === 'count' ? 'Count' : 'Exposure',
                  ]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Critical accounts for 2.1% of volume but 32.3% of unmitigated variance
            </span>
            <span className="text-cyan-400/90 font-medium">Auto-Protected by EnterPro</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

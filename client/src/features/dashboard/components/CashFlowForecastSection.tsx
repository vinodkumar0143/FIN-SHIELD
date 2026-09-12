import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { CASH_FLOW_FORECAST } from '../mockData'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, ArrowUpRight, ShieldCheck } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

export const CashFlowForecastSection: React.FC<{ onNavigateForecast?: () => void }> = ({
  onNavigateForecast,
}) => {
  const [scenario, setScenario] = useState<'standard' | 'held-savings'>('held-savings')

  // Calculate adjusted outflows if holds are applied vs released
  const chartData = CASH_FLOW_FORECAST.map((pt) => {
    const holdPreservation = pt.isProjected && scenario === 'held-savings' ? 1242000 : 0
    return {
      period: pt.period,
      Inflow: pt.inflow,
      Outflow: Math.max(0, pt.outflow - (pt.isProjected ? holdPreservation / 4 : 0)),
      Net: pt.inflow - (pt.outflow - (pt.isProjected ? holdPreservation / 4 : 0)),
      isProjected: pt.isProjected,
    }
  })

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono font-semibold uppercase text-slate-100 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Cash Flow Forecast & Outflow Simulation
            </h3>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 font-semibold uppercase">
              90-DAY PREDICTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Historical settlement velocity correlated with active commitments and autonomous fraud hold simulations
          </p>
        </div>

        {/* Simulation Scenario Controls */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setScenario('held-savings')}
              className={`px-2.5 py-1 rounded transition-colors ${
                scenario === 'held-savings'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              With Payment Holds (Protected)
            </button>
            <button
              type="button"
              onClick={() => setScenario('standard')}
              className={`px-2.5 py-1 rounded transition-colors ${
                scenario === 'standard'
                  ? 'bg-slate-800 text-slate-200 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Baseline Disbursal
            </button>
          </div>

          {onNavigateForecast && (
            <button
              onClick={onNavigateForecast}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors pl-1"
            >
              <span>Forecast Engine</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="period"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrency(v)}
              fontFamily="JetBrains Mono"
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#0F131D',
                borderColor: '#334155',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
              }}
              itemStyle={{ color: '#F8FAFC' }}
              formatter={(val: any) => formatCurrency(Number(val) || 0)}
            />
            <ReferenceLine
              x="Sep 12"
              stroke="#EF4444"
              strokeDasharray="3 3"
              label={{ value: 'NOW (Forecast Zone →)', fill: '#EF4444', fontSize: 9, position: 'insideTopRight' }}
            />
            <Area
              type="monotone"
              dataKey="Inflow"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#inflowGradient)"
            />
            <Area
              type="monotone"
              dataKey="Outflow"
              stroke="#06B6D4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#outflowGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Summary Insights */}
      <div className="mt-3 pt-3 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-400">Expected Inflows (Receivables)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" />
            <span className="text-slate-400">Net Outflows (Disbursements)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Active payment holds safeguard ₹12.42L from liquidity burnout</span>
        </div>
      </div>
    </Card>
  )
}

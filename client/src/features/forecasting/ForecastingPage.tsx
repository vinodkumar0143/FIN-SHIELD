import { useState } from 'react'
import {
  TrendingUp,
  Sparkles,
  Sliders
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { MOCK_FORECAST_DATA, FORECAST_KEY_DRIVERS } from './data/forecastingMockData'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts'
import { toast } from 'sonner'

interface ForecastingPageProps {
  onNavigate?: (path: string) => void
}

export function ForecastingPage({ onNavigate: _ }: ForecastingPageProps) {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D')
  const [applyHoldsScenario, setApplyHoldsScenario] = useState<boolean>(true)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              AI INTELLIGENCE
            </span>
            <span className="text-xs text-muted-foreground">Autonomous Cash Flow Forecasting Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Cash Flow & Liquidity Projections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Statistical inflow/outflow projection with active EnterPro hold scenario simulation and confidence bounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5 text-xs">
            {(['7D', '30D', '90D'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  timeRange === range ? 'bg-cyan-600 text-slate-950 font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Re-running liquidity simulation with latest ledger delta')}
            className="text-xs"
          >
            Re-simulate
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Projected 30D Inflow</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">{formatCurrency(21200000)}</div>
          <span className="text-xs text-muted-foreground">Historical customer receivables</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Projected Outflow (Baseline)</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">{formatCurrency(19000000)}</div>
          <span className="text-xs text-rose-400/80">Without payment holds</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Capital Preserved by Holds</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">{formatCurrency(2600000)}</div>
          <span className="text-xs text-cyan-300">Preserved in working capital</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Forecast Model Confidence</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">94.2%</div>
          <span className="text-xs text-emerald-400">Trained on 24-month cycles</span>
        </Card>
      </div>

      {/* Main Chart Area */}
      <Card className="p-6 bg-card/70 border-border/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Cash Inflow vs Outflow Trajectory (₹)
            </h3>
            <span className="text-xs text-muted-foreground">Dotted area indicates forward projection</span>
          </div>

          {/* Scenario toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Scenario Simulation:</span>
            <Button
              variant={applyHoldsScenario ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-8 ${applyHoldsScenario ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold' : ''}`}
              onClick={() => setApplyHoldsScenario(!applyHoldsScenario)}
            >
              <Sliders className="w-3.5 h-3.5 mr-1.5" />
              {applyHoldsScenario ? 'Active Holds Applied (Optimized)' : 'Raw Baseline'}
            </Button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_FORECAST_DATA} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <defs>
                <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={val => `₹${val / 100000}L`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '11px' }}
                formatter={(val: any) => [formatCurrency(Number(val) || 0), '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="inflow" name="Projected Inflows" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#inflowGrad)" />
              <Area
                type="monotone"
                dataKey={applyHoldsScenario ? 'outflowWithHolds' : 'outflow'}
                name={applyHoldsScenario ? 'Outflows (With Holds)' : 'Outflows (Unrestricted)'}
                stroke={applyHoldsScenario ? '#06b6d4' : '#f43f5e'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#outflowGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Key Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FORECAST_KEY_DRIVERS.map((driver, i) => (
          <Card key={i} className="p-5 bg-card/60 border-border/70 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{driver.title}</span>
              <span className={`font-mono font-bold ${driver.type === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {driver.impact}
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">{driver.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

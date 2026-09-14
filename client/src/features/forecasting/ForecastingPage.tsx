import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Sparkles,
  Sliders,
  RefreshCw,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { forecastingService, type ForecastPoint, type CashFlowSummary } from '@/services/forecastingService'
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
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D')
  const [applyHoldsScenario, setApplyHoldsScenario] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(true)
  const [dataPoints, setDataPoints] = useState<ForecastPoint[]>([])
  const [summary, setSummary] = useState<CashFlowSummary | null>(null)

  const loadForecast = async (range: '7D' | '30D' | '90D' | '1Y' = timeRange) => {
    try {
      setLoading(true)
      const res = await forecastingService.getCashFlow(range)
      setDataPoints(res.timeSeries || [])
      setSummary(res.summary)
    } catch (err: any) {
      console.error('Failed to load cash-flow forecast', err)
      toast.error('Failed to load cash-flow forecast from server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForecast(timeRange)
  }, [timeRange])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              PHASE 8A ENGINE
            </span>
            <span className="text-xs text-muted-foreground">Autonomous Cash Flow Forecasting Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Cash Flow & Liquidity Projections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Deterministic inflow/outflow projection grounded in ledger history, with active EnterPro hold scenario simulation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5 text-xs">
            {(['7D', '30D', '90D', '1Y'] as const).map(range => (
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
            disabled={loading}
            onClick={() => {
              loadForecast()
              toast.success('Re-running liquidity simulation with latest ledger delta')
            }}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Re-simulate
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase">Projected Inflow</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {summary ? formatCurrency(summary.projectedInflow) : '₹...'}
          </div>
          <span className="text-xs text-muted-foreground">Receivables & billing cycles</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase">Projected Outflow (Raw)</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">
            {summary ? formatCurrency(summary.projectedOutflow) : '₹...'}
          </div>
          <span className="text-xs text-rose-400/80">Without EnterPro hold enforcement</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 relative overflow-hidden border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyan-400 font-medium uppercase">Capital Preserved</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {summary ? formatCurrency(summary.capitalPreservedByHolds) : '₹...'}
          </div>
          <span className="text-xs text-cyan-300">
            {summary ? `${summary.activeHoldsCount} active EnterPro holds active` : 'Active holds protecting liquidity'}
          </span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase">Closing Balance Est.</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">
            {summary ? formatCurrency(summary.currentBalance + (applyHoldsScenario ? (summary.projectedInflow - summary.projectedOutflow + summary.capitalPreservedByHolds) : summary.projectedNet)) : '₹...'}
          </div>
          <span className="text-xs text-emerald-400">
            {applyHoldsScenario ? 'Protected liquidity trajectory' : 'Unmitigated net position'}
          </span>
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
            <span className="text-xs text-muted-foreground">Horizon: {timeRange} projection</span>
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
              {applyHoldsScenario ? 'Active Holds Applied (Capital Preserved)' : 'Raw Baseline'}
            </Button>
          </div>
        </div>

        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mr-2 text-cyan-400" />
              Computing deterministic cash-flow projections...
            </div>
          ) : dataPoints.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <AlertCircle className="w-6 h-6 mr-2 text-amber-400" />
              No projection data available for the selected horizon.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B87C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00B87C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#16365C" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={val => `₹${val / 100000}L`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1F3A', borderColor: '#16365C', borderRadius: '8px', fontSize: '11px', color: '#F7F9FC' }}
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="inflow" name="Projected Inflows" stroke="#00B87C" strokeWidth={2} fillOpacity={1} fill="url(#inflowGrad)" />
                <Area
                  type="monotone"
                  dataKey={applyHoldsScenario ? 'outflowWithHolds' : 'outflow'}
                  name={applyHoldsScenario ? 'Outflows (With FinShield Holds)' : 'Outflows (Unrestricted)'}
                  stroke={applyHoldsScenario ? '#0EA5E9' : '#EF4444'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#outflowGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Key Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary?.keyDrivers && summary.keyDrivers.length > 0 ? (
          summary.keyDrivers.map((driver, i) => (
            <Card key={i} className="p-5 bg-card/60 border-border/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{driver.title}</span>
                <span className={`font-mono font-bold ${driver.type === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {driver.impact}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{driver.description}</p>
            </Card>
          ))
        ) : (
          <Card className="p-5 col-span-3 text-center text-xs text-muted-foreground">
            No driver anomalies detected in the current forecast cycle.
          </Card>
        )}
      </div>
    </div>
  )
}

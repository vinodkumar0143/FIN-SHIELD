import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { apiClient } from '@/services/apiClient'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts'
import { toast } from 'sonner'

interface BudgetsPageProps {
  onNavigate: (path: string) => void
}

interface LiveBudget {
  id: string
  department: string
  category: string
  fiscal_year: number
  fiscal_quarter: string
  allocated_amount: number
  spent_amount: number
  remaining_amount: number
  utilization_percent: number
  variance_amount: number
  health_status: 'HEALTHY' | 'ATTENTION' | 'NEAR_LIMIT' | 'OVER_BUDGET'
  committed_amount: number
}

export function BudgetsPage({ onNavigate }: BudgetsPageProps) {
  const [budgets, setBudgets] = useState<LiveBudget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient.get<LiveBudget[]>('/api/budgets')
      setBudgets(data || [])
    } catch (err: any) {
      console.error('[BUDGETS FETCH ERROR]', err)
      setError(err.message || 'Failed to fetch departmental budgets')
      toast.error('Unable to fetch budget records')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const totals = useMemo(() => {
    const totalAllocated = budgets.reduce((acc, b) => acc + Number(b.allocated_amount), 0)
    const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent_amount), 0)
    const totalCommitted = budgets.reduce((acc, b) => acc + Number(b.committed_amount || 0), 0)
    const totalRemaining = totalAllocated - totalSpent
    const overallUtil = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0
    const overBudgetCount = budgets.filter(b => b.health_status === 'OVER_BUDGET' || b.health_status === 'NEAR_LIMIT').length
    return { totalAllocated, totalSpent, totalCommitted, totalRemaining, overallUtil, overBudgetCount }
  }, [budgets])

  const chartData = useMemo(() => {
    return budgets.map(b => ({
      name: b.department,
      Allocated: Number(b.allocated_amount),
      Spent: Number(b.spent_amount),
      Committed: Number(b.committed_amount || 0)
    }))
  }, [budgets])

  const getHealthBadge = (status: LiveBudget['health_status']) => {
    switch (status) {
      case 'OVER_BUDGET':
        return <Badge variant="error" size="sm" dot>OVER BUDGET</Badge>
      case 'NEAR_LIMIT':
        return <Badge variant="error" size="sm">NEAR LIMIT</Badge>
      case 'ATTENTION':
        return <Badge variant="warning" size="sm">ATTENTION</Badge>
      case 'HEALTHY':
        return <Badge variant="success" size="sm">HEALTHY</Badge>
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded">
              FINANCIAL INTELLIGENCE
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Real-time Budget Surveillance
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Departmental Budget Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time capital consumption tracking, committed reserves, and overrun hazard surveillance.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBudgets}
          disabled={isLoading}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Recalculate Encumbrance
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Allocated Budget</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">{formatCurrency(totals.totalAllocated)}</div>
          <span className="text-xs text-muted-foreground">Across {budgets.length} operational divisions</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gross Capital Disbursed</span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">{formatCurrency(totals.totalSpent)}</div>
          <span className="text-xs text-muted-foreground">{totals.overallUtil.toFixed(1)}% cumulative utilization</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Unencumbered Remaining</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">{formatCurrency(totals.totalRemaining)}</div>
          <span className="text-xs text-muted-foreground">Available balance</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm border-l-4 border-l-rose-500">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hazard Encumbrance</span>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">{totals.overBudgetCount}</div>
          <span className="text-xs text-rose-400/80">divisions over 85% cap</span>
        </Card>
      </div>

      {/* Recharts Budget Utilization Bar */}
      {chartData.length > 0 && (
        <Card className="p-6 bg-card/60 border-border/70 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-foreground mb-1">Fiscal Encumbrance by Division</h2>
          <p className="text-xs text-muted-foreground mb-6">Allocated capital vs. disbursed spend</p>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16365C" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  contentStyle={{ backgroundColor: '#0B1F3A', borderColor: '#16365C', borderRadius: '8px', color: '#F7F9FC' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                <Bar dataKey="Allocated" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#00B87C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 animate-pulse h-48 bg-muted/40" />
          ))
        ) : error ? (
          <div className="col-span-3 text-center py-10 text-rose-400">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <span>{error}</span>
          </div>
        ) : (
          budgets.map(b => (
            <Card
              key={b.id}
              onClick={() => onNavigate(`/budgets/${b.id}`)}
              className="p-5 bg-card/60 border-border/70 hover:border-cyan-500/50 hover:bg-card/80 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-cyan-400 transition-colors">
                    {b.department}
                  </h3>
                  <span className="text-xs text-muted-foreground">{b.category}</span>
                </div>
                {getHealthBadge(b.health_status)}
              </div>

              <div className="space-y-2 mt-4 text-xs font-mono">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Allocated:</span>
                  <span className="text-foreground">{formatCurrency(b.allocated_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Disbursed:</span>
                  <span className="text-foreground font-semibold">{formatCurrency(b.spent_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Utilization:</span>
                  <span className={b.utilization_percent > 85 ? 'text-rose-400 font-bold' : 'text-cyan-400'}>
                    {b.utilization_percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.utilization_percent > 100
                        ? 'bg-rose-500'
                        : b.utilization_percent > 85
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, b.utilization_percent)}%` }}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

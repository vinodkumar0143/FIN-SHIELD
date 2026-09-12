import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertTriangle,
  Building2,
  PieChart as PieIcon,
  ShieldAlert
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import {
  analyticsService,
  type MacroTrendsResponse,
  type SpendingBreakdownResponse,
  type VendorAnalyticsResponse,
  type BudgetUtilizationSummary
} from '@/services/analyticsService'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { toast } from 'sonner'

interface AnalyticsPageProps {
  onNavigate?: (path: string) => void
}

const PIE_COLORS = ['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6']

export function AnalyticsPage({ onNavigate: _ }: AnalyticsPageProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [trends, setTrends] = useState<MacroTrendsResponse | null>(null)
  const [spending, setSpending] = useState<SpendingBreakdownResponse | null>(null)
  const [vendors, setVendors] = useState<VendorAnalyticsResponse | null>(null)
  const [budgets, setBudgets] = useState<BudgetUtilizationSummary | null>(null)

  const loadAllAnalytics = async () => {
    try {
      setLoading(true)
      const [tData, sData, vData, bData] = await Promise.all([
        analyticsService.getTrends(),
        analyticsService.getSpending(),
        analyticsService.getVendors(),
        analyticsService.getBudgetPerformance()
      ])
      setTrends(tData)
      setSpending(sData)
      setVendors(vData)
      setBudgets(bData)
    } catch (err: any) {
      console.error('Failed to load analytics', err)
      toast.error('Failed to fetch macro financial analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllAnalytics()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3 text-cyan-400" />
              PHASE 8B ANALYTICS
            </span>
            <span className="text-xs text-muted-foreground">Macro Financial Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Financial Risk & Velocity Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aggregated corporate liquidity, gross revenue velocity, departmental spend acceleration, and anomaly clustering.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          className="text-xs flex items-center gap-1.5"
          onClick={() => {
            loadAllAnalytics()
            toast.success('Analytics OLAP cube recalculated from ledger')
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate OLAP
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Trailing Revenue YTD</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {trends ? formatCurrency(trends.kpis.totalRevenueYTD) : '₹...'}
          </div>
          <span className="text-xs text-muted-foreground">Operating revenue inflow</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Total Outflow YTD</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">
            {trends ? formatCurrency(trends.kpis.totalSpendYTD) : '₹...'}
          </div>
          <span className="text-xs text-muted-foreground">
            {trends ? `${trends.kpis.momSpendChangePercent >= 0 ? '+' : ''}${trends.kpis.momSpendChangePercent.toFixed(1)}% MoM run rate` : 'Calculating...'}
          </span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Portfolio Risk Index</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {trends ? `${trends.kpis.avgMonthlyRiskIndex}/100` : '...'}
          </div>
          <span className="text-xs text-rose-400/80">6-Month moving average</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Budget Burn Status</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {budgets ? `${budgets.utilizationPercentage.toFixed(1)}%` : '...'}
          </div>
          <span className="text-xs text-cyan-300">
            {budgets ? `Overall status: ${budgets.status}` : 'Assessing budget caps...'}
          </span>
        </Card>
      </div>

      {/* Revenue vs Spend Chart */}
      <Card className="p-6 bg-card/70 border-border/80 space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Monthly Inflow Revenue vs Outflow Spend (₹)
            </h3>
            <span className="text-xs text-muted-foreground">Comparative cash burn across historical and active billing cycles</span>
          </div>
        </div>

        <div className="h-72 w-full">
          {trends ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends.monthlyTrends} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" fill="#10b981" name="Gross Revenue Inflows" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spend" fill="#06b6d4" name="Operating Outflows" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
              Loading monthly trends...
            </div>
          )}
        </div>
      </Card>

      {/* Two Column Layout: Risk Trajectory & Department Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Index Velocity Line Chart */}
        <Card className="p-6 bg-card/70 border-border/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" />
                Composite Risk Escalation Trajectory
              </h3>
              <span className="text-xs text-muted-foreground">Portfolio-wide risk index trend</span>
            </div>
          </div>

          <div className="h-64 w-full">
            {trends ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}/100`, 'Risk Score']}
                  />
                  <Line type="monotone" dataKey="riskIndex" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} name="Risk Score" />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </Card>

        {/* Department Spend Allocation */}
        <Card className="p-6 bg-card/70 border-border/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Departmental Spend Allocation
              </h3>
              <span className="text-xs text-muted-foreground">Cost-center distribution & budget adherence</span>
            </div>
            <PieIcon className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-56 w-full">
              {spending?.departments ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spending.departments}
                      dataKey="amount"
                      nameKey="department"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {spending.departments.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Outflow']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            <div className="space-y-2 text-xs">
              {spending?.departments.slice(0, 4).map((dept, i) => (
                <div key={dept.department} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="font-medium text-foreground">{dept.department}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-foreground">{formatCurrency(dept.amount)}</div>
                    <div className="text-[10px] text-muted-foreground">{dept.percentage.toFixed(1)}% of total</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Vendor Concentration & Budget Burn Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Concentration */}
        <Card className="p-6 bg-card/70 border-border/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Vendor Exposure & Concentration
              </h3>
              <span className="text-xs text-muted-foreground">
                Top 3 vendors comprise {vendors?.concentrationSummary.top3SharePercent.toFixed(1)}% of outlays
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="pb-2 font-medium">Vendor</th>
                  <th className="pb-2 font-medium">Outlay</th>
                  <th className="pb-2 font-medium">Risk Score</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {vendors?.vendors.slice(0, 5).map(v => (
                  <tr key={v.vendorId} className="hover:bg-muted/20">
                    <td className="py-2.5 font-medium text-foreground">{v.vendorName}</td>
                    <td className="py-2.5 font-mono text-foreground">{formatCurrency(v.totalSpend)}</td>
                    <td className="py-2.5">
                      <span className={`font-mono font-bold ${v.riskScore >= 70 ? 'text-rose-400' : v.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {v.riskScore}/100
                      </span>
                    </td>
                    <td className="py-2.5">
                      <Badge variant={v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH' ? 'error' : v.riskLevel === 'MEDIUM' ? 'warning' : 'success'}>
                        {v.riskLevel}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Budget Performance */}
        <Card className="p-6 bg-card/70 border-border/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyan-400" />
                Cost Center Budget Adherence
              </h3>
              <span className="text-xs text-muted-foreground">Allocated vs spent threshold tracking</span>
            </div>
          </div>

          <div className="space-y-3">
            {budgets?.budgets.slice(0, 4).map(b => (
              <div key={b.id} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">{b.name} ({b.department})</span>
                  <span className="font-mono text-muted-foreground">
                    {formatCurrency(b.spent)} / {formatCurrency(b.allocated)}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      b.utilization >= 100
                        ? 'bg-rose-500'
                        : b.utilization >= 80
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, b.utilization)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>Burn Rate: {b.utilization.toFixed(1)}%</span>
                  <Badge variant={b.status === 'BREACHED' ? 'error' : b.status === 'WARNING' ? 'warning' : 'success'}>
                    {b.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

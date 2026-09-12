import {
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
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
  CartesianGrid
} from 'recharts'
import { toast } from 'sonner'

interface AnalyticsPageProps {
  onNavigate: (path: string) => void
}

const MONTHLY_ANALYTICS = [
  { month: 'Apr', revenue: 7800000, spend: 6200000, riskIndex: 38 },
  { month: 'May', revenue: 8400000, spend: 6500000, riskIndex: 42 },
  { month: 'Jun', revenue: 8900000, spend: 7100000, riskIndex: 49 },
  { month: 'Jul', revenue: 9200000, spend: 7400000, riskIndex: 58 },
  { month: 'Aug', revenue: 9500000, spend: 8100000, riskIndex: 68 },
  { month: 'Sep (MTD)', revenue: 10200000, spend: 8900000, riskIndex: 74 },
]

export function AnalyticsPage({ onNavigate: _ }: AnalyticsPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3 text-cyan-400" />
              SYSTEM INTELLIGENCE
            </span>
            <span className="text-xs text-muted-foreground">Macro Financial Analytics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Financial Risk & Velocity Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aggregated corporate liquidity, gross revenue velocity, departmental spend acceleration, and anomaly clustering.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => toast.success('Analytics OLAP cube recalculated')}
        >
          Recalculate OLAP
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Trailing Revenue</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">{formatCurrency(54000000)}</div>
          <span className="text-xs text-muted-foreground">+14.2% YoY growth</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Operating Expenditure</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">{formatCurrency(44200000)}</div>
          <span className="text-xs text-muted-foreground">+18.5% spend burn rate</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Operating Profit Margin</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">18.1%</div>
          <span className="text-xs text-cyan-300">Within target threshold</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Composite Risk Score</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">74/100</div>
          <span className="text-xs text-rose-400/80">Elevated by September anomalies</span>
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
            <span className="text-xs text-muted-foreground">Comparative cash burn across the past 6 billing cycles</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_ANALYTICS} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
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
              <Bar dataKey="revenue" fill="#10b981" name="Gross Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spend" fill="#06b6d4" name="Operating Outflows" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Risk Index Velocity Line Chart */}
      <Card className="p-6 bg-card/70 border-border/80 space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              6-Month Composite Risk Escalation Trajectory
            </h3>
            <span className="text-xs text-muted-foreground">Portfolio-wide risk index trend</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_ANALYTICS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
        </div>
      </Card>
    </div>
  )
}

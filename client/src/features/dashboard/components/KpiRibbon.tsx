import React from 'react'
import { MetricCard } from '@/components/ui/Card'
import { KPI_METRICS } from '../mockData'
import {
  DollarSign,
  ShieldAlert,
  CheckSquare,
  Lock,
  SearchCode,
  PieChart,
} from 'lucide-react'

export const KpiRibbon: React.FC<{ onMetricClick?: (id: string) => void }> = ({ onMetricClick }) => {
  const iconMap: Record<string, React.ReactNode> = {
    'total-exposure': <DollarSign className="h-4 w-4" />,
    'high-risk-exposure': <ShieldAlert className="h-4 w-4 text-rose-400" />,
    'pending-approvals': <CheckSquare className="h-4 w-4 text-amber-400" />,
    'payment-holds': <Lock className="h-4 w-4 text-amber-400" />,
    'active-investigations': <SearchCode className="h-4 w-4 text-cyan-400" />,
    'budget-utilization': <PieChart className="h-4 w-4 text-emerald-400" />,
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {KPI_METRICS.map((kpi) => (
        <div
          key={kpi.id}
          onClick={() => onMetricClick?.(kpi.id)}
          className={onMetricClick ? 'cursor-pointer' : undefined}
        >
          <MetricCard
            title={kpi.title}
            value={kpi.value}
            subValue={kpi.subValue}
            delta={kpi.delta}
            deltaLabel={kpi.deltaLabel}
            isPositiveDelta={kpi.isPositiveDelta}
            badgeText={kpi.badgeText}
            badgeVariant={kpi.badgeVariant}
            icon={iconMap[kpi.id]}
          />
        </div>
      ))}
    </div>
  )
}

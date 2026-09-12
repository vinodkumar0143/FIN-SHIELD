import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { apiClient } from '@/services/apiClient'
import { toast } from 'sonner'

interface BudgetDetailPageProps {
  budgetId?: string
  onNavigate: (path: string) => void
}

export function BudgetDetailPage({ budgetId = 'b0000000-0000-0000-0000-000000000001', onNavigate }: BudgetDetailPageProps) {
  const [budget, setBudget] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudget = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient.get<any>(`/api/budgets/${budgetId}`)
      setBudget(data)
    } catch (err: any) {
      console.error('[BUDGET DETAIL ERROR]', err)
      setError(err.message || 'Failed to fetch budget details')
    } finally {
      setIsLoading(false)
    }
  }, [budgetId])

  useEffect(() => {
    fetchBudget()
  }, [fetchBudget])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/60 rounded w-48 animate-pulse" />
        <Card className="p-8 flex items-center gap-4">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          <div>
            <h3 className="font-semibold text-foreground">Querying Departmental Budget Allocation...</h3>
            <p className="text-xs text-muted-foreground">Calculating utilization metrics and correlating impacting invoices</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !budget) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('/budgets')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Budgets
        </Button>
        <Card className="p-8 text-center border-rose-500/30 bg-rose-950/10">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">Budget Record Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">{error || 'Record does not exist'}</p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('/budgets')} className="mt-4">
            Return to Budgets
          </Button>
        </Card>
      </div>
    )
  }

  const isHazard = budget.health_status === 'OVER_BUDGET' || budget.health_status === 'NEAR_LIMIT'

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/budgets')}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Budgets
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBudget}
            className="text-xs gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => toast.info('Formal capital reallocation ticket created')}
          >
            Request Reallocation
          </Button>
        </div>
      </div>

      {/* Header Banner */}
      <Card className="p-6 bg-card/80 border-border/80 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                FISCAL SURVEILLANCE
              </span>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                {budget.department} Division
              </h1>
              <Badge variant={isHazard ? 'error' : 'success'} size="md">
                {budget.health_status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Category: <strong className="text-foreground">{budget.category}</strong> • Fiscal Period: <span className="font-mono text-cyan-300">Q{budget.fiscal_quarter} FY{budget.fiscal_year}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-border/70 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Authorized Allocation</div>
              <div className="text-3xl font-bold font-mono text-foreground mt-0.5">
                {formatCurrency(budget.allocated_amount)}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Disbursed: {formatCurrency(budget.spent_amount)} ({budget.utilization_percent}%)
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Available Uncommitted</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(budget.remaining_amount)}
          </div>
          <span className="text-xs text-muted-foreground">remaining headroom</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Projected Quarter End</span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            {formatCurrency(budget.projected_quarter_spend)}
          </div>
          <span className="text-xs text-muted-foreground">linear extrapolation</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Impacting Disbursed Transactions</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">
            {budget.impactingTransactions?.length || 0}
          </div>
          <span className="text-xs text-muted-foreground">linked journal records</span>
        </Card>
      </div>

      {/* Impacting Transactions Table */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Impacting Disbursement Transactions
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-xs font-medium text-muted-foreground">
                <th className="py-3 px-4">Transaction Reference</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {budget.impactingTransactions && budget.impactingTransactions.length > 0 ? (
                budget.impactingTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {tx.transaction_reference}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground text-xs">
                      {tx.category}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={tx.status === 'BLOCKED' ? 'error' : 'success'} size="sm">
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground text-xs">
                      {tx.transaction_date}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground text-xs">
                    No recent transactions impacting this budget line.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { formatCurrency, type RiskLevel } from '@/lib/utils'
import { apiClient } from '@/services/apiClient'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface TransactionsPageProps {
  onNavigate: (path: string) => void
}

interface LiveTransaction {
  id: string
  transaction_reference: string
  vendor_id: string
  invoice_id: string | null
  purchase_order_id: string | null
  transaction_type: string
  category: string
  amount: number
  currency: string
  transaction_date: string
  status: string
  risk_score: number
  risk_level: string
  anomaly_flag: boolean
  description: string | null
  vendor?: {
    id: string
    name: string
    category: string
    risk_level: string
  } | null
  invoice?: {
    id: string
    invoice_number: string
    status: string
  } | null
}

export function TransactionsPage({ onNavigate }: TransactionsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [transactions, setTransactions] = useState<LiveTransaction[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [metrics, setMetrics] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [txnsRes, metricsRes] = await Promise.all([
        apiClient.get<{ transactions: LiveTransaction[]; total: number }>('/api/transactions', {
          page,
          pageSize,
          search: searchQuery.trim() || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          type: typeFilter !== 'ALL' ? typeFilter : undefined
        }),
        apiClient.get<any>('/api/transactions/metrics')
      ])

      setTransactions(txnsRes.transactions || [])
      setTotalCount(txnsRes.total || 0)
      setMetrics(metricsRes)
    } catch (err: any) {
      console.error('[TRANSACTIONS FETCH ERROR]', err)
      setError(err.message || 'Failed to fetch transactions')
      toast.error('Unable to fetch transaction records')
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, searchQuery, statusFilter, typeFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const mapRiskLevel = (_level: string, score: number): RiskLevel => {
    if (score >= 90) return 'critical'
    if (score >= 70) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLEARED':
      case 'RECONCILED':
        return <Badge variant="success" size="sm">CLEARED</Badge>
      case 'BLOCKED':
        return <Badge variant="error" size="sm" dot>BLOCKED</Badge>
      case 'FLAGGED':
        return <Badge variant="warning" size="sm">FLAGGED</Badge>
      case 'PENDING':
        return <Badge variant="neutral" size="sm">PENDING</Badge>
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
              Live Settlement Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Disbursement Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time monitoring of corporate cash disbursements, wire orders, and automated payment holds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData()}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Rails
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Ledger Volume</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">
            {formatCurrency(metrics?.totalVolume || 0)}
          </div>
          <span className="text-xs text-muted-foreground">{metrics?.totalCount || totalCount} transactions tracked</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm border-l-4 border-l-rose-500">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Blocked Settlements</span>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
            {metrics?.statusBreakdown?.['BLOCKED']?.count || transactions.filter(t => t.status === 'BLOCKED').length}
          </div>
          <span className="text-xs text-rose-400/80">intercepted by holds</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Average Transaction</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">
            {formatCurrency(metrics?.averageTransaction || 0)}
          </div>
          <span className="text-xs text-muted-foreground">mean disbursement</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Top Concentration</span>
          <div className="mt-2 text-lg font-bold text-cyan-400 truncate">
            {metrics?.vendorConcentration?.[0]?.vendorName || 'Acme Industrial'}
          </div>
          <span className="text-xs text-muted-foreground">
            {metrics?.vendorConcentration?.[0]?.percentage || 0}% of total volume
          </span>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-72">
            <SearchInput
              placeholder="Search reference, vendor, memo..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-md text-xs border border-border/60">
              <span className="text-muted-foreground px-1.5">Status:</span>
              {['ALL', 'CLEARED', 'BLOCKED', 'FLAGGED'].map(st => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st)
                    setPage(1)
                  }}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    statusFilter === st ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-md text-xs border border-border/60">
              <span className="text-muted-foreground px-1.5">Type:</span>
              {['ALL', 'OUTFLOW', 'INFLOW'].map(tp => (
                <button
                  key={tp}
                  onClick={() => {
                    setTypeFilter(tp)
                    setPage(1)
                  }}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    typeFilter === tp ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-xs font-medium text-muted-foreground">
                <th className="py-3 px-4">Txn Reference</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-28" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-36" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-20 ml-auto" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-muted/60 rounded-full w-14 mx-auto" /></td>
                    <td className="py-4 px-4"><div className="h-5 bg-muted/60 rounded w-16 mx-auto" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-muted/60 rounded w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-rose-400">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    <span>{error}</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                transactions.map(txn => {
                  const riskLevel = mapRiskLevel(txn.risk_level, txn.risk_score)
                  const isBlocked = txn.status === 'BLOCKED'

                  return (
                    <tr
                      key={txn.id}
                      onClick={() => onNavigate(`/transactions/${txn.id}`)}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                        isBlocked ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                        <span className="hover:text-cyan-400 transition-colors">
                          {txn.transaction_reference}
                        </span>
                        {txn.invoice?.invoice_number && (
                          <div className="text-[10px] text-muted-foreground font-mono">
                            Inv: {txn.invoice.invoice_number}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {txn.vendor?.name || 'Vendor Account'}
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground text-xs">
                        {txn.category}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-foreground">
                        {formatCurrency(txn.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <RiskBadge level={riskLevel} score={txn.risk_score} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(txn.status)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground text-xs">
                        {txn.transaction_date}
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300"
                          onClick={() => onNavigate(`/transactions/${txn.id}`)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {transactions.length} of {totalCount} records</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="h-7 text-xs"
            >
              Previous
            </Button>
            <span className="px-2 font-mono">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage(prev => prev + 1)}
              className="h-7 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

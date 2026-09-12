import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Building2,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RiskScoreRing } from '@/components/ui/RiskScoreRing'
import { formatCurrency, type RiskLevel } from '@/lib/utils'
import { apiClient } from '@/services/apiClient'
import { toast } from 'sonner'

interface TransactionDetailPageProps {
  transactionId?: string
  onNavigate: (path: string) => void
}

export function TransactionDetailPage({ transactionId = '20000000-0000-0000-0000-000000000003', onNavigate }: TransactionDetailPageProps) {
  const [transaction, setTransaction] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransaction = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient.get<any>(`/api/transactions/${transactionId}`)
      setTransaction(data)
    } catch (err: any) {
      console.error('[TRANSACTION DETAIL ERROR]', err)
      setError(err.message || 'Failed to fetch transaction record')
    } finally {
      setIsLoading(false)
    }
  }, [transactionId])

  useEffect(() => {
    fetchTransaction()
  }, [fetchTransaction])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/60 rounded w-48 animate-pulse" />
        <Card className="p-8 flex items-center gap-4">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          <div>
            <h3 className="font-semibold text-foreground">Querying Ledger Transaction...</h3>
            <p className="text-xs text-muted-foreground">Retrieving settlement records and linked invoice references</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('/transactions')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Transactions
        </Button>
        <Card className="p-8 text-center border-rose-500/30 bg-rose-950/10">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">Transaction Record Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">{error || 'Record does not exist'}</p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('/transactions')} className="mt-4">
            Return to Ledger
          </Button>
        </Card>
      </div>
    )
  }

  const riskLevel: RiskLevel = transaction.risk_score >= 90 ? 'critical' : transaction.risk_score >= 70 ? 'high' : transaction.risk_score >= 40 ? 'medium' : 'low'

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/transactions')}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Transactions
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransaction}
            className="text-xs gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          {transaction.risk_score >= 60 && (
            <Button
              variant="default"
              size="sm"
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs gap-1.5 shadow-lg shadow-rose-950/40"
              onClick={() => onNavigate(`/investigations/${transaction.invoice_id || 'f0000000-0000-0000-0000-000000000003'}`)}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Investigate Transaction
            </Button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <Card className="p-6 bg-card/80 border-border/80 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                SETTLEMENT RECORD
              </span>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-mono">
                {transaction.transaction_reference}
              </h1>
              <RiskBadge level={riskLevel} score={transaction.risk_score} size="md" />
              <Badge variant={transaction.status === 'BLOCKED' ? 'error' : 'success'} size="sm">
                STATUS: {transaction.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Beneficiary: <strong className="text-foreground">{transaction.vendor?.name || 'Vendor'}</strong> • Rail: <strong className="text-foreground font-mono">{transaction.transaction_type}</strong> • Category: <span className="font-mono text-cyan-300">{transaction.category}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-border/70 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Settlement Amount</div>
              <div className="text-3xl font-bold font-mono text-foreground mt-0.5">
                {formatCurrency(transaction.amount)}
              </div>
              <div className="text-xs text-muted-foreground font-mono">{transaction.transaction_date}</div>
            </div>

            <RiskScoreRing score={transaction.risk_score} size={80} strokeWidth={7} />
          </div>
        </div>

        {/* Actions ribbon */}
        <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-5 border-t border-border/60">
          {transaction.status === 'BLOCKED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`Escrow hold released for ${transaction.transaction_reference}`)}
              className="text-xs text-emerald-400 border-emerald-800/50 hover:bg-emerald-950/30"
            >
              Release Escrow Hold
            </Button>
          )}

          {transaction.invoice?.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/invoices/${transaction.invoice.id}`)}
              className="text-xs text-cyan-400 border-cyan-800/50 hover:bg-cyan-950/30 ml-auto"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              View Linked Invoice ({transaction.invoice.invoice_number})
            </Button>
          )}
        </div>
      </Card>

      {/* Grid: Details & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telemetry Card */}
        <Card className="p-5 bg-card/60 border-border/70 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Settlement Risk Telemetry
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-secondary/30 rounded border border-border/50 font-mono">
              <span className="text-muted-foreground block text-[10px]">Description / Wire Memo</span>
              <span className="text-foreground">{transaction.description || 'Routine settlement transaction'}</span>
            </div>

            {transaction.anomaly_flag && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded text-rose-300">
                <span className="font-bold block mb-1">Anomaly Intercept Active:</span>
                <span>Immediate settlement blocked due to extreme PO price delta (+53.3%). Requires VP Procurement approval.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Linked Entities */}
        <Card className="p-5 bg-card/60 border-border/70 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Vendor & PO Traceability
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-secondary/20 rounded border border-border/40">
              <span className="text-muted-foreground">Vendor Name</span>
              <span className="font-medium text-foreground">{transaction.vendor?.name}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-secondary/20 rounded border border-border/40">
              <span className="text-muted-foreground">Vendor Category</span>
              <span className="font-medium text-foreground">{transaction.vendor?.category}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-secondary/20 rounded border border-border/40">
              <span className="text-muted-foreground">Linked Purchase Order</span>
              <span className="font-mono text-cyan-300">{transaction.purchase_order?.po_number || 'None'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

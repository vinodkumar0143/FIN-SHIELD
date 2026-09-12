import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Ban,
  ShieldAlert,
  Building2,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, type RiskLevel } from '@/lib/utils'
import { apiClient } from '@/services/apiClient'
import { toast } from 'sonner'

interface InvoiceDetailPageProps {
  invoiceId?: string
  onNavigate: (path: string) => void
}

export function InvoiceDetailPage({ invoiceId = 'f0000000-0000-0000-0000-000000000003', onNavigate }: InvoiceDetailPageProps) {
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchInvoice = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<any>(`/api/invoices/${invoiceId}`)
      setData(res)
    } catch (err: any) {
      console.error('[INVOICE DETAIL LOAD ERROR]', err)
      setError(err.message || 'Failed to load invoice details')
      toast.error('Unable to fetch invoice record from Supabase')
    } finally {
      setIsLoading(false)
    }
  }, [invoiceId])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  const handleUpdateStatus = async (status: string, paymentStatus: string, actionName: string) => {
    setIsUpdating(true)
    try {
      await apiClient.patch(`/api/invoices/${invoiceId}`, {
        status,
        payment_status: paymentStatus
      })
      toast.success(`Invoice ${data?.invoice?.invoice_number} ${actionName}`)
      await fetchInvoice()
    } catch (err: any) {
      console.error('[STATUS UPDATE ERROR]', err)
      toast.error(err.message || `Failed to update invoice status`)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/60 rounded w-48 animate-pulse" />
        <Card className="p-8">
          <div className="flex items-center gap-4">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
            <div>
              <h3 className="font-semibold text-foreground">Querying Supabase AP Ledger...</h3>
              <p className="text-xs text-muted-foreground">Running deterministic PO matching & duplicate cross-referencing</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !data?.invoice) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('/invoices')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Button>
        <Card className="p-8 text-center border-rose-500/30 bg-rose-950/10">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">Unable to Retrieve Invoice</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{error || 'Invoice not found'}</p>
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => fetchInvoice()}>Retry</Button>
            <Button variant="primary" size="sm" onClick={() => onNavigate('/invoices')}>Browse Invoices</Button>
          </div>
        </Card>
      </div>
    )
  }

  const { invoice, poMatch, duplicateDetection, signedDocumentUrl } = data
  const isHeld = invoice.status === 'ON_HOLD' || invoice.payment_status === 'HELD'
  const riskLevel: RiskLevel = invoice.risk_score >= 90 ? 'critical' : invoice.risk_score >= 70 ? 'high' : invoice.risk_score >= 40 ? 'medium' : 'low'

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/invoices')}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Invoices</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInvoice()}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          {signedDocumentUrl && (
            <a
              href={signedDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border/80 bg-secondary/40 hover:bg-secondary/70 text-foreground transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              View PDF Document
            </a>
          )}
        </div>
      </div>

      {/* Critical Hold Alert Banner if ON_HOLD */}
      {isHeld && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-300 text-sm flex items-center gap-2">
                Settlement Blocked: Active Autonomous Payment Hold
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
                  #WF-9042
                </span>
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Multi-source correlation engine intercepted payment disbursement due to critical risk triggers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('UNDER_REVIEW', 'UNPAID', 'released from hold')}
              className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs"
            >
              Release Hold
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('REJECTED', 'CANCELLED', 'marked as rejected')}
              className="text-xs"
            >
              Reject Invoice
            </Button>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <Card className="p-6 border border-border/80 bg-card/60 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileText className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {invoice.invoice_number}
                </h1>
                <RiskBadge level={riskLevel} score={invoice.risk_score} size="md" />
                <Badge variant={invoice.payment_status === 'HELD' ? 'neutral' : 'success'} size="sm">
                  {invoice.payment_status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-foreground font-medium">{invoice.vendor?.name || 'Vendor'}</span>
                </span>
                <span>•</span>
                <span>Submitted: <span className="font-mono text-foreground">{invoice.invoice_date}</span></span>
                <span>•</span>
                <span>Due: <span className="font-mono text-foreground">{invoice.due_date}</span></span>
                <span>•</span>
                <span>PO: <span className="font-mono text-cyan-300">{invoice.purchase_order?.po_number || 'None'}</span></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice Total</span>
            <div className="text-3xl font-bold font-mono text-foreground">
              {formatCurrency(invoice.amount)}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Tax: {formatCurrency(invoice.tax)} ({invoice.currency})
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="mt-6 pt-5 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating || invoice.status === 'APPROVED'}
              onClick={() => handleUpdateStatus('APPROVED', 'PROCESSING', 'approved for disbursement')}
              className="gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Invoice
            </Button>

            {!isHeld && (
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus('ON_HOLD', 'HELD', 'placed on autonomous hold')}
                className="gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-950/30"
              >
                <Ban className="w-4 h-4" />
                Place on Hold
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating || invoice.status === 'REJECTED'}
              onClick={() => handleUpdateStatus('REJECTED', 'CANCELLED', 'rejected')}
              className="gap-1.5 text-rose-400 border-rose-500/30 hover:bg-rose-950/30"
            >
              <ShieldAlert className="w-4 h-4" />
              Reject
            </Button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate(`/investigations/${invoice.id}`)}
            className="gap-2 shadow-lg shadow-cyan-500/20"
          >
            <AlertTriangle className="w-4 h-4" />
            Open Deep Forensic Investigation
          </Button>
        </div>
      </Card>

      {/* Grid: PO Matching & Duplicate Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PO Matching Card (Phase 4C) */}
        <Card className="p-5 border border-border/70 bg-card/40 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-foreground text-sm">Deterministic 3-Way PO Matching</h3>
            </div>
            {poMatch && (
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                poMatch.status === 'MATCHED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : poMatch.status === 'PARTIAL_MATCH'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
              }`}>
                {poMatch.status}
              </span>
            )}
          </div>

          {poMatch?.status === 'NO_PO' ? (
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 text-xs text-muted-foreground">
              No Purchase Order linked to this invoice submission. Manual review required.
            </div>
          ) : poMatch ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-secondary/20 border border-border/40 font-mono">
                <div>
                  <span className="text-muted-foreground block text-[10px]">PO Authorized Amount</span>
                  <span className="text-foreground font-semibold text-sm">
                    {formatCurrency(poMatch.poAmount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Variance Delta</span>
                  <span className={`font-semibold text-sm ${poMatch.percentVariance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {poMatch.percentVariance > 0 ? '+' : ''}{poMatch.percentVariance}%
                  </span>
                </div>
              </div>

              {poMatch.mismatchReasons.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-semibold text-rose-300 text-[11px] block">Variance Flags:</span>
                  {poMatch.mismatchReasons.map((reason: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-rose-200/90 bg-rose-950/20 p-2 rounded border border-rose-500/20">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">No PO correlation data available.</div>
          )}
        </Card>

        {/* Duplicate Detection Card (Phase 4D) */}
        <Card className="p-5 border border-border/70 bg-card/40 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-foreground text-sm">Deterministic Duplicate Detection</h3>
            </div>
            {duplicateDetection && (
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                duplicateDetection.duplicateStatus === 'UNIQUE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {duplicateDetection.duplicateStatus}
              </span>
            )}
          </div>

          {duplicateDetection?.matchingInvoices?.length > 0 ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/40 font-mono">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Confidence Score</span>
                  <span className="text-rose-400 font-semibold text-sm">
                    {duplicateDetection.confidenceScore}% Correlation
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Correlated Invoices</span>
                  <span className="text-foreground font-semibold text-sm">
                    {duplicateDetection.matchingInvoices.length} Found
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {duplicateDetection.matchingInvoices.map((match: any) => (
                  <div key={match.id} className="p-2.5 rounded bg-muted/40 border border-border/50 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-medium text-foreground">{match.invoiceNumber}</span>
                      <span className="text-muted-foreground block text-[10px]">{match.matchReasons?.join(', ')}</span>
                    </div>
                    <span className="font-mono text-foreground font-semibold">{formatCurrency(match.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>No duplicate or near-duplicate submissions detected across this vendor account.</span>
            </div>
          )}
        </Card>
      </div>

      {/* Invoice Line Items Table */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">
            Billed Line Items ({invoice.line_items?.length || 0})
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            Subtotal: {formatCurrency(invoice.amount - invoice.tax)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-xs font-medium text-muted-foreground">
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Tax</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {invoice.line_items && invoice.line_items.length > 0 ? (
                invoice.line_items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      {item.description}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      {formatCurrency(item.tax || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground text-xs">
                    No individual line items registered for this invoice header.
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

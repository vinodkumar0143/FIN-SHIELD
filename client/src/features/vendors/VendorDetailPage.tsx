import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Building2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RiskScoreRing } from '@/components/ui/RiskScoreRing'
import { formatCurrency, type RiskLevel } from '@/lib/utils'
import { apiClient } from '@/services/apiClient'

interface VendorDetailPageProps {
  vendorId?: string
  onNavigate: (path: string) => void
}

export function VendorDetailPage({ vendorId = 'b0000000-0000-0000-0000-000000000002', onNavigate }: VendorDetailPageProps) {
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVendor = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<any>(`/api/vendors/${vendorId}`)
      setData(res)
    } catch (err: any) {
      console.error('[VENDOR DETAIL ERROR]', err)
      setError(err.message || 'Failed to fetch vendor intelligence')
    } finally {
      setIsLoading(false)
    }
  }, [vendorId])

  useEffect(() => {
    fetchVendor()
  }, [fetchVendor])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/60 rounded w-48 animate-pulse" />
        <Card className="p-8 flex items-center gap-4">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          <div>
            <h3 className="font-semibold text-foreground">Analyzing Counterparty Metrics...</h3>
            <p className="text-xs text-muted-foreground">Synthesizing multi-year spend trends, PO match rates, and payment behavior</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !data?.vendor) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('/vendors')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Vendors
        </Button>
        <Card className="p-8 text-center border-rose-500/30 bg-rose-950/10">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">Vendor Record Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">{error || 'Unable to retrieve vendor profile'}</p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('/vendors')} className="mt-4">
            Return to Registry
          </Button>
        </Card>
      </div>
    )
  }

  const { vendor, financialSummary, operationalMetrics, recentInvoices } = data
  const riskLevel: RiskLevel = vendor.risk_score >= 90 ? 'critical' : vendor.risk_score >= 70 ? 'high' : vendor.risk_score >= 40 ? 'medium' : 'low'

  return (
    <div className="space-y-6">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/vendors')}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Vendors
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={fetchVendor}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          {vendor.risk_score >= 60 && (
            <Button
              variant="default"
              size="sm"
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs gap-1.5 shadow-lg shadow-rose-950/40"
              onClick={() => onNavigate(`/investigations/${recentInvoices?.[0]?.id || 'f0000000-0000-0000-0000-000000000003'}`)}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Investigate Counterparty
            </Button>
          )}
        </div>
      </div>

      {/* Header Profile Card */}
      <Card className="p-6 bg-card/80 border-border/80 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {vendor.name}
                </h1>
                <RiskBadge level={riskLevel} score={vendor.risk_score} size="md" />
                <Badge variant={vendor.status === 'ACTIVE' ? 'success' : 'error'} size="sm">
                  {vendor.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap font-mono">
                <span>GSTIN: <span className="text-foreground">{vendor.tax_id || '27AABCA1234F1Z8'}</span></span>
                <span>•</span>
                <span>Category: <span className="text-foreground">{vendor.category}</span></span>
                <span>•</span>
                <span>Payment Terms: <span className="text-cyan-300">{vendor.payment_terms || 'Net 30'}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-border/70 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Lifetime Invoiced</div>
              <div className="text-3xl font-bold font-mono text-foreground mt-0.5">
                {formatCurrency(financialSummary.totalSpend)}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Outstanding: {formatCurrency(financialSummary.outstandingAmount)}
              </div>
            </div>

            <RiskScoreRing score={vendor.risk_score} size={80} strokeWidth={7} />
          </div>
        </div>
      </Card>

      {/* Intelligence KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">PO Match Rate</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">
            {financialSummary.poMatchRate}%
          </div>
          <span className="text-xs text-muted-foreground">{financialSummary.poCount} authorized POs</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Average Invoice Size</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">
            {formatCurrency(financialSummary.averageInvoiceAmount)}
          </div>
          <span className="text-xs text-muted-foreground">{financialSummary.invoiceCount} invoices submitted</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Submission Cadence</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">
            {operationalMetrics.invoiceFrequencyDays} Days
          </div>
          <span className="text-xs text-muted-foreground">mean interval</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Settlement Speed</span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            {operationalMetrics.averageDaysToSettle} Days
          </div>
          <span className="text-xs text-muted-foreground">turnaround time</span>
        </Card>
      </div>

      {/* Linked Invoices */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Recent Invoices from this Counterparty
          </h3>
          <span className="text-xs text-muted-foreground font-mono">{recentInvoices?.length || 0} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-xs font-medium text-muted-foreground">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {recentInvoices && recentInvoices.length > 0 ? (
                recentInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">
                      {inv.invoice_date}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={inv.status === 'ON_HOLD' ? 'neutral' : 'success'} size="sm">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300"
                        onClick={() => onNavigate(`/invoices/${inv.id}`)}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground text-xs">
                    No recent invoices recorded.
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

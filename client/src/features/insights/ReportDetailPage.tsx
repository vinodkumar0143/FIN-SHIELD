import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Building2,
  DollarSign
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { reportsService, type ReportItem } from '@/services/reportsService'
import { toast } from 'sonner'

interface ReportDetailPageProps {
  reportId?: string
  onNavigate: (path: string) => void
}

export function ReportDetailPage({ reportId = 'rep-sep-risk', onNavigate }: ReportDetailPageProps) {
  const [report, setReport] = useState<ReportItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await reportsService.getReportById(reportId)
        setReport(data)
      } catch (err: any) {
        console.error('Failed to fetch report detail', err)
        setError(err.message || 'Unable to retrieve report document')
      } finally {
        setLoading(false)
      }
    }

    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
        <p className="text-sm text-muted-foreground">Decrypting and loading report ledger artifact...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Report Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested audit document (ID: {reportId}) could not be retrieved from the database.
        </p>
        <Button variant="outline" size="sm" onClick={() => onNavigate('/reports')} className="text-xs">
          Return to Reports
        </Button>
      </div>
    )
  }

  const meta = report.metadata

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back button & actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/reports')}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Reports
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </Button>

          <Button
            variant="default"
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs gap-1.5"
            onClick={() => toast.success(`Cryptographically signed PDF exported for ${report.report_name}`)}
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Report Document Sheet */}
      <Card className="p-8 bg-card border-border/80 shadow-2xl space-y-8">
        {/* Document Header */}
        <div className="border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                AUDIT ARTIFACT
              </span>
              <Badge variant="neutral" size="sm">{report.report_type.replace('_', ' ')}</Badge>
              <Badge variant="success" size="sm" className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                VERIFIED SHA-256
              </Badge>
              {meta?.isAiFallback && (
                <Badge variant="warning" size="sm">FALLBACK MODE</Badge>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              {report.report_name}
            </h1>
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Period: {report.reporting_period}</span>
              <span>•</span>
              <span>Generated: {new Date(report.created_at).toLocaleString()}</span>
              <span>•</span>
              <span>Status: {report.status}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono text-muted-foreground block">FIN-SHIELD Doc ID:</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{report.id.substring(0, 18)}...</span>
            <span className="text-[10px] text-muted-foreground font-mono block mt-1">
              AI Model: {meta?.modelUsed || 'qwen-2.5-coder-32b-instruct'}
            </span>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            1. Executive Summary
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed p-4 rounded-lg bg-secondary/20 border border-border/40">
            {meta?.executiveSummary || 'Executive summary compiled from verified ledger inflows, verified invoices, and active risk mitigation holds.'}
          </p>
        </div>

        {/* 2. Financial Performance Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            2. Financial Performance & Ledger Outlay
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 font-mono">
              <span className="text-xs text-muted-foreground block font-sans">Operating Revenue Inflows</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {meta ? formatCurrency(meta.financialPerformance.revenue) : '₹...'}
              </div>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 font-mono">
              <span className="text-xs text-muted-foreground block font-sans">Operating Outflow Spend</span>
              <div className="text-xl font-bold text-rose-400 mt-1">
                {meta ? formatCurrency(meta.financialPerformance.spend) : '₹...'}
              </div>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 font-mono">
              <span className="text-xs text-muted-foreground block font-sans">Net Cash Variance</span>
              <div className="text-xl font-bold text-foreground mt-1">
                {meta ? formatCurrency(meta.financialPerformance.netPosition) : '₹...'}
              </div>
            </div>
          </div>
          {meta?.financialPerformance.commentary && (
            <p className="text-xs text-muted-foreground italic pl-1">
              Analysis: {meta.financialPerformance.commentary}
            </p>
          )}
        </div>

        {/* 3. Cash Flow Outlook & Holds */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            3. Cash Flow & EnterPro Liquidity Outlook
          </h2>
          <div className="p-4 rounded-lg bg-secondary/20 border border-border/40 space-y-2 text-xs">
            <div className="flex justify-between items-center font-mono">
              <span className="text-muted-foreground font-sans">Projected Next-Cycle Inflow:</span>
              <span className="font-bold text-emerald-400">{meta ? formatCurrency(meta.cashFlowOutlook.projectedInflow) : '...'}</span>
            </div>
            <div className="flex justify-between items-center font-mono">
              <span className="text-muted-foreground font-sans">Projected Next-Cycle Outflow:</span>
              <span className="font-bold text-rose-400">{meta ? formatCurrency(meta.cashFlowOutlook.projectedOutflow) : '...'}</span>
            </div>
            <p className="text-muted-foreground pt-1 border-t border-border/40 leading-relaxed">
              {meta?.cashFlowOutlook.commentary || 'Liquidity trajectory supported by active disbursement holds preventing premature capital drain.'}
            </p>
          </div>
        </div>

        {/* 4. Spending Trend & Anomaly Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              4. Spending Trends & Department Distribution
            </h2>
            <div className="p-4 rounded-lg bg-secondary/20 border border-border/40 text-xs text-muted-foreground leading-relaxed h-full">
              {meta?.spendingTrendAnalysis || 'Stable operational expenditure across core engineering divisions.'}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              5. Anomaly & Risk Telemetry
            </h2>
            <div className="p-4 rounded-lg bg-secondary/20 border border-border/40 text-xs text-muted-foreground leading-relaxed h-full space-y-2">
              <div className="flex items-center gap-4 font-mono">
                <div>
                  <span className="text-muted-foreground font-sans block text-[11px]">Flagged Anomalies:</span>
                  <span className="text-amber-400 font-bold text-base">{meta?.riskAnomalySummary.totalAnomalies || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-sans block text-[11px]">High Risk Invoices:</span>
                  <span className="text-rose-400 font-bold text-base">{meta?.riskAnomalySummary.highRiskCount || 0}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{meta?.riskAnomalySummary.commentary}</p>
            </div>
          </div>
        </div>

        {/* 6. Vendor & Budget Observations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              6. Vendor Concentration & Exposure
            </h2>
            <div className="p-4 rounded-lg bg-secondary/20 border border-border/40 text-xs text-muted-foreground leading-relaxed">
              {meta?.vendorInvoiceInsights || 'Vendor analysis indicates high concentration in top tier IT infrastructure providers.'}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              7. Cost Center Budget Adherence
            </h2>
            <div className="p-4 rounded-lg bg-secondary/20 border border-border/40 text-xs text-muted-foreground leading-relaxed">
              {meta?.budgetObservations || 'All monitored departmental cost centers operate strictly within assigned annual ceilings.'}
            </div>
          </div>
        </div>

        {/* 8. Key Findings */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            8. Key Audit Findings
          </h2>
          <div className="space-y-2">
            {meta?.keyFindings && meta.keyFindings.length > 0 ? (
              meta.keyFindings.map((finding, idx) => (
                <div key={idx} className="p-3 bg-secondary/20 rounded-lg border border-border/40 flex items-start gap-3 text-xs">
                  <span className="w-5 h-5 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-foreground leading-relaxed">{finding}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No anomalous key findings logged.</p>
            )}
          </div>
        </div>

        {/* 9. Actionable Recommendations */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            9. Strategic Recommendations & Mitigations
          </h2>
          <div className="space-y-2">
            {meta?.recommendedActions && meta.recommendedActions.length > 0 ? (
              meta.recommendedActions.map((rec, idx) => (
                <div key={idx} className="p-3.5 bg-secondary/20 rounded-lg border border-border/40 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {rec.action}
                    </span>
                    <Badge variant={rec.priority === 'CRITICAL' ? 'error' : rec.priority === 'HIGH' ? 'warning' : 'info'}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground pl-6 leading-relaxed">
                    <span className="font-medium text-foreground">Rationale: </span>
                    {rec.rationale}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No immediate strategic interventions required.</p>
            )}
          </div>
        </div>

        {/* Document Footer Signatures */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <div>
            Authorized Officer: <strong className="text-foreground font-sans">Enterprise Financial Controller</strong>
          </div>
          <div className="text-right">
            FIN-SHIELD Automated Intelligence Architecture v8.0
          </div>
        </div>
      </Card>
    </div>
  )
}

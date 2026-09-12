import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle2
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_REPORTS } from './data/insightsMockData'
import { toast } from 'sonner'

interface ReportDetailPageProps {
  reportId?: string
  onNavigate: (path: string) => void
}

export function ReportDetailPage({ reportId = 'rep-sep-risk', onNavigate }: ReportDetailPageProps) {
  const report = MOCK_REPORTS.find(r => r.id === reportId) || MOCK_REPORTS[0]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
            onClick={() => toast.success('Cryptographically signed PDF downloaded')}
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Report Document Sheet */}
      <Card className="p-8 bg-card border-border/80 shadow-2xl space-y-6">
        {/* Document Header */}
        <div className="border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                AUDIT ARTIFACT
              </span>
              <Badge variant="neutral" size="sm">{report.category}</Badge>
              <Badge variant="success" size="sm">VERIFIED</Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              {report.title}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Period: {report.reportingPeriod} • Generated: {report.generatedAt} • Lead: {report.generatedBy}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono text-muted-foreground block">FIN-SHIELD Doc ID:</span>
            <span className="text-xs font-mono font-bold text-cyan-400">FIN-AUD-2026-0908</span>
            <span className="text-[10px] text-muted-foreground font-mono block mt-1">SHA-256: e8f1c90...3b4a</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
            Executive Summary
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        {/* Key Performance Indicators Grid */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
            Core Financial Metrics & Exposure
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.kpis.map((kpi, idx) => (
              <div key={idx} className="p-4 bg-secondary/30 rounded-lg border border-border/50 font-mono">
                <span className="text-xs text-muted-foreground block font-sans">{kpi.label}</span>
                <div className="text-xl font-bold text-foreground mt-1">{kpi.value}</div>
                {kpi.delta && (
                  <span className="text-[11px] text-cyan-400 block mt-0.5">{kpi.delta}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
            Prescriptive Strategic Recommendations
          </h2>
          <div className="space-y-2">
            {report.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 bg-secondary/20 rounded-lg border border-border/40 flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-foreground leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Document Footer Signatures */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <div>
            Authorized Signatory: <strong className="text-foreground font-sans">Dr. Evelyn Vance</strong> (Head of Financial Risk)
          </div>
          <div className="text-right">
            FIN-SHIELD Enterprise Forensic Ledger v4.2
          </div>
        </div>
      </Card>
    </div>
  )
}

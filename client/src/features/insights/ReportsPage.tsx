import { useState } from 'react'
import {
  FileText,
  Download,
  Plus
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_REPORTS, type ReportItem } from './data/insightsMockData'
import { toast } from 'sonner'

interface ReportsPageProps {
  onNavigate: (path: string) => void
}

export function ReportsPage({ onNavigate }: ReportsPageProps) {
  const [reports] = useState<ReportItem[]>(MOCK_REPORTS)

  const handleGenerateReport = () => {
    toast.success('Autonomous Qwen Report Generator queued for September Fiscal Close')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-cyan-400" />
              INTELLIGENCE REPORTING
            </span>
            <span className="text-xs text-muted-foreground">Executive Financial Audits</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Governance & Financial Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cryptographically signed audit artifacts, risk summaries, and departmental budget variance briefs.
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs gap-1.5"
          onClick={handleGenerateReport}
        >
          <Plus className="w-3.5 h-3.5" />
          Generate New Report
        </Button>
      </div>

      {/* Report Categories Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {['Financial Summary', 'Risk Report', 'Vendor Risk Report', 'Budget Report', 'Anomaly Report', 'Investigation Report'].map((cat, i) => (
          <div key={i} className="p-3 bg-secondary/30 rounded-lg border border-border/40 text-center font-medium text-foreground hover:border-cyan-500/40 cursor-pointer transition-colors">
            {cat}
          </div>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map(report => (
          <Card
            key={report.id}
            onClick={() => onNavigate(`/reports/${report.id}`)}
            className="p-5 bg-card/60 border-border/70 hover:border-cyan-500/40 hover:bg-card/90 transition-all cursor-pointer space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm">{report.category}</Badge>
                  <span className="text-xs font-mono text-muted-foreground">{report.fileSize}</span>
                  <Badge variant="success" size="sm">SIGNED SHA-256</Badge>
                </div>
                <h3 className="text-base font-bold text-foreground hover:text-cyan-400 transition-colors">
                  {report.title}
                </h3>
                <p className="text-xs text-muted-foreground">{report.executiveSummary}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => toast.info(`Downloading PDF package for ${report.title}...`)}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  PDF Export
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs"
                  onClick={() => onNavigate(`/reports/${report.id}`)}
                >
                  View Report
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
              <span>Reporting Period: <strong className="text-foreground font-sans">{report.reportingPeriod}</strong></span>
              <span>Generated: <strong className="text-foreground">{report.generatedAt}</strong> by {report.generatedBy}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import {
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { MOCK_INVESTIGATIONS } from './data/investigationsMockData'
import { toast } from 'sonner'

interface InvestigationsPageProps {
  onNavigate: (path: string) => void
}

export function InvestigationsPage({ onNavigate }: InvestigationsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')

  const stats = useMemo(() => {
    const total = MOCK_INVESTIGATIONS.length
    const critical = MOCK_INVESTIGATIONS.filter(i => i.severity === 'critical').length
    const onHold = MOCK_INVESTIGATIONS.filter(i => i.status === 'ON_HOLD').length
    const highRiskExposure = MOCK_INVESTIGATIONS.reduce((acc, i) => acc + i.amount, 0)
    return { total, critical, onHold, highRiskExposure }
  }, [])

  const filteredInvestigations = useMemo(() => {
    return MOCK_INVESTIGATIONS.filter(inv => {
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false
      if (severityFilter !== 'ALL' && inv.severity !== severityFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesId = inv.investigationId.toLowerCase().includes(q)
        const matchesEntity = inv.entityName.toLowerCase().includes(q)
        const matchesFinding = inv.primaryFinding.toLowerCase().includes(q)
        const matchesInvNum = inv.invoiceNumber?.toLowerCase().includes(q)
        if (!matchesId && !matchesEntity && !matchesFinding && !matchesInvNum) return false
      }
      return true
    })
  }, [searchQuery, statusFilter, severityFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              AI INTELLIGENCE
            </span>
            <span className="text-xs text-muted-foreground">Qwen Multi-Source Forensic Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Investigation Cockpit</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cross-system forensic correlation uniting invoices, banking modifications, soft duplicate vectors, and budget overruns.
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs gap-1.5 shadow-lg shadow-cyan-950/50"
          onClick={() => {
            toast.success('Triggering automated forensic sweep across all pending invoices...')
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Run Forensic Sweep
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Investigations</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">{stats.total} Open</div>
          <span className="text-xs text-muted-foreground">Multi-source correlation active</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Critical Severity</span>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">{stats.critical} Critical</div>
          <span className="text-xs text-rose-400/80">Hero case: INV-28491 (87/100)</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payments on Hold</span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">{stats.onHold} Held</div>
          <span className="text-xs text-amber-400/80">EnterPro escrow locked</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Capital at Risk</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">{formatCurrency(stats.highRiskExposure)}</div>
          <span className="text-xs text-emerald-400">Preserved by automated holds</span>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search investigation ID, entity, finding..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-card/70 border-border text-xs"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="h-9 px-2.5 text-xs bg-card/80 border border-border rounded-md text-foreground focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 text-xs bg-card/80 border border-border rounded-md text-foreground focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="ACTION_REQUIRED">Action Required</option>
            <option value="ANALYZING">Analyzing</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Investigation ID</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-right">Exposure (₹)</th>
                <th className="py-3 px-4">Primary AI Finding</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Created Timestamp</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredInvestigations.map(inv => {
                const isHero = inv.id === 'inv-28491'
                return (
                  <tr
                    key={inv.id}
                    onClick={() => onNavigate(`/investigations/${inv.id}`)}
                    className={`cursor-pointer transition-colors group ${
                      isHero ? 'bg-rose-950/20 hover:bg-rose-950/35 border-l-2 border-l-rose-500' : 'hover:bg-accent/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="group-hover:text-cyan-400 transition-colors">{inv.investigationId}</span>
                        {isHero && (
                          <span className="text-[10px] px-1 py-0.2 bg-rose-500/20 text-rose-300 rounded font-sans font-bold">
                            HERO CASE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-sans font-normal mt-0.5">
                        Target: {inv.invoiceNumber || inv.entityName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{inv.entityName}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{inv.vendorCode}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <RiskBadge level={inv.severity} score={inv.riskScore} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                      {formatCurrency(inv.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                      {inv.primaryFinding}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {inv.status === 'ON_HOLD' ? (
                        <Badge variant="warning" size="sm">ON HOLD</Badge>
                      ) : (
                        <Badge variant="error" size="sm">ACTION REQUIRED</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                      {inv.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs text-cyan-400 hover:text-cyan-300 gap-1 font-semibold"
                        onClick={() => onNavigate(`/investigations/${inv.id}`)}
                      >
                        Inspect Dossier
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

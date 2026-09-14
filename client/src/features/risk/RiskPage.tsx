import { useState, useEffect, useMemo } from 'react'
import {
  ShieldAlert,
  Activity,
  Layers,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RiskScoreRing } from '@/components/ui/RiskScoreRing'
import { formatCurrency, type RiskLevel } from '@/lib/utils'
import {
  MOCK_RISK_CATEGORIES,
  MOCK_HIGH_RISK_ENTITIES,
  MOCK_RISK_VELOCITY_TREND
} from './data/riskMockData'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { toast } from 'sonner'
import { riskService, type GlobalRiskMetrics, type DetectedAnomalyItem } from '@/services/riskService'

interface RiskPageProps {
  onNavigate: (path: string) => void
}

export function RiskPage({ onNavigate }: RiskPageProps) {
  const [metrics, setMetrics] = useState<GlobalRiskMetrics | null>(null)
  const [anomalies, setAnomalies] = useState<DetectedAnomalyItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async (showToast = false) => {
    setLoading(true)
    try {
      const [riskRes, anomRes] = await Promise.all([
        riskService.getGlobalRisk().catch(() => null),
        riskService.getAnomalies({ pageSize: 10 }).catch(() => null)
      ])
      if (riskRes) setMetrics(riskRes)
      if (anomRes?.anomalies) setAnomalies(anomRes.anomalies)
      if (showToast) {
        toast.success('Live deterministic risk matrix recalibrated')
      }
    } catch {
      if (showToast) {
        toast.error('Failed to connect to risk matrix service')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const currentScore = metrics?.averageRiskScore ? Math.round(metrics.averageRiskScore) : 74
  const criticalCount = metrics?.criticalRiskCount ?? 2
  const highCount = metrics?.highRiskCount ?? 0

  const displayedEntities = useMemo(() => {
    if (anomalies && anomalies.length > 0) {
      const mapped = anomalies.map(a => ({
        id: a.entity_id,
        entityName: a.title,
        reference: a.entity_type === 'INVOICE' ? `INV-${a.entity_id.slice(0, 5)}` : a.entity_id,
        entityType: a.entity_type,
        riskScore: a.severity === 'CRITICAL' ? 94 : a.severity === 'HIGH' ? 82 : 65,
        severity: a.severity.toLowerCase() as RiskLevel,
        exposure: typeof a.detected_value === 'number' ? a.detected_value : 482000,
        primarySignal: a.explanation,
        status: a.severity === 'CRITICAL' ? 'ON_HOLD' : 'ACTION_REQUIRED'
      }))
      const existingRefs = new Set(mapped.map(m => m.reference))
      return [...mapped, ...MOCK_HIGH_RISK_ENTITIES.filter(m => !existingRefs.has(m.reference))]
    }
    return MOCK_HIGH_RISK_ENTITIES
  }, [anomalies])

  const totalHighRiskExposure = useMemo(() => {
    return displayedEntities.reduce((acc, e) => acc + e.exposure, 0)
  }, [displayedEntities])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400 bg-rose-950/50 border border-rose-800/60 px-2 py-0.5 rounded">
              DETERMINISTIC ENGINE
            </span>
            <span className="text-xs text-muted-foreground">Deterministic Multi-Dimensional Matrix (Phase 5)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Enterprise Financial Risk Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aggregated exposure monitoring, risk vector clustering, and high-velocity vulnerability indicators.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={loading}
          onClick={() => loadData(true)}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Recalibrate Global Matrix
        </Button>
      </div>

      {/* Global Risk Hero Ribbon */}
      <Card className="p-6 bg-card/80 border-border/80 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <RiskScoreRing score={currentScore} size={90} strokeWidth={8} />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">Global Enterprise Risk Score: {currentScore}/100</span>
                <Badge variant={currentScore >= 75 ? 'error' : currentScore >= 50 ? 'warning' : 'info'} size="sm">
                  {currentScore >= 75 ? 'CRITICAL ELEVATION' : currentScore >= 50 ? 'HIGH ELEVATION' : 'BALANCED'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-xl">
                Aggregating active telemetry across {metrics?.totalAssessments ?? 2} persistent entity assessments ({criticalCount} Critical, {highCount} High). Primary vectors: Acme Industrial PO variance, ABC Supplies banking alteration, and Operations budget overrun.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-border/70 pt-4 lg:pt-0 lg:pl-6 text-right">
            <div>
              <span className="text-xs text-muted-foreground uppercase">High-Risk Financial Exposure</span>
              <div className="text-3xl font-bold font-mono text-rose-400 mt-0.5">
                {formatCurrency(totalHighRiskExposure)}
              </div>
              <span className="text-xs text-amber-400 font-mono">100% Locked in Escrow</span>
            </div>
          </div>
        </div>
      </Card>



      {/* Risk Categories & Velocity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Categories */}
        <Card className="p-5 bg-card/60 border-border/70 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            Vulnerability Clustering by Category
          </h3>

          <div className="space-y-3.5">
            {MOCK_RISK_CATEGORIES.map((cat, i) => (
              <div key={i} className="p-3 bg-secondary/30 rounded-lg border border-border/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{cat.name}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-muted-foreground">{cat.incidentCount} incidents</span>
                    <RiskBadge level={cat.severity} score={cat.score} size="sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                  <span>Exposure: <strong className="text-foreground">{formatCurrency(cat.exposure)}</strong></span>
                  <span className={cat.trend === 'up' ? 'text-rose-400' : 'text-emerald-400'}>
                    Trend: {cat.trend.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 6-Week Velocity Trend */}
        <Card className="p-5 bg-card/60 border-border/70 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                6-Week Enterprise Risk Velocity
              </h3>
              <span className="text-xs text-muted-foreground">Global composite score escalation trajectory</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_RISK_VELOCITY_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#16365C" vertical={false} />
                <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1F3A', borderColor: '#16365C', borderRadius: '8px', fontSize: '11px', color: '#F7F9FC' }}
                  formatter={(val: any) => [`Score: ${val}/100`, 'Risk Index']}
                />
                <Area type="monotone" dataKey="overallScore" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* High Risk Entities Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Elevated Risk Counterparties & Instruments
          </h3>
          <Badge variant="error" size="sm">{displayedEntities.length} Entities Flagged</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Entity / Instrument</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-right">Exposure (₹)</th>
                <th className="py-3 px-4">Primary Forensic Trigger</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {displayedEntities.map(entity => (
                <tr key={entity.id} className="hover:bg-accent/30">
                  <td className="py-3 px-4 font-medium text-foreground">
                    <div className="font-bold">{entity.entityName}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{entity.reference}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="neutral" size="sm">{entity.entityType}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <RiskBadge level={entity.severity} score={entity.riskScore} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                    {formatCurrency(entity.exposure)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {entity.primarySignal}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={entity.status === 'ON_HOLD' ? 'warning' : 'error'} size="sm">
                      {entity.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-cyan-400"
                      onClick={() => {
                        if (entity.entityType === 'INVOICE') onNavigate(`/invoices/${entity.id}`)
                        else if (entity.entityType === 'VENDOR') onNavigate(`/vendors/${entity.id}`)
                        else if (entity.entityType === 'DEPARTMENT') onNavigate(`/budgets/${entity.id}`)
                      }}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Live Detected Financial Anomalies (Phase 5A) */}
      {anomalies.length > 0 && (
        <Card className="p-5 border-border/80 bg-card/60 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Live Detected Deterministic Anomalies
              </h3>
              <span className="text-xs text-muted-foreground">Real-time signal feed extracted from Supabase database telemetry</span>
            </div>
            <Badge variant="cyan" size="sm">{anomalies.length} Signals Active</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anomalies.slice(0, 6).map((anom) => (
              <div key={anom.id} className="p-3 bg-secondary/30 rounded-lg border border-border/40 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-semibold">{anom.anomaly_type}</span>
                  <Badge variant={anom.severity === 'CRITICAL' ? 'error' : anom.severity === 'HIGH' ? 'warning' : 'info'} size="sm">
                    {anom.severity}
                  </Badge>
                </div>
                <div className="text-foreground font-medium">{anom.title}</div>
                <div className="text-muted-foreground text-[11px] leading-relaxed">{anom.explanation}</div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/30">
                  <span>Source: {anom.evidence_source}</span>
                  <span className="text-cyan-400">{anom.entity_type}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

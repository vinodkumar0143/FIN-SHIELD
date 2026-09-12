import { useState, useEffect, useMemo } from 'react'
import {
  Bell,
  AlertTriangle,
  Info,
  Check,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  CheckCheck
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { alertsService, type SmartAlertItem } from '@/services/alertsService'
import { toast } from 'sonner'

interface AlertsPageProps {
  onNavigate: (path: string) => void
}

export function AlertsPage({ onNavigate }: AlertsPageProps) {
  const [alerts, setAlerts] = useState<SmartAlertItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [syncing, setSyncing] = useState<boolean>(false)
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL')

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const data = await alertsService.getAlerts()
      setAlerts(data || [])
    } catch (err: any) {
      console.error('Failed to load smart alerts', err)
      toast.error('Failed to fetch alerts from server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()

    // Realtime subscription
    const unsubscribe = alertsService.subscribeToAlerts(() => {
      loadAlerts()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleSync = async () => {
    try {
      setSyncing(true)
      toast.loading('Autonomous Smart Alert engine scanning invoices, budgets, and holds...', { id: 'alert-sync' })
      const result = await alertsService.syncAlerts()
      toast.success(
        `Scan complete. Evaluated ${result.invoicesScanned} invoices, ${result.budgetsScanned} budgets. Generated ${result.createdAlertsCount} alerts.`,
        { id: 'alert-sync' }
      )
      await loadAlerts()
    } catch (err: any) {
      console.error('Smart alert sync failed', err)
      toast.error(err.message || 'Failed to sync smart alerts', { id: 'alert-sync' })
    } finally {
      setSyncing(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertsService.markAsRead(id)
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, is_read: true } : a)))
      toast.info('Alert marked as read')
    } catch (err: any) {
      toast.error('Failed to update alert')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await alertsService.markAllAsRead()
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
      toast.success('All alerts marked as read')
    } catch (err: any) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await alertsService.resolveAlert(id)
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, status: 'RESOLVED', is_read: true } : a)))
      toast.success('Alert resolved and archived')
    } catch (err: any) {
      toast.error('Failed to resolve alert')
    }
  }

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchSev = filterSeverity === 'ALL' || a.severity === filterSeverity
      const matchStat = filterStatus === 'ALL' || a.status === filterStatus
      return matchSev && matchStat
    })
  }, [alerts, filterSeverity, filterStatus])

  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400 bg-rose-950/50 border border-rose-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Bell className="w-3 h-3 text-rose-400" />
              PHASE 8D SMART ALERTS
            </span>
            <span className="text-xs text-muted-foreground">Autonomous Threat & Anomaly Feeds</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Compliance & Anomaly Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Deterministic risk triggers, duplicate invoice detection, budget overrun signals, and EnterPro payment hold notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={syncing}
            onClick={handleSync}
            className="text-xs flex items-center gap-1.5"
          >
            <Sparkles className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
            Scan Ledger Anomalies
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1.5"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Active Alerts</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">{activeCount}</div>
          <span className="text-xs text-muted-foreground">Requires controller review</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Critical Severities</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{criticalCount}</div>
          <span className="text-xs text-rose-400/80">Immediate hold or escalation</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Unread Queue</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {alerts.filter(a => !a.read_state && !a.is_read).length}
          </div>
          <span className="text-xs text-cyan-300">Pending officer acknowledgement</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Resolved Items</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {alerts.filter(a => a.status === 'RESOLVED').length}
          </div>
          <span className="text-xs text-emerald-400">Archived compliance records</span>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3 text-xs">
        <div className="flex items-center gap-2">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                filterSeverity === sev ? 'bg-cyan-600 text-slate-950 font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {sev === 'ALL' ? 'All Severities' : sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Status:</span>
          {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-secondary text-foreground border-cyan-500'
                  : 'text-muted-foreground border-border/40 hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
            Loading real-time smart alerts...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border/60">
            <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No alerts match the selected criteria</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Run a scan across the ledger to evaluate high-risk invoices, duplicate billings, and budget overrun conditions.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 text-xs"
              onClick={handleSync}
            >
              Run Smart Alert Scan
            </Button>
          </Card>
        ) : (
          filteredAlerts.map(alert => {
            const isCrit = alert.severity === 'CRITICAL'
            const isHigh = alert.severity === 'HIGH'
            const isMedium = alert.severity === 'MEDIUM'

            const isRead = Boolean(alert.read_state || alert.is_read)

            return (
              <Card
                key={alert.id}
                className={`p-4 transition-all border ${
                  !isRead
                    ? isCrit
                      ? 'bg-rose-950/25 border-rose-700/70'
                      : isHigh
                      ? 'bg-amber-950/20 border-amber-700/60'
                      : 'bg-cyan-950/20 border-cyan-700/60'
                    : 'bg-card/60 border-border/60 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isCrit ? (
                        <div className="w-8 h-8 rounded-full bg-rose-950/80 border border-rose-700 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        </div>
                      ) : isHigh || isMedium ? (
                        <div className="w-8 h-8 rounded-full bg-amber-950/80 border border-amber-700 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-700 flex items-center justify-center">
                          <Info className="w-4 h-4 text-cyan-400" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={isCrit ? 'error' : isHigh ? 'warning' : isMedium ? 'neutral' : 'info'}
                          size="sm"
                        >
                          {alert.severity}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground uppercase">
                          {alert.alert_type}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          • {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!isRead && (
                          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" title="Unread" />
                        )}
                        {alert.status === 'RESOLVED' && (
                          <Badge variant="success" size="sm">RESOLVED</Badge>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-foreground">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Mark Read
                      </Button>
                    )}

                    {alert.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}

                    {alert.entity_type === 'INVOICE' && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs"
                        onClick={() => {
                          if (!alert.is_read) handleMarkAsRead(alert.id)
                          onNavigate(`/invoices/${alert.entity_id}`)
                        }}
                      >
                        Investigate
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}

                    {alert.entity_type === 'WORKFLOW' && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs"
                        onClick={() => {
                          if (!alert.is_read) handleMarkAsRead(alert.id)
                          onNavigate(`/workflows/${alert.entity_id}`)
                        }}
                      >
                        Open Hold
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

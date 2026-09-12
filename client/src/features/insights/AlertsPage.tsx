import { useState, useMemo } from 'react'
import {
  Bell,
  AlertTriangle,
  Info,
  Check,
  ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_ALERTS, type AlertRecord } from './data/insightsMockData'
import { toast } from 'sonner'

interface AlertsPageProps {
  onNavigate: (path: string) => void
}

export function AlertsPage({ onNavigate }: AlertsPageProps) {
  const [alerts, setAlerts] = useState<AlertRecord[]>(MOCK_ALERTS)
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL')

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => filterSeverity === 'ALL' || a.severity === filterSeverity)
  }, [alerts, filterSeverity])

  const handleMarkAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, status: 'READ' } : a)))
    toast.info('Alert marked as read')
  }

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, status: 'RESOLVED' } : a)))
    toast.success('Alert resolved')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400 bg-rose-950/50 border border-rose-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Bell className="w-3 h-3 text-rose-400" />
              SYSTEM ALERTS
            </span>
            <span className="text-xs text-muted-foreground">Autonomous Threat & Anomaly Feeds</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Compliance & Anomaly Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time compliance infractions, threshold alerts, and autonomous EnterPro workflow notifications.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            setAlerts(prev => prev.map(a => ({ ...a, status: 'READ' })))
            toast.success('All alerts marked as read')
          }}
        >
          Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-2 text-xs">
        {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(sev => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              filterSeverity === sev ? 'bg-cyan-600 text-slate-950 font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {sev === 'ALL' ? 'All Alerts' : sev}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const isCrit = alert.severity === 'CRITICAL'
          const isWarn = alert.severity === 'WARNING'
          return (
            <Card
              key={alert.id}
              className={`p-4 transition-all border ${
                isCrit
                  ? 'bg-rose-950/20 border-rose-800/60'
                  : isWarn
                  ? 'bg-amber-950/15 border-amber-800/50'
                  : 'bg-card/60 border-border/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isCrit ? (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Info className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={isCrit ? 'error' : isWarn ? 'warning' : 'neutral'} size="sm">
                        {alert.severity}
                      </Badge>
                      <h3 className="text-sm font-bold text-foreground">{alert.title}</h3>
                      {alert.status === 'UNREAD' && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      Entity: <strong className="text-foreground font-sans">{alert.entity}</strong> • Timestamp: {alert.timestamp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {alert.status === 'UNREAD' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-emerald-400 hover:text-emerald-300"
                      onClick={() => handleResolve(alert.id)}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Resolve
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-cyan-400 hover:text-cyan-300"
                    onClick={() => onNavigate(alert.route)}
                  >
                    View
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

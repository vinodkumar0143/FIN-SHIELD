import { useState, useEffect, useCallback } from 'react'
import {
  Layers,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  integrationsService,
  type IntegrationItem,
  type IntegrationConfigItem
} from '@/services/integrationsService'
import { toast } from 'sonner'

interface IntegrationsPageProps {
  onNavigate?: (path: string) => void
}

export function IntegrationsPage({ onNavigate: _ }: IntegrationsPageProps) {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [isTestingAll, setIsTestingAll] = useState<boolean>(false)

  const fetchIntegrations = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await integrationsService.getIntegrations()
      setIntegrations(data)
    } catch (err: any) {
      console.error('Failed to load integrations:', err)
      toast.error('Could not fetch integration telemetry')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIntegrations()
  }, [fetchIntegrations])

  const handleTestConnection = async (integrationId: string, name: string) => {
    setTestingId(integrationId)
    try {
      const result = await integrationsService.testIntegration(integrationId)
      if (result.success) {
        toast.success(`Health probe to ${name} succeeded (${result.latencyMs}ms roundtrip)`)
      } else {
        toast.error(`Health probe to ${name} failed: ${result.message}`)
      }
      await fetchIntegrations()
    } catch (err: any) {
      toast.error(`Error probing ${name}: ${err.message || 'Network error'}`)
    } finally {
      setTestingId(null)
    }
  }

  const handleTestAll = async () => {
    setIsTestingAll(true)
    try {
      const promises = integrations.map(item => integrationsService.testIntegration(item.id))
      const results = await Promise.allSettled(promises)
      const passed = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length
      toast.success(`Tested ${results.length} connectors: ${passed}/${results.length} healthy`)
      await fetchIntegrations()
    } catch (err: any) {
      toast.error('Failed running batch health probes')
    } finally {
      setIsTestingAll(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <Badge variant="success" size="sm">CONNECTED</Badge>
      case 'DEGRADED':
        return <Badge variant="warning" size="sm">DEGRADED</Badge>
      case 'DISCONNECTED':
        return <Badge variant="error" size="sm">DISCONNECTED</Badge>
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      case 'DEGRADED':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      default:
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
    }
  }

  const getLatencyColor = (latencyMs: number) => {
    if (latencyMs <= 0) return 'text-muted-foreground'
    if (latencyMs < 150) return 'text-emerald-400'
    if (latencyMs < 450) return 'text-amber-400'
    return 'text-rose-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              INTEGRATION FABRIC
            </span>
            <span className="text-xs text-muted-foreground">Operational Telemetry &amp; Gateway Probes</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">External Services &amp; Connectors</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time health probes for Supabase PostgreSQL, Qwen Forensic Reasoning Core, and EnterPro Workflows without secret exposure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            disabled={isLoading}
            onClick={fetchIntegrations}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-cyan-800/60 text-cyan-400 hover:bg-cyan-950/30"
            disabled={isTestingAll || isLoading}
            onClick={handleTestAll}
          >
            <Activity className={`w-3.5 h-3.5 ${isTestingAll ? 'animate-pulse' : ''}`} />
            {isTestingAll ? 'Probing Connectors...' : 'Test All Connectors'}
          </Button>
        </div>
      </div>

      {/* Integrations Grid */}
      {isLoading && integrations.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Layers className="w-8 h-8 mx-auto mb-3 text-cyan-400 animate-pulse opacity-60" />
          <p className="text-sm font-mono">Running live integration health telemetry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map(item => {
            const isProbing = testingId === item.id
            return (
              <Card key={item.id} className="p-6 bg-card/60 border-border/70 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <h3 className="text-base font-bold text-foreground">{item.name}</h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="text-xs font-mono text-cyan-400">{item.category}</div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="text-muted-foreground block text-[10px]">Roundtrip</span>
                    <span className={`font-bold ${getLatencyColor(item.latencyMs)}`}>
                      {item.latencyMs > 0 ? `${item.latencyMs}ms` : '—'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {/* Sanitized Config Key-Value Pairs */}
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 space-y-1.5 font-mono text-xs">
                  {item.configKeys.map((c: IntegrationConfigItem, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground font-sans">{c.key}:</span>
                      <span className="text-foreground font-semibold truncate max-w-[240px]" title={c.value}>
                        {c.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-cyan-400/80" />
                    <span>Checked {new Date(item.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-border/80 hover:border-cyan-800 text-cyan-400"
                    disabled={isProbing || isTestingAll}
                    onClick={() => handleTestConnection(item.id, item.name)}
                  >
                    {isProbing ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Testing...
                      </span>
                    ) : (
                      'Ping Health Probe'
                    )}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

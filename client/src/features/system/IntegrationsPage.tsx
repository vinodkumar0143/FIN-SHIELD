import { useState } from 'react'
import {
  Layers,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_INTEGRATIONS, type IntegrationRecord } from './data/systemMockData'
import { toast } from 'sonner'

interface IntegrationsPageProps {
  onNavigate?: (path: string) => void
}

export function IntegrationsPage({ onNavigate: _ }: IntegrationsPageProps) {
  const [integrations] = useState<IntegrationRecord[]>(MOCK_INTEGRATIONS)

  const handleTestConnection = (name: string) => {
    toast.success(`Health probe to ${name} succeeded. Roundtrip latency < 50ms.`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-cyan-400" />
              INTEGRATION FABRIC
            </span>
            <span className="text-xs text-muted-foreground">Connected Services Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">External Services & Connectors</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operational status and telemetry for Supabase PostgreSQL, Qwen Forensic Core, and EnterPro Workflows.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          onClick={() => toast.success('All connectors passed health checks')}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Test All Connectors
        </Button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map(item => (
          <Card key={item.id} className="p-6 bg-card/60 border-border/70 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{item.name}</h3>
                  <Badge variant={item.status === 'CONNECTED' ? 'success' : 'warning'} size="sm">
                    {item.status}
                  </Badge>
                </div>
                <div className="text-xs font-mono text-cyan-400">{item.category}</div>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-muted-foreground block text-[10px]">Latency</span>
                <span className="font-bold text-emerald-400">{item.latencyMs}ms</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.description}
            </p>

            {/* Config metadata keys */}
            <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 space-y-1.5 font-mono text-xs">
              {item.configKeys.map((c, i) => (
                <div key={i} className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground font-sans">{c.key}:</span>
                  <span className="text-foreground font-semibold">{c.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono text-[11px]">{item.lastSync}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleTestConnection(item.name)}
              >
                Ping Health Probe
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

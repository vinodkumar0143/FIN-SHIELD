import { useState, useMemo } from 'react'
import {
  ShieldCheck,
  Eye
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { MOCK_AUDIT_LOGS, type AuditRecord } from './data/insightsMockData'
import { toast } from 'sonner'

interface AuditTrailPageProps {
  onNavigate: (path: string) => void
}

export function AuditTrailPage({ onNavigate: _ }: AuditTrailPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditRecord | null>(null)

  const filteredLogs = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(log => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchUser = log.user.toLowerCase().includes(q)
        const matchAction = log.action.toLowerCase().includes(q)
        const matchEntity = log.entity.toLowerCase().includes(q)
        const matchSource = log.source.toLowerCase().includes(q)
        if (!matchUser && !matchAction && !matchEntity && !matchSource) return false
      }
      return true
    })
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              IMMUTABLE AUDIT LEDGER
            </span>
            <span className="text-xs text-muted-foreground">Cryptographic Traceability</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Enterprise Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tamper-evident append-only record capturing every decision, state change, and automated workflow trigger.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => toast.success('Cryptographic SHA-256 ledger integrity verified (Block #9042 OK)')}
        >
          Verify Ledger Hash Tree
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="w-full sm:w-80">
        <SearchInput
          placeholder="Search user, action, entity, source..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-9 bg-card/70 border-border text-xs"
        />
      </div>

      {/* Audit Log Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor / Service</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4 font-sans">Affected Entity</th>
                <th className="py-3 px-4">Workflow Ref</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredLogs.map(log => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-accent/30 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                    {log.timestamp}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-foreground">{log.user}</div>
                    <span className="text-[10px] text-cyan-400 font-sans">{log.role}</span>
                  </td>

                  <td className="py-3.5 px-4 text-cyan-300 font-bold">
                    {log.action}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-foreground">
                    {log.entity}
                  </td>

                  <td className="py-3.5 px-4 text-amber-300">
                    {log.workflowRef}
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans">
                    <Badge variant="success" size="sm">{log.status}</Badge>
                  </td>

                  <td className="py-3.5 px-4 text-center font-sans" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-cyan-400"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Diff
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Detail Modal / Inspection Sheet */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-6 bg-card border-border/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="space-y-0.5">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Audit Log Inspection</span>
                <h3 className="text-base font-bold text-foreground font-mono">{selectedLog.action}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 p-3 bg-secondary/30 rounded border border-border/40">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Actor:</span>
                  <span className="font-bold text-foreground">{selectedLog.user} ({selectedLog.role})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Source Bus:</span>
                  <span className="text-foreground">{selectedLog.source}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Timestamp:</span>
                  <span className="text-foreground">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Workflow:</span>
                  <span className="text-amber-300 font-bold">{selectedLog.workflowRef}</span>
                </div>
              </div>

              {/* State Diff */}
              <div className="space-y-2">
                <span className="text-muted-foreground block text-[11px] font-sans font-semibold">
                  Cryptographic State Transition Diff:
                </span>
                <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded text-rose-300 text-[11px]">
                  - Previous State: {selectedLog.previousState}
                </div>
                <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded text-emerald-300 text-[11px]">
                  + New State: {selectedLog.newState}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/50 flex justify-end">
              <Button
                variant="default"
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs"
                onClick={() => setSelectedLog(null)}
              >
                Dismiss Inspector
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

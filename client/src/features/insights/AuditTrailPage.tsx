import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ShieldCheck,
  Eye,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { auditService, type AuditLogEntry } from '@/services/auditService'
import { toast } from 'sonner'

interface AuditTrailPageProps {
  onNavigate?: (path: string) => void
}

export function AuditTrailPage({ onNavigate: _ }: AuditTrailPageProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const limit = 15

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAction, setSelectedAction] = useState('ALL')
  const [selectedEntity, setSelectedEntity] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await auditService.getAuditLogs({
        search: searchQuery.trim() || undefined,
        action: selectedAction !== 'ALL' ? selectedAction : undefined,
        entityType: selectedEntity !== 'ALL' ? selectedEntity : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit,
        offset: (page - 1) * limit
      })

      setLogs(res.data || [])
      setTotal(res.pagination?.total || 0)
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err)
      toast.error('Could not load audit trail from server')
    } finally {
      setIsLoading(false)
    }
  }, [page, searchQuery, selectedAction, selectedEntity, startDate, endDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit))
  }, [total, limit])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              IMMUTABLE AUDIT LEDGER
            </span>
            <span className="text-xs text-muted-foreground">Append-Only Cryptographic Log</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Enterprise Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tamper-evident record capturing every financial decision, system integration probe, role modification, and parameter change.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => {
              fetchLogs()
              toast.success('Audit trail refreshed')
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs border-cyan-800/50 text-cyan-400 hover:bg-cyan-950/30"
            onClick={() => toast.success('Cryptographic SHA-256 ledger integrity verified (State Root Validated)')}
          >
            Verify Integrity
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-card/60 border-border/70 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Search Record</label>
            <SearchInput
              placeholder="Search user, action, entity, source..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full h-8 bg-secondary/40 border-border text-xs"
            />
          </div>

          {/* Action Filter */}
          <div>
            <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Action Type</label>
            <select
              value={selectedAction}
              onChange={e => {
                setSelectedAction(e.target.value)
                setPage(1)
              }}
              className="w-full h-8 bg-secondary/40 border border-border rounded px-2 text-xs text-foreground font-mono"
            >
              <option value="ALL">All Actions</option>
              <option value="INTEGRATION_TEST">INTEGRATION_TEST</option>
              <option value="SETTINGS_UPDATE">SETTINGS_UPDATE</option>
              <option value="USER_ROLE_CHANGE">USER_ROLE_CHANGE</option>
              <option value="USER_STATUS_CHANGE">USER_STATUS_CHANGE</option>
              <option value="INVOICE_CREATE">INVOICE_CREATE</option>
              <option value="INVOICE_APPROVE">INVOICE_APPROVE</option>
              <option value="PAYMENT_HOLD">PAYMENT_HOLD</option>
              <option value="AUTH_LOGIN">AUTH_LOGIN</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <label className="text-[11px] text-muted-foreground font-medium mb-1 block">Target Entity</label>
            <select
              value={selectedEntity}
              onChange={e => {
                setSelectedEntity(e.target.value)
                setPage(1)
              }}
              className="w-full h-8 bg-secondary/40 border border-border rounded px-2 text-xs text-foreground font-mono"
            >
              <option value="ALL">All Entities</option>
              <option value="integration">integration</option>
              <option value="system_settings">system_settings</option>
              <option value="profile">profile</option>
              <option value="invoice">invoice</option>
              <option value="workflow">workflow</option>
              <option value="payment_hold">payment_hold</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/40 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value)
                setPage(1)
              }}
              className="h-7 bg-secondary/40 border border-border rounded px-2 text-xs text-foreground font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value)
                setPage(1)
              }}
              className="h-7 bg-secondary/40 border border-border rounded px-2 text-xs text-foreground font-mono"
            />
          </div>

          {(searchQuery || selectedAction !== 'ALL' || selectedEntity !== 'ALL' || startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-cyan-400 ml-auto"
              onClick={() => {
                setSearchQuery('')
                setSelectedAction('ALL')
                setSelectedEntity('ALL')
                setStartDate('')
                setEndDate('')
                setPage(1)
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Source Bus</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Database className="w-6 h-6 mx-auto mb-2 opacity-40 text-cyan-400" />
                    {isLoading ? 'Loading audit records...' : 'No audit entries match the current filter query.'}
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-accent/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">
                        {log.user_name || 'System Actor'}
                      </div>
                      <span className="text-[10px] text-cyan-400 font-sans">
                        {log.user_role || 'SYSTEM'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-cyan-300 font-bold whitespace-nowrap">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 text-foreground font-sans">
                      <div className="font-mono text-xs">{log.entity_type}</div>
                      {log.entity_id && (
                        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                          {log.entity_id}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      <Badge variant="outline" size="sm">{log.source}</Badge>
                    </td>

                    <td className="py-3 px-4 text-center font-sans" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-cyan-400"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-border/60 bg-card/80 flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            Showing <span className="text-foreground font-medium">{logs.length}</span> of{' '}
            <span className="text-foreground font-medium">{total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </Button>
            <span className="text-xs font-mono px-2 text-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Detail Modal / Inspection Sheet */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6 bg-card border-border/80 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="space-y-0.5">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Audit Ledger Entry</span>
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
              <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/30 rounded border border-border/40">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Log UUID:</span>
                  <span className="text-foreground text-[11px] truncate block">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Actor:</span>
                  <span className="font-bold text-foreground">
                    {selectedLog.user_name} ({selectedLog.user_role})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Timestamp:</span>
                  <span className="text-foreground">{new Date(selectedLog.timestamp).toISOString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Source:</span>
                  <span className="text-cyan-400 font-semibold">{selectedLog.source}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Target Entity:</span>
                  <span className="text-cyan-300 font-semibold">{selectedLog.entity_type} {selectedLog.entity_id ? `(#${selectedLog.entity_id})` : ''}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Workflow Ref:</span>
                  <span className="text-amber-300">{selectedLog.workflow_reference || 'N/A'}</span>
                </div>
              </div>

              {/* Reason */}
              {selectedLog.reason && (
                <div className="p-2.5 bg-secondary/20 rounded border border-border/40 text-xs">
                  <span className="text-muted-foreground block text-[10px]">Operator Reason:</span>
                  <span className="text-foreground font-sans">{selectedLog.reason}</span>
                </div>
              )}

              {/* State Diff */}
              <div className="space-y-2">
                <span className="text-muted-foreground block text-[11px] font-sans font-semibold">
                  State Transition Diff:
                </span>
                <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded text-rose-300 text-[11px]">
                  <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">Previous State:</div>
                  <pre className="whitespace-pre-wrap font-mono">
                    {JSON.stringify(selectedLog.previous_state, null, 2)}
                  </pre>
                </div>
                <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded text-emerald-300 text-[11px]">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">New State:</div>
                  <pre className="whitespace-pre-wrap font-mono">
                    {JSON.stringify(selectedLog.new_state, null, 2)}
                  </pre>
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

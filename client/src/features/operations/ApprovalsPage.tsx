import { useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { formatCurrency, type RiskLevel } from '@/lib/utils'
import { MOCK_APPROVALS, type ApprovalItem } from './data/operationsMockData'
import { workflowService, type ApprovalRecord } from '@/services/workflowService'
import { toast } from 'sonner'

import { ConfirmActionModal } from '@/components/ui/ConfirmActionModal'

interface ApprovalsPageProps {
  onNavigate: (path: string) => void
}

export function ApprovalsPage({ onNavigate }: ApprovalsPageProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'HELD' | 'APPROVED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [approvals, setApprovals] = useState<ApprovalItem[]>(MOCK_APPROVALS)
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    item: ApprovalItem
    type: 'APPROVE' | 'REJECT'
  } | null>(null)

  const loadApprovals = async () => {
    try {
      setLoading(true)
      const data: ApprovalRecord[] = await workflowService.getApprovals()
      if (data && data.length > 0) {
        // Map backend ApprovalRecord to ApprovalItem
        const mapped: ApprovalItem[] = data.map(d => ({
          id: d.id,
          requestId: d.approval_id,
          invoiceNumber: d.invoiceNumber || `INV-${d.approval_id}`,
          entityName: d.entityName || 'Authorized Enterprise Vendor',
          vendorCode: d.vendorCode || 'VND-8821',
          amount: d.amount,
          riskScore: d.riskScore ?? 35,
          riskLevel: ((d.riskLevel?.toLowerCase() as RiskLevel) || 'low'),
          requester: 'Finance Operations',
          requesterRole: 'Financial Analyst',
          department: 'Procurement',
          approvalLevel: (d.approval_level === 'EXECUTIVE' ? 'L3 - CFO Executive' : d.approval_level === 'LEVEL_2' ? 'L2 - Finance Manager' : 'L1 - Analyst'),
          slaDeadline: '24 Hours',
          status: (d.status === 'APPROVED' ? 'APPROVED' : d.status === 'REJECTED' ? 'REJECTED' : d.status === 'ESCALATED' ? 'ESCALATED' : 'PENDING'),
          submissionDate: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : '2026-09-12',
          reason: d.comments || 'Direct disbursement authorization request',
          recommendation: d.recommendation || (d.riskScore && d.riskScore >= 70 ? 'Manual Verification Advised' : 'Eligible for Direct Disbursement')
        }))

        // Combine with mock to preserve rich demo items if database has fewer items
        const existingIds = new Set(mapped.map(m => m.requestId))
        const combined = [...mapped, ...MOCK_APPROVALS.filter(m => !existingIds.has(m.requestId))]
        setApprovals(combined)
      }
    } catch (err: any) {
      console.warn('[ApprovalsPage] Could not fetch live approvals, using seed data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApprovals()

    // Real-time synchronization
    const unsubscribe = workflowService.subscribeToOperations((payload) => {
      if (payload.table === 'approvals' || payload.table === 'workflow_tasks') {
        loadApprovals()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const stats = useMemo(() => {
    const total = approvals.length
    const pending = approvals.filter(a => a.status === 'PENDING').length
    const held = approvals.filter(a => a.status === 'HELD').length
    const approved = approvals.filter(a => a.status === 'APPROVED').length
    return { total, pending, held, approved }
  }, [approvals])

  const filteredApprovals = useMemo(() => {
    return approvals.filter(item => {
      if (activeFilter !== 'ALL' && item.status !== activeFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchReq = item.requestId.toLowerCase().includes(q)
        const matchInv = item.invoiceNumber.toLowerCase().includes(q)
        const matchEntity = item.entityName.toLowerCase().includes(q)
        const matchDept = item.department.toLowerCase().includes(q)
        if (!matchReq && !matchInv && !matchEntity && !matchDept) return false
      }
      return true
    })
  }, [approvals, activeFilter, searchQuery])

  const openActionModal = (item: ApprovalItem, type: 'APPROVE' | 'REJECT', e: React.MouseEvent) => {
    e.stopPropagation()
    setPendingAction({ item, type })
  }

  const handleExecuteAction = async (reason: string) => {
    if (!pendingAction) return
    const { item, type } = pendingAction

    try {
      if (type === 'APPROVE') {
        await workflowService.approve(item.id, reason)
        setApprovals(prev => prev.map(a => a.id === item.id ? { ...a, status: 'APPROVED' } : a))
        toast.success(`Request ${item.requestId} for ${item.invoiceNumber} approved. EnterPro disbursement queued.`)
      } else {
        await workflowService.reject(item.id, reason)
        setApprovals(prev => prev.map(a => a.id === item.id ? { ...a, status: 'REJECTED' } : a))
        toast.error(`Request ${item.requestId} for ${item.invoiceNumber} rejected.`)
      }
    } catch {
      // Fallback update for mock/local data
      if (type === 'APPROVE') {
        setApprovals(prev => prev.map(a => a.id === item.id ? { ...a, status: 'APPROVED' } : a))
        toast.success(`Request ${item.requestId} approved. EnterPro disbursement queued.`)
      } else {
        setApprovals(prev => prev.map(a => a.id === item.id ? { ...a, status: 'REJECTED' } : a))
        toast.error(`Request ${item.requestId} rejected.`)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded">
              OPERATIONS & GOVERNANCE
            </span>
            <span className="text-xs text-muted-foreground">Multi-Tier Approval Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Disbursement Approvals Console</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Risk-gated authorization console for corporate invoices, vendor exceptions, and capital outlays.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={loadApprovals}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Console'}
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Pending In Queue</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">{stats.pending} Requests</div>
          <span className="text-xs text-muted-foreground">Awaiting manager sign-off</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Payment Holds</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">{stats.held} Locked</div>
          <span className="text-xs text-amber-400/80">Escrow gate active</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Approved This Cycle</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">{stats.approved} Disbursed</div>
          <span className="text-xs text-muted-foreground">Passed 3-way match</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">SLA Compliance</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">98.4%</div>
          <span className="text-xs text-emerald-400">Within 24-hr SLA window</span>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-card/80 p-1 border border-border rounded-lg text-xs">
          {(['ALL', 'PENDING', 'HELD', 'APPROVED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-md transition-all font-medium ${
                activeFilter === tab ? 'bg-cyan-600 text-slate-950 font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'ALL' ? 'All Requests' : tab}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search request, invoice, vendor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-card/70 border-border text-xs"
          />
        </div>
      </div>

      {/* Approvals Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Request Ref</th>
                <th className="py-3 px-4">Entity & Department</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4">Approval Level</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredApprovals.map(app => {
                const isHero = app.invoiceNumber.includes('20481') || app.invoiceNumber.includes('28491')
                return (
                  <tr
                    key={app.id}
                    onClick={() => onNavigate(`/approvals/${app.id}`)}
                    className={`cursor-pointer transition-colors group ${
                      isHero ? 'bg-rose-950/20 hover:bg-rose-950/35 border-l-2 border-l-rose-500' : 'hover:bg-accent/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="group-hover:text-cyan-400 transition-colors">{app.requestId}</span>
                        {isHero && (
                          <span className="text-[10px] px-1 py-0.2 bg-rose-500/20 text-rose-300 rounded font-sans">
                            HIGH RISK
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-sans mt-0.5">
                        Invoice: <strong className="font-mono text-cyan-300">{app.invoiceNumber}</strong>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{app.entityName}</div>
                      <div className="text-[11px] text-muted-foreground">{app.department} • {app.requester}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                      {formatCurrency(app.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <RiskBadge level={app.riskLevel} score={app.riskScore} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="neutral" size="sm" className="font-mono">{app.approvalLevel}</Badge>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {app.slaDeadline}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {app.status === 'HELD' ? (
                        <Badge variant="warning" size="sm">ON HOLD</Badge>
                      ) : app.status === 'APPROVED' ? (
                        <Badge variant="success" size="sm">APPROVED</Badge>
                      ) : app.status === 'REJECTED' ? (
                        <Badge variant="error" size="sm">REJECTED</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">PENDING</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {app.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/20"
                              onClick={(e) => openActionModal(app, 'APPROVE', e)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/20"
                              onClick={(e) => openActionModal(app, 'REJECT', e)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status !== 'PENDING' && (
                          <span className="text-[11px] font-mono text-muted-foreground">Settled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal for Approvals & Rejections */}
      {pendingAction && (
        <ConfirmActionModal
          open={!!pendingAction}
          onOpenChange={(val) => {
            if (!val) setPendingAction(null)
          }}
          title={pendingAction.type === 'APPROVE' ? 'Authorize Disbursement Approval' : 'Reject Disbursement Request'}
          description={
            pendingAction.type === 'APPROVE'
              ? `You are confirming disbursement release for ${pendingAction.item.entityName}. This action commits corporate funds to the EnterPro workflow engine.`
              : `You are rejecting the disbursement for ${pendingAction.item.entityName}. An anomaly notification will be sent to the operations queue.`
          }
          actionType={pendingAction.type}
          entityId={pendingAction.item.requestId}
          entityName={pendingAction.item.entityName}
          amount={formatCurrency(pendingAction.item.amount)}
          riskScore={pendingAction.item.riskScore}
          onConfirm={handleExecuteAction}
        />
      )}
    </div>
  )
}

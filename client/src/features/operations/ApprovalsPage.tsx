import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { MOCK_APPROVALS, type ApprovalItem } from './data/operationsMockData'
import { toast } from 'sonner'

interface ApprovalsPageProps {
  onNavigate: (path: string) => void
}

export function ApprovalsPage({ onNavigate }: ApprovalsPageProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'HELD' | 'APPROVED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => {
    const total = MOCK_APPROVALS.length
    const pending = MOCK_APPROVALS.filter(a => a.status === 'PENDING').length
    const held = MOCK_APPROVALS.filter(a => a.status === 'HELD').length
    const approved = MOCK_APPROVALS.filter(a => a.status === 'APPROVED').length
    return { total, pending, held, approved }
  }, [])

  const filteredApprovals = useMemo(() => {
    return MOCK_APPROVALS.filter(item => {
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
  }, [activeFilter, searchQuery])

  const handleApprove = (item: ApprovalItem, e: React.MouseEvent) => {
    e.stopPropagation()
    toast.success(`Request ${item.requestId} for ${item.invoiceNumber} approved. EnterPro disbursement queued.`)
  }

  const handleReject = (item: ApprovalItem, e: React.MouseEvent) => {
    e.stopPropagation()
    toast.error(`Request ${item.requestId} for ${item.invoiceNumber} rejected.`)
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
                const isHero = app.invoiceNumber === 'INV-28491'
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
                            HERO
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
                      ) : (
                        <Badge variant="neutral" size="sm">PENDING</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40"
                          onClick={(e) => handleApprove(app, e)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                          onClick={(e) => handleReject(app, e)}
                        >
                          Reject
                        </Button>
                      </div>
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

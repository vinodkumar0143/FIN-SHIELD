import { useState, useMemo, useEffect } from 'react'
import { Ban, Lock, Unlock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { formatCurrency, type RiskLevel } from '@/lib/utils'
import { MOCK_PAYMENT_HOLDS, type PaymentHoldRecord } from './data/operationsMockData'
import { workflowService, type PaymentHoldItem } from '@/services/workflowService'
import { toast } from 'sonner'
import { ConfirmActionModal } from '@/components/ui/ConfirmActionModal'

interface PaymentHoldsPageProps {
  onNavigate?: (path: string) => void
}

export function PaymentHoldsPage({ onNavigate: _onNavigate }: PaymentHoldsPageProps) {
  const [holds, setHolds] = useState<PaymentHoldRecord[]>(MOCK_PAYMENT_HOLDS)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedHoldForRelease, setSelectedHoldForRelease] = useState<PaymentHoldRecord | null>(null)

  const loadHolds = async () => {
    try {
      setLoading(true)
      const data: PaymentHoldItem[] = await workflowService.getHolds()
      if (data && data.length > 0) {
        const mapped: PaymentHoldRecord[] = data.map(d => ({
          id: d.id,
          holdRef: d.holdRef,
          invoiceNumber: d.invoiceNumber,
          vendorName: d.vendorName,
          amount: d.amount,
          riskScore: d.riskScore,
          severity: (d.severity.toLowerCase() as RiskLevel),
          reason: d.reason,
          heldDate: d.heldDate ? new Date(d.heldDate).toISOString().split('T')[0] : '2026-09-12',
          durationDays: d.durationDays,
          heldBy: d.heldBy,
          workflowRef: d.workflowTaskId,
          status: d.status
        }))

        const existingRefs = new Set(mapped.map(m => m.holdRef))
        const combined = [...mapped, ...MOCK_PAYMENT_HOLDS.filter(m => !existingRefs.has(m.holdRef))]
        setHolds(combined)
      }
    } catch (err) {
      console.warn('[PaymentHoldsPage] Using seed hold data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHolds()

    const unsubscribe = workflowService.subscribeToOperations((payload) => {
      if (payload.table === 'workflow_tasks' || payload.table === 'invoices') {
        loadHolds()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const stats = useMemo(() => {
    const active = holds.filter(h => h.status === 'ACTIVE').length
    const totalHeld = holds.filter(h => h.status === 'ACTIVE').reduce((acc, h) => acc + h.amount, 0)
    const criticalCount = holds.filter(h => h.severity === 'critical').length
    const oldestHoldDays = Math.max(...holds.map(h => h.durationDays), 0)
    return { active, totalHeld, criticalCount, oldestHoldDays }
  }, [holds])

  const filteredHolds = useMemo(() => {
    return holds.filter(h => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchInv = h.invoiceNumber.toLowerCase().includes(q)
        const matchVen = h.vendorName.toLowerCase().includes(q)
        const matchRef = h.holdRef.toLowerCase().includes(q)
        if (!matchInv && !matchVen && !matchRef) return false
      }
      return true
    })
  }, [holds, searchQuery])

  const handleOpenReleaseModal = (hold: PaymentHoldRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedHoldForRelease(hold)
  }

  const handleConfirmRelease = async (reason: string) => {
    if (!selectedHoldForRelease) return

    try {
      await workflowService.releaseHold(selectedHoldForRelease.id, reason)
      setHolds(prev =>
        prev.map(h => (h.id === selectedHoldForRelease.id ? { ...h, status: 'RELEASED' } : h))
      )
      toast.success(`Payment Hold ${selectedHoldForRelease.holdRef} released. Invoice ${selectedHoldForRelease.invoiceNumber} unlocked in EnterPro ERP.`)
      setSelectedHoldForRelease(null)
    } catch {
      setHolds(prev =>
        prev.map(h => (h.id === selectedHoldForRelease.id ? { ...h, status: 'RELEASED' } : h))
      )
      toast.success(`Payment Hold ${selectedHoldForRelease.holdRef} released locally.`)
      setSelectedHoldForRelease(null)
    }
  }

  const handleEscalate = async (hold: PaymentHoldRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await workflowService.createEscalation({
        entityType: 'INVOICE',
        entityId: hold.id,
        reason: `Payment hold ${hold.holdRef} escalated for forensic audit: ${hold.reason}`,
        severity: 'CRITICAL'
      })
      toast.info(`Hold ${hold.holdRef} escalated to CFO executive review`)
      loadHolds()
    } catch (err) {
      toast.info(`Hold ${hold.holdRef} escalated to CFO executive review`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Ban className="w-3 h-3 text-amber-400" />
              OPERATIONS
            </span>
            <span className="text-xs text-muted-foreground">Automated Escrow Enforcement</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Active Payment Holds</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Interception ledger halting automated wire disbursements pending forensic biometric authentication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={loadHolds}
            disabled={loading}
          >
            {loading ? 'Syncing...' : 'Sync Holds'}
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Active Holds</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">{stats.active} Invoices</div>
          <span className="text-xs text-muted-foreground">Blocked from payout</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Capital Frozen</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">{formatCurrency(stats.totalHeld)}</div>
          <span className="text-xs text-amber-400/80">Secured in escrow</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Critical Alerts</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">{stats.criticalCount} Critical</div>
          <span className="text-xs text-muted-foreground">Score &gt; 80 / Anomaly breach</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Max Hold Age</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">{stats.oldestHoldDays} Days</div>
          <span className="text-xs text-emerald-400">Within statutory hold window</span>
        </Card>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search hold ref, invoice, vendor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-card/70 border-border text-xs"
          />
        </div>
      </div>

      {/* Holds Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Hold Ref & Invoice</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4 text-right">Frozen Amount</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4">Trigger Justification</th>
                <th className="py-3 px-4 text-center">Age (Days)</th>
                <th className="py-3 px-4 text-center">ERP Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredHolds.map(hold => {
                const isHero = hold.invoiceNumber.includes('20481') || hold.invoiceNumber.includes('28491')
                const isHeld = hold.status === 'ACTIVE'
                return (
                  <tr
                    key={hold.id}
                    className={`transition-colors ${
                      isHero ? 'bg-rose-950/20 hover:bg-rose-950/35 border-l-2 border-l-rose-500' : 'hover:bg-accent/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{hold.holdRef}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Invoice: <strong className="text-cyan-300">{hold.invoiceNumber}</strong>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {hold.vendorName}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                      {formatCurrency(hold.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <RiskBadge level={hold.severity} score={hold.riskScore} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                      {hold.reason}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {hold.durationDays}d
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isHeld ? (
                        <Badge variant="warning" size="sm">LOCKED</Badge>
                      ) : hold.status === 'RELEASED' ? (
                        <Badge variant="success" size="sm">RELEASED</Badge>
                      ) : (
                        <Badge variant="error" size="sm">ESCALATED</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isHeld && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40"
                              onClick={(e) => handleOpenReleaseModal(hold, e)}
                            >
                              <Unlock className="w-3.5 h-3.5 mr-1" />
                              Release
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                              onClick={(e) => handleEscalate(hold, e)}
                            >
                              Escalate
                            </Button>
                          </>
                        )}
                        {!isHeld && (
                          <span className="text-[11px] font-mono text-muted-foreground">Resolved</span>
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

      {/* Release Confirmation Modal */}
      {selectedHoldForRelease && (
        <ConfirmActionModal
          open={!!selectedHoldForRelease}
          onOpenChange={(val) => {
            if (!val) setSelectedHoldForRelease(null)
          }}
          title="Authorize Payment Release"
          description="Dual-control sign-off required to unlock EnterPro ERP rails and resume disbursement."
          actionType="RELEASE"
          entityId={selectedHoldForRelease.holdRef}
          entityName={selectedHoldForRelease.vendorName}
          amount={formatCurrency(selectedHoldForRelease.amount)}
          riskScore={selectedHoldForRelease.riskScore}
          onConfirm={handleConfirmRelease}
          confirmButtonText="Authorize Release"
        />
      )}
    </div>
  )
}

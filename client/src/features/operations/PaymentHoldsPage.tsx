import { useState, useMemo } from 'react'
import { Ban } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { MOCK_PAYMENT_HOLDS, type PaymentHoldRecord } from './data/operationsMockData'
import { toast } from 'sonner'

interface PaymentHoldsPageProps {
  onNavigate: (path: string) => void
}

export function PaymentHoldsPage({ onNavigate }: PaymentHoldsPageProps) {
  const [holds, setHolds] = useState<PaymentHoldRecord[]>(MOCK_PAYMENT_HOLDS)
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleReleaseHold = (hold: PaymentHoldRecord) => {
    setHolds(prev =>
      prev.map(h => (h.id === hold.id ? { ...h, status: 'RELEASED' } : h))
    )
    toast.success(`Payment Hold ${hold.holdRef} released. Invoice ${hold.invoiceNumber} approved for settlement.`)
  }

  const handleEscalate = (hold: PaymentHoldRecord) => {
    toast.info(`Hold ${hold.holdRef} escalated to CFO executive review`)
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

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => toast.success('Banking escrow gates verified')}
        >
          Check Settlement Rails
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Active Holds</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">{stats.active} Disbursals Locked</div>
          <span className="text-xs text-muted-foreground">EnterPro escrow gate active</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Total Capital Preserved</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">{formatCurrency(stats.totalHeld)}</div>
          <span className="text-xs text-emerald-400">Protected against leakage</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Critical Severity Holds</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">{stats.criticalCount} Critical</div>
          <span className="text-xs text-rose-400/80">Hero case: INV-28491</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Oldest Active Hold</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">{stats.oldestHoldDays} Days</div>
          <span className="text-xs text-muted-foreground">Quantum Logistics offshore IFSC</span>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="w-full sm:w-80">
        <SearchInput
          placeholder="Search hold ref, invoice, vendor..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-9 bg-card/70 border-border text-xs"
        />
      </div>

      {/* Holds Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Hold Reference</th>
                <th className="py-3 px-4">Invoice & Vendor</th>
                <th className="py-3 px-4 text-right">Held Amount (₹)</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4">Interception Rationale</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredHolds.map(hold => {
                const isHero = hold.invoiceNumber === 'INV-28491'
                return (
                  <tr
                    key={hold.id}
                    className={`hover:bg-accent/30 transition-colors ${
                      isHero ? 'bg-rose-950/20 border-l-2 border-l-rose-500' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      <span className="text-amber-400">{hold.holdRef}</span>
                      <div className="text-[10px] text-muted-foreground font-sans mt-0.5">
                        Workflow: {hold.workflowRef}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground flex items-center gap-1.5 font-mono">
                        <span>{hold.invoiceNumber}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{hold.vendorName}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                      {formatCurrency(hold.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <RiskBadge level={hold.severity} score={hold.riskScore} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground max-w-xs leading-relaxed text-xs">
                      {hold.reason}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-muted-foreground text-[11px]">
                      {hold.durationDays} days ago
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={hold.status === 'ACTIVE' ? 'warning' : 'success'} size="sm">
                        {hold.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {hold.status === 'ACTIVE' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300"
                              onClick={() => handleReleaseHold(hold)}
                            >
                              Release
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300"
                              onClick={() => onNavigate(`/investigations/${isHero ? 'inv-28491' : 'inv-27890'}`)}
                            >
                              Review
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-indigo-400 hover:text-indigo-300"
                              onClick={() => handleEscalate(hold)}
                            >
                              Escalate
                            </Button>
                          </>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-mono">Released</span>
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
    </div>
  )
}

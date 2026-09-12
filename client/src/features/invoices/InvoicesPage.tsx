import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  FileText,
  AlertTriangle,
  Upload,
  ArrowUpDown,
  Clock,
  Ban,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { formatCurrency, type RiskLevel } from '@/lib/utils'
import { apiClient } from '@/services/apiClient'
import { realtimeService } from '@/services/realtimeService'
import { toast } from 'sonner'

interface InvoicesPageProps {
  onNavigate: (path: string) => void
}

type FilterTab = 'ALL' | 'FLAGGED' | 'CRITICAL' | 'HIGH_RISK' | 'ON_HOLD' | 'VALIDATED' | 'APPROVED' | 'PAID'

interface LiveInvoice {
  id: string
  invoice_number: string
  vendor_id: string
  purchase_order_id: string | null
  amount: number
  tax: number
  currency: string
  invoice_date: string
  due_date: string
  status: string
  payment_status: string
  risk_score: number
  risk_level: string
  anomaly_status: string
  duplicate_status: string
  vendor?: {
    id: string
    name: string
    category: string
    risk_level: string
  } | null
  purchase_order?: {
    id: string
    po_number: string
    department: string
  } | null
  line_items: any[]
}

export function InvoicesPage({ onNavigate }: InvoicesPageProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'invoice_date' | 'amount' | 'risk_score'>('risk_score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [invoices, setInvoices] = useState<LiveInvoice[]>([])
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const queryParams: Record<string, any> = {
        page,
        pageSize,
        sortBy,
        sortOrder,
        search: searchQuery.trim() || undefined
      }

      if (activeTab !== 'ALL') {
        if (activeTab === 'HIGH_RISK' || activeTab === 'CRITICAL') {
          // handled client-side or status
        } else {
          queryParams.status = activeTab
        }
      }

      const res = await apiClient.get<{ invoices: LiveInvoice[]; total: number; totalPages: number }>('/api/invoices', queryParams)
      setInvoices(res.invoices || [])
      setTotalInvoices(res.total || 0)
    } catch (err: any) {
      console.error('[INVOICES LOAD ERROR]', err)
      setError(err.message || 'Failed to connect to invoice records.')
      toast.error('Unable to fetch live invoice data.')
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, sortBy, sortOrder, searchQuery, activeTab])

  useEffect(() => {
    fetchInvoices()

    const unsubscribe = realtimeService.subscribe('invoices', () => {
      fetchInvoices()
    })
    return () => unsubscribe()
  }, [fetchInvoices])

  // Overview metrics computed from current set
  const stats = useMemo(() => {
    const total = totalInvoices || invoices.length
    const criticalOrHigh = invoices.filter(i => i.risk_level?.toLowerCase() === 'critical' || i.risk_level?.toLowerCase() === 'high' || i.risk_score >= 70).length
    const onHold = invoices.filter(i => i.status === 'ON_HOLD' || i.payment_status === 'HELD').length
    const totalExposure = invoices.reduce((acc, i) => acc + (Number(i.amount) || 0), 0)
    return { total, criticalOrHigh, onHold, totalExposure }
  }, [invoices, totalInvoices])

  const filteredInvoices = useMemo(() => {
    if (activeTab === 'HIGH_RISK') {
      return invoices.filter(i => i.risk_level?.toLowerCase() === 'high' || (i.risk_score >= 70 && i.risk_score < 90))
    }
    if (activeTab === 'CRITICAL') {
      return invoices.filter(i => i.risk_level?.toLowerCase() === 'critical' || i.risk_score >= 90)
    }
    return invoices
  }, [invoices, activeTab])

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'ALL', label: 'All Invoices' },
    { id: 'FLAGGED', label: 'Flagged' },
    { id: 'CRITICAL', label: 'Critical Risk' },
    { id: 'HIGH_RISK', label: 'High Risk' },
    { id: 'ON_HOLD', label: 'On Hold' },
    { id: 'VALIDATED', label: 'Validated' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'PAID', label: 'Paid' },
  ]

  const getStatusBadge = (status: string, paymentStatus?: string) => {
    if (paymentStatus === 'HELD' || status === 'ON_HOLD') {
      return <Badge variant="neutral" size="sm" className="bg-amber-500/10 text-amber-300 border-amber-500/30">ON HOLD</Badge>
    }
    switch (status) {
      case 'CRITICAL':
        return <Badge variant="error" size="sm" dot>CRITICAL</Badge>
      case 'FLAGGED':
      case 'UNDER_REVIEW':
        return <Badge variant="warning" size="sm">FLAGGED</Badge>
      case 'APPROVED':
        return <Badge variant="success" size="sm">APPROVED</Badge>
      case 'PAID':
        return <Badge variant="info" size="sm">PAID</Badge>
      case 'REJECTED':
        return <Badge variant="error" size="sm">REJECTED</Badge>
      case 'VALIDATED':
        return <Badge variant="success" size="sm">VALIDATED</Badge>
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>
    }
  }

  const mapRiskLevel = (_level: string, score: number): RiskLevel => {
    if (score >= 90) return 'critical'
    if (score >= 70) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Invoice Management
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Live Supabase
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time AP ingestion, automated 3-way matching & duplicate detection ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInvoices()}
            className="gap-1.5"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="gap-2 shadow-lg shadow-cyan-500/20"
            onClick={() => onNavigate('/invoices/upload')}
          >
            <Upload className="w-4 h-4" />
            Upload Invoice
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-cyan-500 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Invoices</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.total}</span>
            <span className="text-xs text-muted-foreground">recorded</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">High & Critical Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">{stats.criticalOrHigh}</span>
            <span className="text-xs text-rose-400/80">require review</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Holds</span>
            <Ban className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{stats.onHold}</span>
            <span className="text-xs text-amber-400/80">settlement frozen</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Exposure</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalExposure)}</span>
            <span className="text-xs text-muted-foreground">in current page</span>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-border/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="w-64">
              <SearchInput
                placeholder="Search invoice # or vendor..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            <div className="flex items-center gap-1.5 border border-border/70 rounded-lg p-1 bg-secondary/30">
              <span className="text-[11px] text-muted-foreground px-2">Sort:</span>
              <button
                onClick={() => {
                  setSortBy('risk_score')
                  setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  sortBy === 'risk_score' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Risk
                <ArrowUpDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setSortBy('amount')
                  setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  sortBy === 'amount' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Amount
                <ArrowUpDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setSortBy('invoice_date')
                  setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  sortBy === 'invoice_date' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Date
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-xs font-medium text-muted-foreground">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-36" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-20 ml-auto" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-muted/60 rounded-full w-14 mx-auto" /></td>
                    <td className="py-4 px-4"><div className="h-5 bg-muted/60 rounded w-16 mx-auto" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-muted/60 rounded w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                    <p className="text-rose-400 font-medium">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => fetchInvoices()} className="mt-3">
                      Retry Connection
                    </Button>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-foreground">No invoices matching the current filter</p>
                    <p className="text-xs mt-1">Try adjusting the status tab or search terms</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const riskLevel = mapRiskLevel(inv.risk_level, inv.risk_score)
                  const isHighRisk = inv.risk_score >= 70
                  const isHold = inv.status === 'ON_HOLD' || inv.payment_status === 'HELD'

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => onNavigate(`/invoices/${inv.id}`)}
                      className={`hover:bg-muted/40 transition-colors cursor-pointer group ${
                        isHold ? 'bg-amber-950/10' : isHighRisk ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-cyan-400 transition-colors">
                            {inv.invoice_number}
                          </span>
                          {inv.duplicate_status === 'CONFIRMED_DUPLICATE' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              DUPLICATE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {inv.invoice_date}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{inv.vendor?.name || 'Vendor Account'}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{inv.vendor?.category || 'General'}</div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">
                        {inv.purchase_order?.po_number || (
                          <span className="text-muted-foreground/50 italic">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-foreground">
                        {formatCurrency(inv.amount)}
                        <div className="text-[10px] font-normal text-muted-foreground">
                          Tax: {formatCurrency(inv.tax)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <RiskBadge level={riskLevel} score={inv.risk_score} size="sm" />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(inv.status, inv.payment_status)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-foreground text-xs">
                        {inv.due_date}
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40"
                            onClick={() => onNavigate(`/invoices/${inv.id}`)}
                          >
                            Details
                          </Button>
                          {isHighRisk && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 gap-1"
                              onClick={() => onNavigate(`/investigations/${inv.id}`)}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Investigate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination summary */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/70 bg-card/30 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-medium text-foreground">{filteredInvoices.length}</span> of{' '}
            <span className="font-medium text-foreground">{totalInvoices}</span> invoices
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="h-7 text-xs"
            >
              Previous
            </Button>
            <span className="px-2 font-mono">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= totalInvoices}
              onClick={() => setPage(prev => prev + 1)}
              className="h-7 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

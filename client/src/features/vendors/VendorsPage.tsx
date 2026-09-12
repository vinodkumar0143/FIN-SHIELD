import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { formatCurrency, type RiskLevel } from '@/lib/utils'
import { apiClient } from '@/services/apiClient'
import { toast } from 'sonner'

interface VendorsPageProps {
  onNavigate: (path: string) => void
}

interface LiveVendor {
  id: string
  name: string
  tax_id: string | null
  category: string
  risk_score: number
  risk_level: string
  total_exposure: number
  status: string
  payment_terms: string
}

export function VendorsPage({ onNavigate }: VendorsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'risk_score' | 'total_exposure' | 'name'>('risk_score')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [vendors, setVendors] = useState<LiveVendor[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVendors = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<{ vendors: LiveVendor[]; total: number }>('/api/vendors', {
        page,
        pageSize,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sortBy
      })
      setVendors(res.vendors || [])
      setTotalCount(res.total || 0)
    } catch (err: any) {
      console.error('[VENDORS FETCH ERROR]', err)
      setError(err.message || 'Failed to fetch vendors')
      toast.error('Unable to fetch vendor registry')
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, searchQuery, statusFilter, sortBy])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const stats = useMemo(() => {
    const count = totalCount || vendors.length
    const highRisk = vendors.filter(v => v.risk_score >= 60 || v.risk_level === 'HIGH' || v.risk_level === 'CRITICAL').length
    const totalExposure = vendors.reduce((acc, v) => acc + (Number(v.total_exposure) || 0), 0)
    const flaggedCount = vendors.filter(v => v.status === 'FLAGGED').length
    return { count, highRisk, totalExposure, flaggedCount }
  }, [vendors, totalCount])

  const mapRiskLevel = (_level: string, score: number): RiskLevel => {
    if (score >= 90) return 'critical'
    if (score >= 70) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded">
              FINANCIAL INTELLIGENCE
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Entity Profiling & Counterparty Risk
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendor Intelligence Matrix</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Statistical baseline tracking, PO match frequency, and banking change alerts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchVendors()}
          disabled={isLoading}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Vendors</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">{stats.count}</div>
          <span className="text-xs text-muted-foreground">in Supabase directory</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm border-l-4 border-l-rose-500">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">High Risk Counterparties</span>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">{stats.highRisk}</div>
          <span className="text-xs text-rose-400/80">heightened monitoring</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Exposure</span>
          <div className="mt-2 text-2xl font-bold font-mono text-foreground">{formatCurrency(stats.totalExposure)}</div>
          <span className="text-xs text-muted-foreground">aggregate liability</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70 backdrop-blur-sm border-l-4 border-l-amber-500">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Flagged Counterparties</span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">{stats.flaggedCount}</div>
          <span className="text-xs text-amber-400/80">audit in progress</span>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-72">
            <SearchInput
              placeholder="Search vendor name, GSTIN, category..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-md text-xs border border-border/60">
              <span className="text-muted-foreground px-1.5">Status:</span>
              {['ALL', 'ACTIVE', 'FLAGGED', 'PENDING_VERIFICATION'].map(st => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st)
                    setPage(1)
                  }}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    statusFilter === st ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-md text-xs border border-border/60">
              <span className="text-muted-foreground px-1.5">Sort:</span>
              <button
                onClick={() => setSortBy('risk_score')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  sortBy === 'risk_score' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Risk
              </button>
              <button
                onClick={() => setSortBy('total_exposure')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  sortBy === 'total_exposure' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Exposure
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-xs font-medium text-muted-foreground">
                <th className="py-3 px-4">Vendor Entity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Total Exposure</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Payment Terms</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-36" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-20 ml-auto" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-muted/60 rounded-full w-14 mx-auto" /></td>
                    <td className="py-4 px-4"><div className="h-5 bg-muted/60 rounded w-16 mx-auto" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-muted/60 rounded w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-rose-400">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    <span>{error}</span>
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No vendors match current filter criteria.
                  </td>
                </tr>
              ) : (
                vendors.map(v => {
                  const riskLevel = mapRiskLevel(v.risk_level, v.risk_score)
                  const isHighRisk = v.risk_score >= 60

                  return (
                    <tr
                      key={v.id}
                      onClick={() => onNavigate(`/vendors/${v.id}`)}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                        isHighRisk ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        <div className="hover:text-cyan-400 transition-colors">{v.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{v.tax_id || 'GSTIN Pending'}</div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground text-xs">
                        {v.category}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-foreground">
                        {formatCurrency(v.total_exposure)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <RiskBadge level={riskLevel} score={v.risk_score} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={v.status === 'ACTIVE' ? 'success' : v.status === 'FLAGGED' ? 'error' : 'neutral'}
                          size="sm"
                        >
                          {v.status.replace('_', ' ')}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground text-xs font-mono">
                        {v.payment_terms || 'Net 30'}
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300"
                          onClick={() => onNavigate(`/vendors/${v.id}`)}
                        >
                          Profile
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {vendors.length} of {totalCount} counterparties</span>
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
              disabled={page * pageSize >= totalCount}
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

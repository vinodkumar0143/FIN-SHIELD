import React, { useState } from 'react'
import { Card, MetricCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { RiskScoreRing } from '@/components/ui/RiskScoreRing'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Dialog } from '@/components/ui/Dialog'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { DataTable } from '@/components/ui/DataTable'
import { Timeline } from '@/components/ui/Timeline'
import {
  CurrencyValue,
  EvidenceCard,
  AIInsightCard,
  WorkflowStatus,
} from '@/components/ui/FinancialComponents'
import {
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  Bot,
} from 'lucide-react'

export const DesignSystemShowcase: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  // Sample Table Data for Specimen
  const tableData = [
    {
      id: 'INV-28491',
      invoiceNumber: 'INV-28491',
      vendor: 'ABC Supplies Pvt Ltd',
      amount: 482000,
      riskScore: 87,
      status: 'ON_HOLD' as const,
      timestamp: '2026-09-10',
    },
    {
      id: 'INV-28412',
      invoiceNumber: 'INV-28412',
      vendor: 'ABC Supplies Pvt Ltd',
      amount: 482000,
      riskScore: 32,
      status: 'APPROVED' as const,
      timestamp: '2026-09-02',
    },
    {
      id: 'INV-19044',
      invoiceNumber: 'INV-19044',
      vendor: 'Apex Tech Solutions',
      amount: 1250000,
      riskScore: 14,
      status: 'APPROVED' as const,
      timestamp: '2026-09-08',
    },
    {
      id: 'INV-30119',
      invoiceNumber: 'INV-30119',
      vendor: 'Global Cloud Logistics',
      amount: 745000,
      riskScore: 72,
      status: 'IN_REVIEW' as const,
      timestamp: '2026-09-11',
    },
  ]

  const tableColumns = [
    {
      header: 'Invoice Hash / ID',
      accessor: (row: typeof tableData[0]) => (
        <span className="font-mono font-semibold text-cyan-300">
          {row.invoiceNumber}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Vendor Entity',
      accessor: (row: typeof tableData[0]) => (
        <span className="font-medium text-slate-200">{row.vendor}</span>
      ),
      sortable: true,
    },
    {
      header: 'Disbursement (INR)',
      accessor: (row: typeof tableData[0]) => (
        <CurrencyValue amount={row.amount} />
      ),
      sortable: true,
    },
    {
      header: 'Risk Classification',
      accessor: (row: typeof tableData[0]) => (
        <RiskBadge score={row.riskScore} />
      ),
      sortable: true,
    },
    {
      header: 'EnterPro State',
      accessor: (row: typeof tableData[0]) => (
        <WorkflowStatus status={row.status} />
      ),
    },
    {
      header: 'Audit Date',
      accessor: 'timestamp' as const,
      sortable: true,
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> STITCH DESIGN SYSTEM SPECIMEN
            </span>
            <Badge variant="cyan">OBSIDIAN SENTINEL v4.2</Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-slate-100 mt-1">
            FIN-SHIELD UI/UX Foundation & Component Showcase
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Translated from Stitch design tokens: dark slate surface strata, calibrated telemetry metrics, 4-tier risk semantics, and responsive enterprise components.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
          >
            Inspect Tokens Modal
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setDrawerOpen(true)}
          >
            Open Side Drawer
          </Button>
        </div>
      </div>

      {/* Section 1: KPI Telemetry & Metric Cards Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            1. Enterprise Metric Cards & Telemetry
          </h2>
          <span className="text-[10px] font-mono text-slate-500">Live Data Contracts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Portfolio Value at Risk (VaR)"
            value="₹4.82Cr"
            delta="-14.2%"
            deltaLabel="safe mitigation"
            isPositiveDelta={true}
            badgeText="PORTFOLIO"
            badgeVariant="info"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <MetricCard
            title="Anomalous Transaction Rate"
            value="0.041%"
            delta="+0.008%"
            deltaLabel="monthly variance"
            isPositiveDelta={false}
            badgeText="ELEVATED"
            badgeVariant="warning"
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            title="Autonomous Fraud Prevention"
            value="₹1.24Cr"
            delta="+99.8%"
            deltaLabel="precision rate"
            isPositiveDelta={true}
            badgeText="PROTECTED"
            badgeVariant="success"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <MetricCard
            title="Active High-Severity Flags"
            value="3 Invoices"
            delta="1 Urgent"
            deltaLabel="requires hold"
            isPositiveDelta={false}
            badgeText="CRITICAL"
            badgeVariant="error"
            icon={<ShieldAlert className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Section 2: Semantic Risk Spectrum & Circular Risk Gauges */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-orange-400" />
          2. Semantic Risk Spectrum & Circular Telemetry Rings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex flex-col items-center text-center">
            <span className="text-[11px] font-mono font-semibold uppercase text-emerald-400 mb-2">
              Low Risk [0 - 29]
            </span>
            <RiskScoreRing score={18} />
            <p className="mt-3 text-[11px] text-slate-400 leading-tight">
              Automated clearance & nominal continuous audit.
            </p>
          </Card>

          <Card className="p-4 flex flex-col items-center text-center">
            <span className="text-[11px] font-mono font-semibold uppercase text-amber-400 mb-2">
              Medium Caution [30 - 59]
            </span>
            <RiskScoreRing score={48} />
            <p className="mt-3 text-[11px] text-slate-400 leading-tight">
              Minor variance detected, analyst review suggested.
            </p>
          </Card>

          <Card className="p-4 flex flex-col items-center text-center">
            <span className="text-[11px] font-mono font-semibold uppercase text-orange-400 mb-2">
              High Elevation [60 - 79]
            </span>
            <RiskScoreRing score={74} />
            <p className="mt-3 text-[11px] text-slate-400 leading-tight">
              Suspicious velocity or budget overrun, hold triggered.
            </p>
          </Card>

          <Card className="p-4 flex flex-col items-center text-center border-rose-500/40 bg-rose-950/10">
            <span className="text-[11px] font-mono font-semibold uppercase text-rose-400 mb-2">
              Critical Breach [80 - 100]
            </span>
            <RiskScoreRing score={87} />
            <p className="mt-3 text-[11px] text-slate-400 leading-tight">
              Hero Scenario INV-28491: Immediate payment freeze.
            </p>
          </Card>
        </div>
      </div>

      {/* Section 3: AI Forensic Reasoning & Evidence Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-indigo-400" />
          3. Multi-Source Evidence & AI Reasoning Cards
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EvidenceCard
            category="HISTORICAL AMOUNT ANOMALY"
            title="Invoice Amount +311.9% Over Baseline"
            description="Invoice INV-28491 of ₹4,82,000 exceeds ABC Supplies historical average (₹1,17,000) by 3.42 standard deviations (Z-Score: 3.42)."
            severity="CRITICAL"
            metricLabel="DEVIATION"
            metricValue="+311.9% (Z=3.42)"
            onDeepDive={() => onNavigate?.('/investigations')}
          />

          <AIInsightCard
            summary="Multi-source correlation shows unverified bank details changed 4 days prior, combined with a matching ₹4,82,000 disbursement processed 8 days ago and a 18.5% departmental budget overrun."
            recommendation="PLACE PAYMENT ON HOLD AND REQUIRE MANDATORY FINANCE MANAGER VERIFICATION."
            confidenceScore={98.7}
            actionLabel="View Investigation Cockpit"
            onAction={() => onNavigate?.('/investigations')}
          />
        </div>
      </div>

      {/* Section 4: Interactive Data Table Specimen */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            4. Reusable Financial Data Table Specimen
          </h2>
          <div className="w-64">
            <SearchInput
              placeholder="Filter invoices or vendors..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onClear={() => setSearchVal('')}
            />
          </div>
        </div>

        <DataTable
          columns={tableColumns}
          data={tableData}
          onRowClick={(row) => {
            if (row.invoiceNumber === 'INV-28491') {
              onNavigate?.('/investigations')
            }
          }}
        />
      </div>

      {/* Section 5: Tabs, Empty State & Investigation Timeline Specimen */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
          5. Tabs, Empty State & Operational Timeline
        </h2>

        <Tabs defaultValue="empty-state">
          <TabsList>
            <TabsTrigger value="empty-state">Empty State Specimen</TabsTrigger>
            <TabsTrigger value="timeline">Investigation Pipeline</TabsTrigger>
            <TabsTrigger value="badges">Risk Badges & Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="empty-state">
            <EmptyState
              title="No Unresolved AML Anomalies Found"
              description="Real-time multi-source telemetry scan indicates verified transactions and aligned budget envelopes across 28 active vendors."
              scanTimestamp="2026-09-12 10:20:00 IST"
              actionLabel="Trigger Manual Deep Audit Scan"
              onAction={() => alert('Manual Deep Audit triggered across all 18 tables.')}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="p-6 max-w-2xl mx-auto">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 font-semibold">
                FIN-SHIELD Pipeline Flow (INV-28491)
              </h3>
              <Timeline
                items={[
                  {
                    id: 1,
                    title: 'Data Ingestion & Hash Generation',
                    description: 'Invoice uploaded, SHA-256 binary fingerprint generated, saved to invoices table.',
                    timestamp: '10:14:02',
                    status: 'completed',
                  },
                  {
                    id: 2,
                    title: 'Deterministic Anomaly & Duplicate Calculation',
                    description: 'Amount Z-score computed at 3.42; Soft duplicate found matching INV-28412.',
                    timestamp: '10:14:05',
                    status: 'completed',
                    badge: '4 SIGNALS DETECTED',
                  },
                  {
                    id: 3,
                    title: 'Qwen Forensic Reasoning',
                    description: 'Multi-source evidence compiled and evaluated; Risk Score 87/100 confirmed.',
                    timestamp: '10:14:09',
                    status: 'completed',
                    badge: 'RECOMMEND: HOLD',
                  },
                  {
                    id: 4,
                    title: 'EnterPro Workflow Payment Hold',
                    description: 'Task #WF-9042 created; Disbursement frozen pending Finance Manager override.',
                    timestamp: '10:14:12',
                    status: 'in-progress',
                  },
                ]}
              />
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide block">
                  Semantic Risk Badges:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge score={18} />
                  <RiskBadge score={45} />
                  <RiskBadge score={72} />
                  <RiskBadge score={91} />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide block">
                  Workflow States:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <WorkflowStatus status="PENDING" />
                  <WorkflowStatus status="IN_REVIEW" />
                  <WorkflowStatus status="ON_HOLD" />
                  <WorkflowStatus status="APPROVED" />
                  <WorkflowStatus status="REJECTED" />
                  <WorkflowStatus status="ESCALATED" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide block">
                  System Tokens:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="cyan" dot>CYAN ENGINE</Badge>
                  <Badge variant="indigo" dot>INDIGO VECTOR</Badge>
                  <Badge variant="success" dot>POSTGRES RLS ACTIVE</Badge>
                  <Badge variant="warning" dot>SLA EXPOSURE</Badge>
                  <Badge variant="error" dot>AML BREACH</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Inspect Tokens Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Stitch Design System Tokens — Obsidian Sentinel"
        description="Core design tokens powering FIN-SHIELD's enterprise fintech appearance."
      >
        <div className="space-y-3 font-mono text-xs text-slate-300">
          <div className="p-3 rounded bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Base Canvas:</span>
              <span className="text-cyan-400 font-bold">#0B0F19</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Panel Surfaces:</span>
              <span className="text-cyan-400 font-bold">#111827</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Elevated Cards:</span>
              <span className="text-cyan-400 font-bold">#1F2937</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Structural Borders:</span>
              <span className="text-cyan-400 font-bold">#1E293B</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Brand Primary:</span>
              <span className="text-cyan-400 font-bold">#06B6D4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Brand Secondary:</span>
              <span className="text-indigo-400 font-bold">#6366F1</span>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setDialogOpen(false)}>
              Dismiss Token Inspector
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Sample Side Drawer */}
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Investigation Dossier Specimen"
        description="Detailed multi-source evidence and cryptographic audit records."
        width="lg"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Target Record</span>
            <div className="flex justify-between text-slate-200 font-bold text-sm">
              <span>INV-28491</span>
              <span className="text-rose-400">₹4,82,000</span>
            </div>
            <div className="text-slate-400 text-xs">ABC Supplies Pvt Ltd</div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Identified Irregularities</span>
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
              <div className="font-bold">✓ Amount +311.9% Over Average</div>
              <div className="text-[11px] text-rose-400/90 font-sans">
                Vendor standard transaction is ₹1,17,000. Current disbursement is an acute outlier.
              </div>
            </div>
            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
              <div className="font-bold">✓ Bank Details Changed 4 Days Ago</div>
              <div className="text-[11px] text-amber-400/90 font-sans">
                Routing IFSC altered without procurement verified sign-off.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setDrawerOpen(false)}>
              Close Drawer
            </Button>
            <Button size="sm" variant="danger" onClick={() => {
              alert('Payment hold executed in EnterPro sandbox.')
              setDrawerOpen(false)
            }}>
              Confirm Payment Hold
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  )
}

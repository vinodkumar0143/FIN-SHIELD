import React, { useState } from 'react'
import { DashboardHeader } from './components/DashboardHeader'
import { QuickActionsRibbon } from './components/QuickActionsRibbon'
import { KpiRibbon } from './components/KpiRibbon'
import { AiInsightBanner } from './components/AiInsightBanner'
import { RiskOverviewSection } from './components/RiskOverviewSection'
import { CashFlowForecastSection } from './components/CashFlowForecastSection'
import { BudgetPerformanceSection } from './components/BudgetPerformanceSection'
import { AnomalyIntelligenceSection } from './components/AnomalyIntelligenceSection'
import { HighRiskItemsTable } from './components/HighRiskItemsTable'
import { RecentInvestigationsSection } from './components/RecentInvestigationsSection'
import { PendingApprovalsSection } from './components/PendingApprovalsSection'
import { PaymentHoldsSection } from './components/PaymentHoldsSection'
import { VendorRiskSnapshotSection } from './components/VendorRiskSnapshotSection'
import { AlertsAndAttentionSection } from './components/AlertsAndAttentionSection'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { UploadCloud, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export interface DashboardPageProps {
  onNavigate: (path: string) => void
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadStep, setUploadStep] = useState<'idle' | 'uploading' | 'done'>('idle')

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Financial telemetry updated with latest multi-source ledger data.')
    }, 800)
  }

  const handleSimulateUpload = () => {
    setUploadStep('uploading')
    setTimeout(() => {
      setUploadStep('done')
      toast.success('Invoice INV-28491 ingested. SHA-256 fingerprint generated.')
    }, 1200)
  }

  const handleInspectInvestigation = (invoiceId: string) => {
    toast.info(`Opening AI Investigation cockpit for ${invoiceId}...`)
    onNavigate('/investigations')
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Dashboard Header */}
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      {/* 15. Quick Actions Ribbon */}
      <QuickActionsRibbon
        onNavigate={onNavigate}
        onTriggerUpload={() => {
          setUploadStep('idle')
          setUploadModalOpen(true)
        }}
      />

      {/* 2. KPI Ribbon (6 Metrics) */}
      <KpiRibbon onMetricClick={(metricId) => {
        if (metricId === 'active-investigations') onNavigate('/investigations')
        else if (metricId === 'pending-approvals') onNavigate('/approvals')
        else if (metricId === 'payment-holds') onNavigate('/workflows')
        else if (metricId === 'budget-utilization') onNavigate('/budgets')
        else onNavigate('/invoices')
      }} />

      {/* 8. Highlighted AI Financial Insight Banner */}
      <AiInsightBanner onInspectInvestigation={handleInspectInvestigation} />

      {/* 3 & 4. Financial Risk Overview & Composite Risk Score */}
      <RiskOverviewSection onNavigateRisk={() => onNavigate('/risk')} />

      {/* 5. Cash Flow Forecast & Outflow Simulation */}
      <CashFlowForecastSection onNavigateForecast={() => onNavigate('/forecasting')} />

      {/* 6 & 7. Budget Performance & Anomaly Intelligence (Dual Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BudgetPerformanceSection onNavigateBudgets={() => onNavigate('/budgets')} />
        <AnomalyIntelligenceSection onNavigateAlerts={() => onNavigate('/alerts')} />
      </div>

      {/* 9. High-Risk Financial Items (Featuring Hero INV-28491) */}
      <HighRiskItemsTable
        onInvestigate={handleInspectInvestigation}
        onNavigateInvoices={() => onNavigate('/invoices')}
      />

      {/* 10 & 11. Recent Investigations & Pending Approvals (Dual Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentInvestigationsSection
          onSelectInvestigation={handleInspectInvestigation}
          onNavigateInvestigations={() => onNavigate('/investigations')}
        />
        <PendingApprovalsSection
          onReviewInvoice={handleInspectInvestigation}
          onNavigateApprovals={() => onNavigate('/approvals')}
        />
      </div>

      {/* 12. Payment Holds & Escrow Freezes */}
      <PaymentHoldsSection
        onInspectHold={handleInspectInvestigation}
        onNavigateWorkflows={() => onNavigate('/workflows')}
      />

      {/* 13 & 14. Vendor Risk Snapshot & Attention Required (Dual Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VendorRiskSnapshotSection
          onSelectVendor={(code) => {
            toast.info(`Opening vendor risk dossier for ${code}`)
            onNavigate('/vendors')
          }}
          onNavigateVendors={() => onNavigate('/vendors')}
        />
        <AlertsAndAttentionSection
          onSelectAlert={(route) => {
            if (route) onNavigate(route)
            else onNavigate('/alerts')
          }}
        />
      </div>

      {/* Upload Invoice Simulation Modal */}
      <Dialog
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        title="Ingest Financial Invoice Document"
        description="Upload corporate invoice PDF/image for automated data extraction, 3-way matching, and anomaly surveillance."
      >
        <div className="space-y-4">
          {uploadStep === 'idle' && (
            <div
              onClick={handleSimulateUpload}
              className="p-8 border-2 border-dashed border-[#1E293B] hover:border-cyan-500/50 rounded-lg bg-[#0F131D]/80 flex flex-col items-center justify-center cursor-pointer transition-colors group"
            >
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-6 w-6" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-100 mt-3">
                Click to Select or Drop Invoice (PDF / PNG / JPG)
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-1">
                Sample File: INV-28491_ABC_Supplies.pdf (482 KB)
              </span>
            </div>
          )}

          {uploadStep === 'uploading' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
              <span className="text-xs font-mono text-cyan-300 font-semibold tracking-wide">
                Computing SHA-256 hash & running OCR field extraction...
              </span>
            </div>
          )}

          {uploadStep === 'done' && (
            <div className="p-4 rounded bg-emerald-950/20 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Invoice Ingested: INV-28491</span>
              </div>
              <div className="text-xs text-slate-300 font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vendor:</span>
                  <span className="text-slate-200">ABC Supplies Pvt Ltd</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="text-slate-100 font-bold">₹4,82,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Hash:</span>
                  <span className="text-slate-400 text-[10px]">7f83b165...e924</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUploadModalOpen(false)}
            >
              Close
            </Button>
            {uploadStep === 'done' && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setUploadModalOpen(false)
                  onNavigate('/investigations')
                }}
              >
                Launch AI Investigation
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  )
}

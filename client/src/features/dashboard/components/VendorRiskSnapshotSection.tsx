import React from 'react'
import { Card } from '@/components/ui/Card'
import { VENDOR_RISK_SNAPSHOT } from '../mockData'
import { RiskBadge } from '@/components/ui/Badge'
import { CurrencyValue } from '@/components/ui/FinancialComponents'
import { Building2, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export const VendorRiskSnapshotSection: React.FC<{
  onSelectVendor: (vendorCode: string) => void
  onNavigateVendors?: () => void
}> = ({ onSelectVendor, onNavigateVendors }) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div>
          <h3 className="text-xs font-mono font-semibold uppercase text-slate-100 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-indigo-400" />
            Vendor Risk Snapshot & Anomaly Exposure
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Historical deviation index, banking hash verification, and transactional frequency surveillance
          </p>
        </div>

        {onNavigateVendors && (
          <button
            onClick={onNavigateVendors}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>All Vendors (28)</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B] text-slate-400 font-mono text-[10px] uppercase">
              <th className="py-2 px-3">Vendor Entity</th>
              <th className="py-2 px-3">Risk Tier</th>
              <th className="py-2 px-3">Total Volume Exposure</th>
              <th className="py-2 px-3">Active Invoices</th>
              <th className="py-2 px-3">Velocity Trend</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
            {VENDOR_RISK_SNAPSHOT.map((v) => (
              <tr
                key={v.id}
                onClick={() => onSelectVendor(v.vendorCode)}
                className="hover:bg-cyan-500/[0.04] transition-colors cursor-pointer group"
              >
                <td className="py-2.5 px-3">
                  <div className="font-mono font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {v.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">{v.vendorCode}</div>
                </td>

                <td className="py-2.5 px-3">
                  <RiskBadge score={v.riskScore} />
                </td>

                <td className="py-2.5 px-3">
                  <CurrencyValue amount={v.totalExposure} />
                </td>

                <td className="py-2.5 px-3 font-mono text-slate-300">
                  {v.activeInvoices}
                </td>

                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                    {v.trend === 'increasing' ? (
                      <span className="text-rose-400 flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" /> Rising
                      </span>
                    ) : v.trend === 'decreasing' ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <TrendingDown className="h-3 w-3" /> Easing
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-0.5">
                        <Minus className="h-3 w-3" /> Stable
                      </span>
                    )}
                  </span>
                </td>

                <td className="py-2.5 px-3 text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      v.status === 'WATCHLIST'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

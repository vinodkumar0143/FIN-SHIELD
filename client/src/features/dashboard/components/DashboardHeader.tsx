import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { REPORTING_PERIODS } from '../mockData'
import { RefreshCw, Calendar, Sparkles, Download } from 'lucide-react'
import { toast } from 'sonner'

export interface DashboardHeaderProps {
  onRefresh: () => void
  isRefreshing?: boolean
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onRefresh,
  isRefreshing = false,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(REPORTING_PERIODS[0])

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> EXECUTIVE RISK INTELLIGENCE
          </span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 font-semibold uppercase">
            LIVE SENTINEL
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-slate-100 mt-1">
          Financial Risk & Operations Command
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
          Autonomous multi-source anomaly detection, forensic Qwen reasoning, and real-time EnterPro workflow orchestration.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Period Selector */}
        <div className="relative flex items-center bg-[#111827] border border-[#1E293B] rounded px-2.5 py-1 text-xs">
          <Calendar className="h-3.5 w-3.5 text-slate-400 mr-2 flex-shrink-0" />
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value)
              toast.info(`Reporting Period updated: ${e.target.value}`)
            }}
            aria-label="Select reporting period"
            className="bg-transparent text-slate-200 text-xs font-mono font-medium focus:outline-none cursor-pointer pr-2"
          >
            {REPORTING_PERIODS.map((p) => (
              <option key={p} value={p} className="bg-[#111827] text-slate-200">
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />}
        >
          Refresh Feed
        </Button>

        {/* Export Brief Button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => toast.success('Financial Executive Brief exported as PDF.')}
          leftIcon={<Download className="h-3.5 w-3.5 text-indigo-400" />}
        >
          Export Brief
        </Button>
      </div>
    </div>
  )
}

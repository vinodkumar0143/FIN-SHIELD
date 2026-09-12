import React from 'react'
import { Card } from '@/components/ui/Card'
import {
  UploadCloud,
  SearchCode,
  CheckSquare,
  Building2,
  FileSpreadsheet,
  Zap,
} from 'lucide-react'

export interface QuickActionsRibbonProps {
  onNavigate: (path: string) => void
  onTriggerUpload: () => void
}

export const QuickActionsRibbon: React.FC<QuickActionsRibbonProps> = ({
  onNavigate,
  onTriggerUpload,
}) => {
  const actions = [
    {
      id: 'upload',
      title: 'Upload Invoice',
      subtitle: 'PDF/PNG Ingestion',
      icon: <UploadCloud className="h-4 w-4 text-cyan-400" />,
      onClick: onTriggerUpload,
      highlight: true,
    },
    {
      id: 'investigations',
      title: 'Review Investigations',
      subtitle: '12 Active Cases',
      icon: <SearchCode className="h-4 w-4 text-indigo-400" />,
      onClick: () => onNavigate('/investigations'),
    },
    {
      id: 'approvals',
      title: 'View Approvals',
      subtitle: '9 Pending Sign-offs',
      icon: <CheckSquare className="h-4 w-4 text-amber-400" />,
      onClick: () => onNavigate('/approvals'),
    },
    {
      id: 'vendor',
      title: 'Analyze Vendor',
      subtitle: 'Bank Hash Registry',
      icon: <Building2 className="h-4 w-4 text-emerald-400" />,
      onClick: () => onNavigate('/vendors'),
    },
    {
      id: 'reports',
      title: 'View Reports',
      subtitle: 'Compliance Dossiers',
      icon: <FileSpreadsheet className="h-4 w-4 text-slate-400" />,
      onClick: () => onNavigate('/reports'),
    },
  ]

  return (
    <Card className="p-4 bg-gradient-to-r from-[#111827] via-[#0F131D] to-[#111827]">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-3.5 w-3.5 text-cyan-400" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
          FINANCIAL OPERATIONS FAST ACTIONS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={act.onClick}
            className={`p-3 rounded-md border text-left transition-all duration-150 group flex flex-col justify-between h-20 select-none ${
              act.highlight
                ? 'bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-[#111827] border-[#1E293B] hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1 rounded bg-slate-900 border border-slate-800">
                {act.icon}
              </span>
              <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-300">
                ↵
              </span>
            </div>

            <div>
              <div className="text-xs font-mono font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                {act.title}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {act.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}

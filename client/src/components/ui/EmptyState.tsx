import React from 'react'
import { cn } from '@/lib/utils'
import { ShieldCheck } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  scanTimestamp?: string
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Anomalies Detected',
  description = 'Continuous financial monitoring indicates normal transactional baselines across verified vendors.',
  icon,
  actionLabel,
  onAction,
  scanTimestamp,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-[#1E293B] bg-[#111827]/50 p-8 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto',
        className
      )}
    >
      <div className="relative">
        <div className="h-14 w-14 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400">
          {icon || <ShieldCheck className="h-7 w-7 text-emerald-400" />}
        </div>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#111827] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
      </div>

      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-slate-100 font-mono uppercase tracking-wide">
          {title}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
          {description}
        </p>
      </div>

      {scanTimestamp && (
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Telemetry Check: {scanTimestamp}
        </span>
      )}

      {actionLabel && (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

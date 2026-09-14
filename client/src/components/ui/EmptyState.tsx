import React from 'react'
import { cn } from '@/lib/utils'
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react'
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
  title = 'No Records Found',
  description = 'There are currently no items matching your filter or query criteria.',
  icon,
  actionLabel,
  onAction,
  scanTimestamp,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-8 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto shadow-subtle',
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-surface-subtle border border-border flex items-center justify-center text-muted-foreground">
        {icon || <ShieldCheck className="h-6 w-6 text-emerald-400" />}
      </div>

      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-slate-100 font-sans tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
          {description}
        </p>
      </div>

      {scanTimestamp && (
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Verified At: {scanTimestamp}
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

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Operational Error',
  message = 'An unexpected error occurred while loading financial data.',
  onRetry,
  retryLabel = 'Retry Request',
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-rose-500/30 bg-surface p-8 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto shadow-subtle',
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
        <AlertCircle className="h-6 w-6" />
      </div>

      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-slate-100 font-sans tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
          {message}
        </p>
      </div>

      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

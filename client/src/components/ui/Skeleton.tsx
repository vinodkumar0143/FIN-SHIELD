import React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-highlight/50', className)}
      {...props}
    />
  )
}

export function LoadingState({ message = 'Loading financial intelligence...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-cyan border-t-transparent" />
      <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
        {message}
      </span>
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-2" role="status" aria-label="Loading table records">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 py-2 border-b border-border/40">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

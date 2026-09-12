import React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded bg-slate-800/60', className)}
      {...props}
    />
  )
}

export function LoadingState({ message = 'Loading financial telemetry...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent shadow-[0_0_12px_rgba(6,182,212,0.4)]" />
      <span className="text-xs font-mono text-slate-400 tracking-wide uppercase">
        {message}
      </span>
    </div>
  )
}

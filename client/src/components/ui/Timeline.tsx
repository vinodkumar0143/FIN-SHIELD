import React from 'react'
import { cn } from '@/lib/utils'
import { Check, Clock, AlertTriangle } from 'lucide-react'

export interface TimelineItemData {
  id: string | number
  title: string
  description?: string
  timestamp?: string
  status: 'completed' | 'in-progress' | 'pending' | 'flagged'
  badge?: string
  icon?: React.ReactNode
}

export interface TimelineProps {
  items: TimelineItemData[]
  className?: string
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn('relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border', className)}>
      {items.map((item) => {
        const statusConfigs = {
          completed: {
            dotBg: 'bg-emerald-500 text-slate-950',
            icon: <Check className="h-3 w-3 stroke-[3]" />,
            borderColor: 'border-emerald-500/30',
          },
          'in-progress': {
            dotBg: 'bg-brand-cyan text-slate-950',
            icon: <Clock className="h-3 w-3" />,
            borderColor: 'border-brand-cyan/30',
          },
          flagged: {
            dotBg: 'bg-rose-500 text-white',
            icon: <AlertTriangle className="h-3 w-3" />,
            borderColor: 'border-rose-500/30',
          },
          pending: {
            dotBg: 'bg-surface-elevated text-muted-foreground border border-border',
            icon: null,
            borderColor: 'border-border',
          },
        }

        const config = statusConfigs[item.status]

        return (
          <div key={item.id} className="relative group">
            {/* Status node */}
            <div
              className={cn(
                'absolute -left-[29px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-subtle',
                config.dotBg
              )}
            >
              {item.icon || config.icon}
            </div>

            {/* Content card */}
            <div className="rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-border-elevated shadow-subtle">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-100 font-sans">
                  {item.title}
                </span>
                {item.timestamp && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {item.timestamp}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed font-sans">
                  {item.description}
                </p>
              )}

              {item.badge && (
                <div className="mt-2.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-subtle border border-border text-muted-foreground">
                    {item.badge}
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

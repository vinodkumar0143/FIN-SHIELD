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
    <div className={cn('relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800', className)}>
      {items.map((item) => {
        const statusConfigs = {
          completed: {
            dotBg: 'bg-emerald-500 text-[#0B0F19]',
            icon: <Check className="h-3 w-3 stroke-[3]" />,
            borderColor: 'border-emerald-500/40',
          },
          'in-progress': {
            dotBg: 'bg-cyan-500 text-[#0B0F19] animate-pulse',
            icon: <Clock className="h-3 w-3" />,
            borderColor: 'border-cyan-500/40',
          },
          flagged: {
            dotBg: 'bg-rose-500 text-white',
            icon: <AlertTriangle className="h-3 w-3" />,
            borderColor: 'border-rose-500/40',
          },
          pending: {
            dotBg: 'bg-slate-800 text-slate-500 border border-slate-700',
            icon: null,
            borderColor: 'border-slate-800',
          },
        }

        const config = statusConfigs[item.status]

        return (
          <div key={item.id} className="relative group">
            {/* Status node */}
            <div
              className={cn(
                'absolute -left-[29px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow',
                config.dotBg
              )}
            >
              {item.icon || config.icon}
            </div>

            {/* Content card */}
            <div className="rounded border border-[#1E293B] bg-[#111827] p-3 transition-colors hover:border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-100 font-mono">
                  {item.title}
                </span>
                {item.timestamp && (
                  <span className="text-[10px] font-mono text-slate-500">
                    {item.timestamp}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              )}

              {item.badge && (
                <div className="mt-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
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

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ShieldCheck, Cpu, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface PlaceholderPageProps {
  title: string
  subtitle: string
  category: string
  badgeText?: string
  actionLabel?: string
  onAction?: () => void
  children?: React.ReactNode
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  category,
  badgeText = 'PHASE READY',
  actionLabel,
  onAction,
  children,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Module Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              {category}
            </span>
            <Badge variant="cyan">{badgeText}</Badge>
          </div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-slate-100 mt-1">
            {title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {actionLabel && (
          <Button onClick={onAction} size="sm" variant="primary" rightIcon={<ArrowRight className="h-3 w-3" />}>
            {actionLabel}
          </Button>
        )}
      </div>

      {children ? (
        children
      ) : (
        <Card className="p-8 border-dashed border-[#1E293B] bg-[#111827]/40 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400">
            <Cpu className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase tracking-wide">
              {title} Architecture Connected
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Visual foundation and data contracts for this module are established within the FIN-SHIELD application shell. Feature functionality will be attached in the subsequent implementation phase.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Supabase PostgreSQL Schema & RLS Ready</span>
          </div>
        </Card>
      )}
    </div>
  )
}

import React from 'react'
import { cn, formatCurrency, formatPercent, getRiskTheme, type RiskLevel } from '@/lib/utils'
import { AlertTriangle, Bot, ShieldAlert, Sparkles, ArrowRight, ExternalLink } from 'lucide-react'
import { Card } from './Card'

export interface CurrencyValueProps {
  amount: number
  currency?: string
  className?: string
}

export const CurrencyValue: React.FC<CurrencyValueProps> = ({ amount, currency = 'INR', className }) => {
  return (
    <span className={cn('font-mono font-bold tabular-nums', className)}>
      {formatCurrency(amount, currency)}
    </span>
  )
}

export interface PercentageValueProps {
  value: number
  invertSemantics?: boolean
  className?: string
}

export const PercentageValue: React.FC<PercentageValueProps> = ({ value, invertSemantics = false, className }) => {
  const isPositive = value > 0
  const isGood = invertSemantics ? !isPositive : isPositive

  return (
    <span
      className={cn(
        'font-mono font-semibold tabular-nums inline-flex items-center gap-0.5',
        isGood ? 'text-emerald-400' : 'text-rose-400',
        className
      )}
    >
      {formatPercent(value)}
    </span>
  )
}

export interface EvidenceCardProps {
  category: string
  title: string
  description: string
  severity: RiskLevel
  metricLabel?: string
  metricValue?: string | number
  className?: string
  onDeepDive?: () => void
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  category,
  title,
  description,
  severity,
  metricLabel,
  metricValue,
  className,
  onDeepDive,
}) => {
  const theme = getRiskTheme(severity)

  return (
    <Card className={cn('p-4 relative overflow-hidden transition-all', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-slate-800 border border-slate-700/60 text-cyan-400">
            <AlertTriangle className="h-3.5 w-3.5" />
          </span>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              {category}
            </span>
            <h4 className="text-xs font-semibold text-slate-100 font-mono">
              {title}
            </h4>
          </div>
        </div>

        <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border', theme.badge)}>
          {theme.label}
        </span>
      </div>

      <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
        {description}
      </p>

      {(metricLabel || metricValue !== undefined || onDeepDive) && (
        <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between">
          {metricLabel && metricValue !== undefined ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase">{metricLabel}:</span>
              <span className="text-xs font-mono font-bold text-slate-200">{metricValue}</span>
            </div>
          ) : <div />}

          {onDeepDive && (
            <button
              onClick={onDeepDive}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Audit Evidence</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

export interface AIInsightCardProps {
  title?: string
  summary: string
  recommendation: string
  confidenceScore?: number
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title = 'Qwen Forensic Intelligence Synthesis',
  summary,
  recommendation,
  confidenceScore = 96.4,
  actionLabel = 'Execute Recommended Workflow',
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-indigo-500/40 bg-gradient-to-b from-[#16192E] to-[#111827] p-5 shadow-lg relative overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-100 font-mono tracking-wide">
              {title}
            </h4>
            <span className="text-[10px] font-mono text-indigo-300/80 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Qwen Engine Verified • Confidence: {confidenceScore}%
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 uppercase tracking-wider">
          AI REASONING
        </span>
      </div>

      <div className="mt-3.5 space-y-2.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
            Forensic Deduction:
          </span>
          <p className="mt-0.5 text-xs text-slate-200 leading-relaxed">
            {summary}
          </p>
        </div>

        <div className="p-3 rounded bg-[#0B0F19]/80 border border-indigo-500/20">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-semibold flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" /> Recommended Action:
          </span>
          <p className="mt-0.5 text-xs font-semibold text-slate-100 font-mono">
            {recommendation}
          </p>
        </div>
      </div>

      {actionLabel && (
        <div className="mt-4 pt-3 border-t border-indigo-500/20 flex justify-end">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-all active:scale-[0.98]"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export type WorkflowStatusType = 'PENDING' | 'IN_REVIEW' | 'ON_HOLD' | 'APPROVED' | 'REJECTED' | 'ESCALATED'

export const WorkflowStatus: React.FC<{ status: WorkflowStatusType; className?: string }> = ({
  status,
  className,
}) => {
  const configs: Record<WorkflowStatusType, { label: string; style: string }> = {
    PENDING: { label: 'PENDING DISPATCH', style: 'bg-slate-800 text-slate-300 border-slate-700' },
    IN_REVIEW: { label: 'UNDER AUDIT', style: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' },
    ON_HOLD: { label: 'PAYMENT HELD', style: 'bg-amber-500/15 text-amber-400 border-amber-500/40' },
    APPROVED: { label: 'CLEARED / APPROVED', style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' },
    REJECTED: { label: 'DISBURSAL BLOCKED', style: 'bg-rose-500/15 text-rose-400 border-rose-500/40' },
    ESCALATED: { label: 'ESCALATED TO CFO', style: 'bg-purple-500/15 text-purple-300 border-purple-500/40' },
  }

  const config = configs[status] || configs.PENDING

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider border select-none',
        config.style,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  )
}

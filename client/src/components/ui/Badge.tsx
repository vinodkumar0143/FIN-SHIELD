import React from 'react'
import { cn, getRiskTheme, type RiskLevel } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'info' | 'cyan' | 'indigo' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    default: 'bg-slate-800 text-slate-200 border-slate-700',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    outline: 'bg-transparent text-slate-300 border-slate-700',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    error: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
  }

  const sizeStyles = {
    sm: 'text-[9px] px-1.5 py-0.2',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  }

  const dotColors: Record<string, string> = {
    default: 'bg-slate-400',
    neutral: 'bg-slate-400',
    outline: 'bg-slate-400',
    success: 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]',
    warning: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]',
    error: 'bg-rose-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]',
    info: 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]',
    cyan: 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]',
    indigo: 'bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded font-mono font-medium tracking-wider uppercase border select-none',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant] || dotColors.default)} />}
      {children}
    </span>
  )
}

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  score?: number
  level?: RiskLevel
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
  showScore?: boolean
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  level,
  size = 'md',
  showDot = true,
  showScore = true,
  className,
  ...props
}) => {
  const theme = getRiskTheme(score !== undefined ? score : (level || 'LOW'))
  const sizeStyles = {
    sm: 'text-[9px] px-2 py-0.2',
    md: 'text-[10px] px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded font-mono font-semibold tracking-wider uppercase border select-none',
        theme.badge,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', theme.dot)} />}
      <span>{theme.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 pl-1 border-l border-current/30 opacity-90">{score}/100</span>
      )}
    </span>
  )
}

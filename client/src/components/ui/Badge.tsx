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
    default: 'bg-surface-elevated text-slate-200 border-border',
    neutral: 'bg-surface-subtle text-muted-foreground border-border',
    outline: 'bg-transparent text-muted-foreground border-border',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    info: 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/25',
    cyan: 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/25',
    indigo: 'bg-brand-indigo/10 text-brand-indigo border-brand-indigo/25',
  }

  const sizeStyles = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  }

  const dotColors: Record<string, string> = {
    default: 'bg-slate-400',
    neutral: 'bg-muted-foreground',
    outline: 'bg-muted-foreground',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-rose-400',
    info: 'bg-brand-cyan',
    cyan: 'bg-brand-cyan',
    indigo: 'bg-brand-indigo',
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
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[10px] px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1',
  }

  return (
    <span
      role="status"
      aria-label={`Risk Level: ${theme.label}${score !== undefined ? ` (Score: ${score}/100)` : ''}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded font-mono font-semibold tracking-wider uppercase border select-none',
        theme.badge,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', theme.dot)} aria-hidden="true" />}
      <span>{theme.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 pl-1 border-l border-current/25 opacity-90 tabular-nums">{score}/100</span>
      )}
    </span>
  )
}

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  dot = true,
  className,
  ...props
}) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_')
  
  let variant: BadgeProps['variant'] = 'neutral'
  if (['APPROVED', 'CLEARED', 'RESOLVED', 'ACTIVE', 'VERIFIED', 'PASS', 'SUCCESS'].includes(normalized)) {
    variant = 'success'
  } else if (['PENDING', 'IN_REVIEW', 'ON_HOLD', 'UNDER_AUDIT', 'FLAGGED', 'WARNING'].includes(normalized)) {
    variant = 'warning'
  } else if (['REJECTED', 'BLOCKED', 'FAILED', 'ESCALATED', 'ERROR', 'CRITICAL'].includes(normalized)) {
    variant = 'error'
  } else if (['INFO', 'PROCESSING', 'QUEUED'].includes(normalized)) {
    variant = 'info'
  }

  return (
    <Badge variant={variant} size={size} dot={dot} className={className} {...props}>
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

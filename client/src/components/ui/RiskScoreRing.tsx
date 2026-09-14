import React from 'react'
import { cn, getRiskTheme } from '@/lib/utils'

export interface RiskScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  className?: string
}

export const RiskScoreRing: React.FC<RiskScoreRingProps> = ({
  score,
  size = 120,
  strokeWidth = 9,
  showLabel = true,
  className,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference
  const theme = getRiskTheme(clampedScore)

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Risk score: ${clampedScore} out of 100, severity: ${theme.label}`}
      className={cn('relative flex flex-col items-center justify-center select-none', className)}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1B2436"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Risk Level Dynamic Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-2xl font-bold tracking-tight text-slate-100 tabular-nums">
            {clampedScore}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-2.5 flex flex-col items-center text-center">
          <span
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border select-none',
              theme.badge
            )}
          >
            {theme.label}
          </span>
        </div>
      )}
    </div>
  )
}

export interface RiskProgressBarProps {
  score: number
  showLabel?: boolean
  className?: string
}

export const RiskProgressBar: React.FC<RiskProgressBarProps> = ({
  score,
  showLabel = true,
  className,
}) => {
  const clamped = Math.max(0, Math.min(100, score))
  const theme = getRiskTheme(clamped)

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground uppercase tracking-wider">{theme.label}</span>
          <span className="text-slate-100 font-bold tabular-nums">{clamped}/100</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden border border-border">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: theme.color }}
        />
      </div>
    </div>
  )
}

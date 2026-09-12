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
            stroke="#1E293B"
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
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${theme.color}66)`,
            }}
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-2xl font-bold tracking-tight text-slate-50 tabular-nums">
            {clampedScore}
          </span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-2.5 flex flex-col items-center text-center">
          <span
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-widest border',
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

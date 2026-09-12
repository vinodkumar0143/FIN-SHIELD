import React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  hoverGlow?: boolean
  borderColor?: string
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, hoverGlow = true, borderColor, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md border transition-all duration-200',
          elevated
            ? 'bg-[#1F2937] border-[#334155]'
            : 'bg-[#111827] border-[#1E293B]',
          hoverGlow && 'hover:border-cyan-500/50 hover:shadow-[0_0_14px_rgba(6,182,212,0.12)]',
          className
        )}
        style={borderColor ? { borderColor } : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4 pb-2 flex flex-col space-y-1', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-xs font-mono font-medium uppercase tracking-wider text-slate-400', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4 pt-2', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export interface MetricCardProps {
  title: string
  value: string | number
  delta?: string | number
  isPositiveDelta?: boolean
  neutralDelta?: boolean
  deltaLabel?: string
  icon?: React.ReactNode
  badgeText?: string
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
  subValue?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  delta,
  isPositiveDelta = true,
  neutralDelta = false,
  deltaLabel,
  icon,
  badgeText,
  badgeVariant = 'info',
  className,
  subValue,
}) => {
  return (
    <Card className={cn('p-4 relative overflow-hidden group', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium truncate">
          {title}
        </span>
        {icon && (
          <div className="h-7 w-7 rounded bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <span className="text-2xl font-mono font-bold tracking-tight text-slate-50 tabular-nums">
          {value}
        </span>
        {badgeText && (
          <span className={cn(
            'text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wide',
            badgeVariant === 'error' && 'bg-rose-500/15 text-rose-400 border-rose-500/30',
            badgeVariant === 'warning' && 'bg-amber-500/15 text-amber-400 border-amber-500/30',
            badgeVariant === 'success' && 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            badgeVariant === 'info' && 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
            badgeVariant === 'default' && 'bg-slate-800 text-slate-300 border-slate-700'
          )}>
            {badgeText}
          </span>
        )}
      </div>

      {(delta !== undefined || subValue) && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          {delta !== undefined && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-mono font-medium',
                  neutralDelta
                    ? 'text-slate-400'
                    : isPositiveDelta
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                )}
              >
                {neutralDelta ? (
                  <Minus className="h-3 w-3" />
                ) : isPositiveDelta ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {delta}
              </span>
              {deltaLabel && <span className="text-slate-500">{deltaLabel}</span>}
            </div>
          )}
          {subValue && <span className="font-mono text-slate-500">{subValue}</span>}
        </div>
      )}
    </Card>
  )
}

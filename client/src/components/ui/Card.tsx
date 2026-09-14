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
          'rounded-xl border transition-colors duration-150',
          elevated
            ? 'bg-surface-elevated border-border-elevated shadow-panel'
            : 'bg-surface border-border shadow-subtle',
          hoverGlow && 'hover:border-border-elevated',
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
    <h3 ref={ref} className={cn('text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground', className)} {...props} />
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
        <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-muted-foreground truncate">
          {title}
        </span>
        {icon && (
          <div className="h-7 w-7 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-muted-foreground group-hover:text-brand-cyan transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-mono font-bold tracking-tight text-slate-100 tabular-nums">
          {value}
        </span>
        {badgeText && (
          <span className={cn(
            'text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-semibold select-none',
            badgeVariant === 'error' && 'bg-rose-500/10 text-rose-400 border-rose-500/25',
            badgeVariant === 'warning' && 'bg-amber-500/10 text-amber-400 border-amber-500/25',
            badgeVariant === 'success' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
            badgeVariant === 'info' && 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/25',
            badgeVariant === 'default' && 'bg-surface-elevated text-muted-foreground border-border'
          )}>
            {badgeText}
          </span>
        )}
      </div>

      {(delta !== undefined || subValue) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
          {delta !== undefined && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-mono font-medium',
                  neutralDelta
                    ? 'text-muted-foreground'
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
              {deltaLabel && <span className="text-muted-foreground/80">{deltaLabel}</span>}
            </div>
          )}
          {subValue && <span className="font-mono text-muted-foreground/80">{subValue}</span>}
        </div>
      )}
    </Card>
  )
}

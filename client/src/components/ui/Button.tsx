import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 select-none text-xs tracking-wide cursor-pointer font-sans',
  {
    variants: {
      variant: {
        default:
          'bg-brand-cyan text-slate-950 font-semibold hover:bg-brand-cyan-hover active:scale-[0.98] shadow-subtle',
        primary:
          'bg-brand-cyan text-slate-950 font-semibold hover:bg-brand-cyan-hover active:scale-[0.98] shadow-subtle',
        secondary:
          'bg-surface-elevated text-slate-100 border border-border hover:bg-surface-highlight hover:border-border-elevated active:scale-[0.98]',
        outline:
          'border border-border bg-transparent text-slate-200 hover:bg-surface hover:text-slate-100 hover:border-border-elevated active:scale-[0.98]',
        ghost:
          'bg-transparent text-muted-foreground hover:text-slate-100 hover:bg-surface-highlight active:scale-[0.98]',
        danger:
          'bg-rose-600 text-white font-semibold hover:bg-rose-500 active:scale-[0.98]',
        dangerOutline:
          'border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 active:scale-[0.98]',
        cyber:
          'bg-surface-elevated text-brand-cyan border border-brand-cyan/30 hover:bg-surface-highlight hover:border-brand-cyan/50 active:scale-[0.98]',
      },
      size: {
        sm: 'h-7 px-2.5 text-[11px]',
        md: 'h-8.5 px-3.5 text-xs',
        lg: 'h-10 px-5 text-sm',
        icon: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? 'true' : undefined}
        aria-disabled={disabled || isLoading ? 'true' : undefined}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : leftIcon ? (
          <span className="mr-1.5 flex items-center">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon ? (
          <span className="ml-1.5 flex items-center">{rightIcon}</span>
        ) : null}
      </button>
    )
  }
)
Button.displayName = 'Button'

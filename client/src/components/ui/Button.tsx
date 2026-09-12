import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-40 select-none text-xs tracking-wide',
  {
    variants: {
      variant: {
        default:
          'bg-cyan-500 text-[#0B0F19] font-semibold hover:bg-cyan-400 active:scale-[0.98] shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:shadow-[0_0_16px_rgba(6,182,212,0.5)]',
        primary:
          'bg-cyan-500 text-[#0B0F19] font-semibold hover:bg-cyan-400 active:scale-[0.98] shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:shadow-[0_0_16px_rgba(6,182,212,0.5)]',
        secondary:
          'bg-[#111827] text-slate-100 border border-indigo-500/40 hover:bg-indigo-500/15 hover:border-indigo-400 active:scale-[0.98]',
        outline:
          'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98]',
        ghost:
          'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
        danger:
          'bg-rose-600 text-white font-semibold hover:bg-rose-500 active:scale-[0.98] shadow-[0_0_12px_rgba(239,68,68,0.3)]',
        dangerOutline:
          'border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500 active:scale-[0.98]',
        cyber:
          'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 hover:from-cyan-500/30 hover:to-indigo-500/30',
      },
      size: {
        sm: 'h-7 px-2.5 text-[11px]',
        md: 'h-9 px-3.5 text-xs',
        lg: 'h-11 px-5 text-sm',
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

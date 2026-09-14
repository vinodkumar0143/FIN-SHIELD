import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B87C] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 select-none text-xs tracking-wide cursor-pointer font-sans',
  {
    variants: {
      variant: {
        default:
          'bg-[#00B87C] text-[#061120] font-semibold hover:bg-[#009E6A] active:scale-[0.98] shadow-subtle',
        primary:
          'bg-[#00B87C] text-[#061120] font-semibold hover:bg-[#009E6A] active:scale-[0.98] shadow-subtle',
        secondary:
          'bg-[#0B1F3A] text-[#F7F9FC] border border-[#16365C] hover:bg-[#0E274A] hover:border-[#1E4675] active:scale-[0.98]',
        outline:
          'border border-[#16365C] bg-transparent text-[#F7F9FC] hover:bg-[#0B1F3A] hover:text-[#F7F9FC] hover:border-[#1E4675] active:scale-[0.98]',
        ghost:
          'bg-transparent text-muted-foreground hover:text-[#F7F9FC] hover:bg-[#0E274A] active:scale-[0.98]',
        gold:
          'bg-[#D4AF37] text-[#061120] font-semibold hover:bg-[#B8972E] active:scale-[0.98] shadow-subtle',
        danger:
          'bg-rose-600 text-white font-semibold hover:bg-rose-500 active:scale-[0.98]',
        dangerOutline:
          'border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 active:scale-[0.98]',
        cyber:
          'bg-[#0E274A] text-[#00B87C] border border-[#00B87C]/40 hover:bg-[#13335F] hover:border-[#00B87C] active:scale-[0.98]',
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

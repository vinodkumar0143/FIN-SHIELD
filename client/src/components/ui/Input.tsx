import React from 'react'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full rounded-lg bg-surface-subtle border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground transition-colors duration-150 font-sans',
            'focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan',
            'disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-8',
            rightIcon && 'pr-8',
            error && 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground">
            {rightIcon}
          </div>
        )}
        {error && <p className="mt-1 text-[11px] text-rose-400 font-sans">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onClear?: () => void
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, onChange, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          className={cn(
            'w-full rounded-lg bg-surface-subtle border border-border pl-8 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground transition-colors font-sans',
            'focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan',
            className
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground p-1 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          className={cn(
            'w-full rounded-lg bg-surface-subtle border border-border p-2.5 text-xs text-foreground placeholder:text-muted-foreground transition-colors font-sans leading-relaxed',
            'focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-[11px] text-rose-400 font-sans">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

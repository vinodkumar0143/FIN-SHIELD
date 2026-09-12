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
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full rounded bg-[#111827] border border-[#1E293B] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 transition-all duration-150',
            'focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-8',
            rightIcon && 'pr-8',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500">
            {rightIcon}
          </div>
        )}
        {error && <p className="mt-1 text-[11px] text-rose-400 font-medium">{error}</p>}
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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="h-3.5 w-3.5" />
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          className={cn(
            'w-full rounded bg-[#111827] border border-[#1E293B] pl-8 pr-8 py-2 text-xs text-slate-100 placeholder:text-slate-500 transition-all',
            'focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500',
            className
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'

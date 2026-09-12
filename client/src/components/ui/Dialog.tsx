import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Frosted Scrim Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0F19]/85 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Surface (Level 3) */}
      <div
        className={cn(
          'relative w-full rounded-lg bg-[#111827] border border-indigo-500/30 p-6 shadow-command z-50 animate-in fade-in-0 zoom-in-95 duration-150',
          maxWidths[maxWidth],
          className
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {(title || description) && (
          <div className="mb-4 space-y-1 pr-6">
            {title && (
              <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  )
}

import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  side?: 'right' | 'left'
  width?: 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = 'right',
  width = 'lg',
  className,
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

  const widths = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      <div className={cn('fixed inset-y-0 flex max-w-full', side === 'right' ? 'right-0 pl-10' : 'left-0 pr-10')}>
        <div
          className={cn(
            'w-screen bg-surface border-l border-border shadow-2xl flex flex-col',
            widths[width],
            side === 'left' && 'border-r border-l-0',
            className
          )}
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-muted-foreground mt-1 font-sans leading-relaxed">{description}</p>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-slate-100 hover:bg-surface-highlight transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

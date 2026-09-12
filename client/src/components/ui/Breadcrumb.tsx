import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  onItemClick?: (item: BreadcrumbItem) => void
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className, onItemClick }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1.5 text-xs font-mono', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />}
            {isLast || !item.href ? (
              <span
                className={cn(
                  'truncate select-none font-medium',
                  isLast ? 'text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200 cursor-pointer'
                )}
                onClick={() => !isLast && onItemClick?.(item)}
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-slate-400 hover:text-slate-200 transition-colors truncate"
                onClick={(e) => {
                  if (onItemClick) {
                    e.preventDefault()
                    onItemClick(item)
                  }
                }}
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

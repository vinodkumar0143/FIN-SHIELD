import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from './Skeleton'

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
  className?: string
  width?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: string) => void
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onRowClick?: (row: T) => void
  className?: string
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No financial records available in current view.',
  sortBy,
  sortOrder,
  onSort,
  page = 1,
  totalPages = 1,
  onPageChange,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface overflow-hidden flex flex-col shadow-subtle', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className="bg-surface-subtle border-b border-border sticky top-0 z-10 select-none">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    'py-2.5 px-4 font-mono text-[10px] font-semibold tracking-wider uppercase text-muted-foreground whitespace-nowrap',
                    col.sortable && 'cursor-pointer hover:text-slate-200 transition-colors',
                    col.className
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => {
                    if (col.sortable && typeof col.accessor === 'string' && onSort) {
                      onSort(col.accessor as string)
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-muted-foreground/60">
                        {sortBy === col.accessor ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5 text-brand-cyan" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-brand-cyan" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border/40 text-slate-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="h-10">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 px-4 text-center font-mono text-xs text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors duration-100 group h-10',
                    rowIdx % 2 === 1 ? 'bg-surface-subtle/30' : 'bg-surface',
                    'hover:bg-surface-highlight/50',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn('px-4 py-2.5 text-xs font-normal whitespace-nowrap', col.className)}
                    >
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="border-t border-border bg-surface-subtle px-4 py-2 flex items-center justify-between text-xs text-muted-foreground font-mono select-none">
          <span>
            Page <strong className="text-slate-100 font-semibold">{page}</strong> of <strong className="text-slate-100 font-semibold">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1 rounded-md hover:bg-surface-elevated hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none text-muted-foreground transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1 rounded-md hover:bg-surface-elevated hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none text-muted-foreground transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

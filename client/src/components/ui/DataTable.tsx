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
    <div className={cn('rounded-md border border-[#1E293B] bg-[#111827] overflow-hidden flex flex-col', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className="bg-[#0B0F19] border-b border-[#1E293B] sticky top-0 z-10 select-none">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    'py-2.5 px-4 font-mono text-[11px] font-medium tracking-wider uppercase text-slate-400 whitespace-nowrap',
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
                      <span className="text-slate-500">
                        {sortBy === col.accessor ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5 text-cyan-400" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-cyan-400" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 text-slate-600" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="h-10">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-2">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 px-4 text-center font-mono text-xs text-slate-500"
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
                    rowIdx % 2 === 1 ? 'bg-slate-900/30' : 'bg-[#111827]',
                    'hover:bg-cyan-500/[0.04] hover:border-cyan-500/20',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn('px-4 py-2 text-xs font-normal whitespace-nowrap', col.className)}
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
        <div className="border-t border-[#1E293B] bg-[#0B0F19] px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
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

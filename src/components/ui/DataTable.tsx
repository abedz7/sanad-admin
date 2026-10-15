import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { SortKey } from '../../types/api'

type SortField = 'createdAt' | 'lastActivityAt' | 'priority'

export interface Column<T> {
  key: string
  header: string
  /** When set, the header is sortable and emits the contract's sort keys (§6). */
  sortField?: SortField
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  sort?: SortKey
  onSortChange?: (sort: SortKey) => void
  onRowClick?: (row: T) => void
  /** Class setting the row's left accent bar colour (e.g. by status). */
  rowAccent?: (row: T) => string
}

function nextSort(field: SortField, current: SortKey | undefined): SortKey {
  // First click sorts descending (newest/highest first, matching the API default).
  if (current === `-${field}`) return field
  return `-${field}`
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  onRowClick,
  rowAccent,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto border-y border-border bg-surface-0 shadow-elevation-1">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface-2 text-left">
            {columns.map((column) => {
              const sortable = column.sortField !== undefined && onSortChange !== undefined
              const active = column.sortField !== undefined && (sort === column.sortField || sort === `-${column.sortField}`)
              const descending = sort === `-${column.sortField}`
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={active ? (descending ? 'descending' : 'ascending') : undefined}
                  className={cn('px-3 py-2 font-medium text-text-muted', column.className)}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(nextSort(column.sortField!, sort))}
                      className="inline-flex items-center gap-1 rounded-md font-medium hover:text-text"
                    >
                      {column.header}
                      <span aria-hidden="true" className={cn('text-xs', !active && 'invisible')}>
                        {descending ? '▾' : '▴'}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-t border-border border-l-2 border-l-transparent transition-colors duration-120 hover:bg-accent-tint/50',
                onRowClick && 'cursor-pointer',
                rowAccent?.(row),
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('px-3 py-2 text-text', column.className)}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

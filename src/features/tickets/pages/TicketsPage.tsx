import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../../components/states/EmptyState'
import { ErrorState } from '../../../components/states/ErrorState'
import { SkeletonRows } from '../../../components/states/Skeleton'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { Input } from '../../../components/ui/Input'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Pagination } from '../../../components/ui/Pagination'
import { Select } from '../../../components/ui/Select'
import { timeAgo } from '../../../lib/dates'
import { priorityLabels, priorityOrder, statusLabels, statusOrder } from '../../../lib/labels'
import type { Priority, SortKey, Status, TicketListItem } from '../../../types/api'
import { useTickets } from '../hooks'

const SORT_KEYS: SortKey[] = ['createdAt', '-createdAt', 'lastActivityAt', '-lastActivityAt', 'priority', '-priority']
const ALL = 'all'

function parseEnum<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined
}

const columns: Column<TicketListItem>[] = [
  { key: 'title', header: 'Title', render: (t) => <span className="font-medium">{t.title}</span> },
  { key: 'requester', header: 'Requester', render: (t) => t.requester.name },
  { key: 'category', header: 'Category', render: (t) => t.category.name },
  { key: 'priority', header: 'Priority', sortField: 'priority', render: (t) => <Badge priority={t.priority} /> },
  { key: 'status', header: 'Status', render: (t) => <Badge status={t.status} /> },
  { key: 'assignee', header: 'Assignee', render: (t) => t.assignee?.name ?? <span className="text-text-muted">—</span> },
  {
    key: 'lastActivityAt',
    header: 'Last activity',
    sortField: 'lastActivityAt',
    className: 'w-28 tabular-nums',
    render: (t) => timeAgo(t.lastActivityAt),
  },
]

export function TicketsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const status = parseEnum<Status>(searchParams.get('status'), statusOrder)
  const priority = parseEnum<Priority>(searchParams.get('priority'), priorityOrder)
  const sort = parseEnum<SortKey>(searchParams.get('sort'), SORT_KEYS) ?? '-lastActivityAt'
  const q = searchParams.get('q') ?? undefined
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [searchDraft, setSearchDraft] = useState(q ?? '')

  const tickets = useTickets({ status, priority, sort, q, page })

  // Any filter change restarts from page 1.
  const updateParams = (updates: Record<string, string | undefined>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('page')
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '' || value === ALL) next.delete(key)
        else next.set(key, value)
      }
      return next
    })
  }

  const hasFilters = status !== undefined || priority !== undefined || (q !== undefined && q !== '')

  const clearFilters = () => {
    setSearchDraft('')
    setSearchParams({})
  }

  return (
    <>
      <PageHeader title="Tickets" />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select
          aria-label="Filter by status"
          value={status ?? ALL}
          onValueChange={(value) => updateParams({ status: value })}
          options={[
            { value: ALL, label: 'All statuses' },
            ...statusOrder.map((s) => ({ value: s, label: statusLabels[s].label })),
          ]}
        />
        <Select
          aria-label="Filter by priority"
          value={priority ?? ALL}
          onValueChange={(value) => updateParams({ priority: value })}
          options={[
            { value: ALL, label: 'All priorities' },
            ...priorityOrder.map((p) => ({ value: p, label: priorityLabels[p].label })),
          ]}
        />
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            updateParams({ q: searchDraft.trim() || undefined })
          }}
        >
          <Input
            type="search"
            aria-label="Search tickets"
            placeholder="Search title or description"
            className="w-64"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {tickets.isPending && <SkeletonRows />}
      {tickets.isError && <ErrorState error={tickets.error} onRetry={() => void tickets.refetch()} />}
      {tickets.isSuccess &&
        (tickets.data.data.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No tickets match these filters' : 'No tickets yet'}
            description={hasFilters ? 'Try broadening or clearing the filters.' : undefined}
            action={
              hasFilters ? (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={tickets.data.data}
              rowKey={(t) => t.id}
              sort={sort}
              onSortChange={(next) => updateParams({ sort: next })}
              onRowClick={(t) => void navigate(`/tickets/${t.id}`)}
            />
            <Pagination
              meta={tickets.data.meta}
              onPageChange={(nextPage) =>
                setSearchParams((current) => {
                  const next = new URLSearchParams(current)
                  next.set('page', String(nextPage))
                  return next
                })
              }
            />
          </>
        ))}
    </>
  )
}

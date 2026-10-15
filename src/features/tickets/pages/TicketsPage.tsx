import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../../components/states/EmptyState'
import { ErrorState } from '../../../components/states/ErrorState'
import { SkeletonRows } from '../../../components/states/Skeleton'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Pagination } from '../../../components/ui/Pagination'
import { timeAgo } from '../../../lib/dates'
import { priorityOrder, statusOrder } from '../../../lib/labels'
import type { Priority, SortKey, Status, TicketListItem } from '../../../types/api'
import { FilterBar } from '../components/FilterBar'
import { useTickets } from '../hooks'

const SORT_KEYS: SortKey[] = ['createdAt', '-createdAt', 'lastActivityAt', '-lastActivityAt', 'priority', '-priority']
const OBJECT_ID = /^[0-9a-f]{24}$/

/* Left accent bar per row, keyed by status (visual only; labels.ts stays the
   source of truth for badge colours and transitions). */
const statusRowAccent: Record<Status, string> = {
  open: '[border-left-color:var(--status-open)]',
  in_progress: '[border-left-color:var(--status-in-progress)]',
  resolved: '[border-left-color:var(--status-resolved)]',
  closed: '[border-left-color:var(--status-closed)]',
}

function parseEnum<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined
}

function parseObjectId(value: string | null): string | undefined {
  return value !== null && OBJECT_ID.test(value) ? value : undefined
}

const columns: Column<TicketListItem>[] = [
  {
    key: 'title',
    header: 'Title',
    render: (t) => (
      <Link
        to={`/tickets/${t.id}`}
        className="font-medium text-text hover:text-accent"
        onClick={(event) => event.stopPropagation()}
      >
        {t.title}
      </Link>
    ),
  },
  { key: 'requester', header: 'Requester', render: (t) => t.requester.name },
  { key: 'category', header: 'Category', render: (t) => t.category.name },
  { key: 'priority', header: 'Priority', sortField: 'priority', render: (t) => <Badge priority={t.priority} /> },
  { key: 'status', header: 'Status', render: (t) => <Badge status={t.status} /> },
  { key: 'assignee', header: 'Assignee', render: (t) => t.assignee?.name ?? <span className="text-text-muted">—</span> },
  {
    key: 'counts',
    header: 'Replies',
    className: 'w-20',
    render: (t) => (
      <span className="text-xs tabular-nums text-text-muted">
        {t.commentCount} · {t.attachmentCount} files
      </span>
    ),
  },
  {
    key: 'lastActivityAt',
    header: 'Last activity',
    sortField: 'lastActivityAt',
    className: 'w-28 tabular-nums',
    render: (t) => <span title={t.lastActivityAt}>{timeAgo(t.lastActivityAt)}</span>,
  },
]

export function TicketsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const status = parseEnum<Status>(searchParams.get('status'), statusOrder)
  const priority = parseEnum<Priority>(searchParams.get('priority'), priorityOrder)
  const categoryId = parseObjectId(searchParams.get('categoryId'))
  const assigneeId = parseObjectId(searchParams.get('assigneeId'))
  const unassigned = searchParams.get('unassigned') === 'true'
  const sort = parseEnum<SortKey>(searchParams.get('sort'), SORT_KEYS) ?? '-lastActivityAt'
  const q = searchParams.get('q') ?? undefined
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))

  const tickets = useTickets({ status, priority, categoryId, assigneeId, unassigned, sort, q, page, limit })

  // Any filter change restarts from page 1.
  const updateParams = (updates: Record<string, string | undefined>) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('page')
        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined || value === '') next.delete(key)
          else next.set(key, value)
        }
        return next
      },
      { replace: true },
    )
  }

  const hasFilters =
    status !== undefined ||
    priority !== undefined ||
    categoryId !== undefined ||
    assigneeId !== undefined ||
    unassigned ||
    (q !== undefined && q !== '')

  return (
    <>
      <PageHeader title="Tickets" />
      <FilterBar
        status={status}
        priority={priority}
        categoryId={categoryId}
        assigneeId={assigneeId}
        unassigned={unassigned}
        q={q}
        hasFilters={hasFilters}
        onChange={updateParams}
        onClear={() => setSearchParams({}, { replace: true })}
      />

      {tickets.isPending && <SkeletonRows />}
      {tickets.isError && <ErrorState error={tickets.error} onRetry={() => void tickets.refetch()} />}
      {tickets.isSuccess &&
        (tickets.data.data.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No tickets match these filters' : 'No tickets yet'}
            description={hasFilters ? 'Try broadening or clearing the filters.' : 'Tickets are created from the mobile app.'}
            action={
              hasFilters ? (
                <Button variant="secondary" size="sm" onClick={() => setSearchParams({}, { replace: true })}>
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
              rowAccent={(t) => statusRowAccent[t.status]}
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

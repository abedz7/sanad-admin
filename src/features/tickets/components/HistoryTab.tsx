import { EmptyState } from '../../../components/states/EmptyState'
import { ErrorState } from '../../../components/states/ErrorState'
import { Skeleton } from '../../../components/states/Skeleton'
import { formatDateTime } from '../../../lib/dates'
import { priorityLabels, statusLabels } from '../../../lib/labels'
import type { Priority, Status, Ticket, TicketEvent, TicketEventType } from '../../../types/api'
import { useAdminUsers } from '../../users/hooks'
import { useTicketHistory } from '../hooks'

const typeLabels: Record<TicketEventType, string> = {
  created: 'created the ticket',
  status_changed: 'changed the status',
  priority_changed: 'changed the priority',
  assigned: 'changed the assignee',
  updated: 'edited the ticket',
  comment_added: 'added a comment',
  attachment_added: 'added an attachment',
}

export function HistoryTab({ ticket }: { ticket: Ticket }) {
  const history = useTicketHistory(ticket.id)
  // Resolve assignee ids in `changes` to names where we can.
  const admins = useAdminUsers({ role: 'admin' })

  const describeValue = (field: string, value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—'
    if (field === 'status') return statusLabels[value as Status]?.label ?? String(value)
    if (field === 'priority') return priorityLabels[value as Priority]?.label ?? String(value)
    if (field === 'assigneeId') {
      const admin = admins.data?.data.find((a) => a.id === value)
      // Events are immutable facts holding raw ids; an id that no longer
      // resolves belongs to someone who lost the admin role since.
      return admin?.name ?? (admins.isSuccess ? 'former admin' : String(value))
    }
    return String(value)
  }

  const describeChanges = (event: TicketEvent): string[] =>
    Object.entries(event.changes)
      // Ids of created sub-resources say nothing a reader needs.
      .filter(([field]) => field !== 'commentId' && field !== 'attachmentId')
      .map(
        ([field, change]) =>
          `${field === 'assigneeId' ? 'assignee' : field}: ${describeValue(field, change.from)} → ${describeValue(field, change.to)}`,
      )

  if (history.isPending) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (history.isError) {
    return <ErrorState error={history.error} onRetry={() => void history.refetch()} />
  }

  if (history.data.length === 0) {
    return <EmptyState title="No events" description="Every change to this ticket is recorded here." />
  }

  return (
    <ol className="divide-y divide-border border border-border bg-surface-0">
      {history.data.map((event) => (
        <li key={event.id} className="flex items-baseline gap-3 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-base text-text">
              <span className="font-medium">{event.actor.name}</span> {typeLabels[event.type]}
            </p>
            {describeChanges(event).map((line) => (
              <p key={line} className="text-sm text-text-muted">
                {line}
              </p>
            ))}
          </div>
          <span className="shrink-0 text-xs tabular-nums text-text-muted">
            {formatDateTime(event.createdAt)}
          </span>
        </li>
      ))}
    </ol>
  )
}

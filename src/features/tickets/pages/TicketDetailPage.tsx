import { useParams } from 'react-router-dom'
import { ErrorState } from '../../../components/states/ErrorState'
import { Skeleton } from '../../../components/states/Skeleton'
import { Badge } from '../../../components/ui/Badge'
import { Tabs } from '../../../components/ui/Tabs'
import { formatDate } from '../../../lib/dates'
import { useTicket } from '../hooks'

/**
 * Route skeleton: fetches the real ticket and renders header + description.
 * Status/priority controls, assignee picker, conversation, attachments and
 * history arrive in Phase 3b once server Phase 2 lands.
 */
export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const ticket = useTicket(id ?? '')

  if (ticket.isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (ticket.isError) {
    return <ErrorState error={ticket.error} onRetry={() => void ticket.refetch()} />
  }

  const data = ticket.data

  return (
    <>
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-text">{data.title}</h1>
          <Badge status={data.status} />
          <Badge priority={data.priority} />
        </div>
        <p className="mt-1 text-sm text-text-muted">
          {data.category.name} · opened by {data.requester.name} on {formatDate(data.createdAt)} ·{' '}
          {data.assignee ? `assigned to ${data.assignee.name}` : 'unassigned'}
        </p>
      </header>
      <section className="mb-4 border border-border bg-surface-0 p-4">
        <p className="text-base whitespace-pre-wrap text-text">{data.description}</p>
      </section>
      <Tabs
        items={[
          {
            value: 'conversation',
            label: `Conversation (${data.commentCount})`,
            content: <p className="text-sm text-text-muted">Comments land in Phase 3b.</p>,
          },
          {
            value: 'attachments',
            label: `Attachments (${data.attachments.length})`,
            content: <p className="text-sm text-text-muted">Attachment list lands in Phase 3b.</p>,
          },
          {
            value: 'history',
            label: 'History',
            content: <p className="text-sm text-text-muted">Event timeline lands in Phase 3b.</p>,
          },
        ]}
      />
    </>
  )
}

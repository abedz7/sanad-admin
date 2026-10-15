import { Link, useParams } from 'react-router-dom'
import { ErrorState } from '../../../components/states/ErrorState'
import { EmptyState } from '../../../components/states/EmptyState'
import { Skeleton } from '../../../components/states/Skeleton'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Tabs } from '../../../components/ui/Tabs'
import { useToast } from '../../../components/ui/Toast'
import { formatDateTime } from '../../../lib/dates'
import { AssigneeSelect } from '../components/AssigneeSelect'
import { AttachmentsTab } from '../components/AttachmentsTab'
import { CategorySelect } from '../components/CategorySelect'
import { ConversationTab } from '../components/ConversationTab'
import { HistoryTab } from '../components/HistoryTab'
import { PrioritySelect } from '../components/PrioritySelect'
import { StatusControl } from '../components/StatusControl'
import { useTicket } from '../hooks'

function CopyIdButton({ id }: { id: string }) {
  const { toast } = useToast()
  return (
    <button
      type="button"
      aria-label="Copy ticket id"
      title="Copy ticket id"
      className="rounded-md px-1 text-xs text-text-muted hover:bg-surface-2 hover:text-text"
      onClick={() => {
        void navigator.clipboard.writeText(id).then(() => toast('Ticket id copied'))
      }}
    >
      #{id.slice(-6)} ⧉
    </button>
  )
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const ticket = useTicket(id ?? '')

  if (ticket.isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (ticket.isError) {
    if (ticket.error.code === 'NOT_FOUND') {
      return (
        <EmptyState
          title="This ticket is not available"
          description="It may have been removed, or the link is wrong."
          action={
            <Link to="/tickets">
              <Button variant="secondary" size="sm">
                Back to tickets
              </Button>
            </Link>
          }
        />
      )
    }
    return <ErrorState error={ticket.error} onRetry={() => void ticket.refetch()} />
  }

  const data = ticket.data

  return (
    <>
      <header className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-text">{data.title}</h1>
          <Badge status={data.status} />
          <Badge priority={data.priority} />
          <CopyIdButton id={data.id} />
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Opened by <span className="font-medium text-text">{data.requester.name}</span>{' '}
          <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-medium">
            {data.requester.role}
          </span>{' '}
          on {formatDateTime(data.createdAt)} · updated {formatDateTime(data.updatedAt)}
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 border border-border bg-surface-0 p-3 shadow-elevation-1">
        <StatusControl ticket={data} />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-muted">
            Priority
            <PrioritySelect ticket={data} />
          </label>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            Assignee
            <AssigneeSelect ticket={data} />
          </label>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            Category
            <CategorySelect ticket={data} />
          </label>
        </div>
      </div>

      <section className="mb-4 border border-border bg-surface-0 p-4">
        <p className="text-base whitespace-pre-wrap text-text">{data.description}</p>
      </section>

      <Tabs
        items={[
          {
            value: 'conversation',
            label: `Conversation (${data.commentCount})`,
            content: <ConversationTab ticket={data} />,
          },
          {
            value: 'attachments',
            label: `Attachments (${data.attachments.length})`,
            content: <AttachmentsTab ticket={data} />,
          },
          { value: 'history', label: 'History', content: <HistoryTab ticket={data} /> },
        ]}
      />
    </>
  )
}

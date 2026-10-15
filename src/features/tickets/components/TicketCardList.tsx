import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../lib/cn'
import { timeAgo } from '../../../lib/dates'
import type { TicketListItem } from '../../../types/api'

const statusAccent = {
  open: '[border-left-color:var(--status-open)]',
  in_progress: '[border-left-color:var(--status-in-progress)]',
  resolved: '[border-left-color:var(--status-resolved)]',
  closed: '[border-left-color:var(--status-closed)]',
} as const

/** ≤768px replacement for the ticket DataTable — one card per ticket. */
export function TicketCardList({ tickets }: { tickets: TicketListItem[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Link
            to={`/tickets/${ticket.id}`}
            className={cn(
              'block rounded-md border border-border border-l-2 bg-surface-0 p-3 shadow-elevation-1 transition-colors duration-120 hover:bg-accent-tint/50',
              statusAccent[ticket.status],
            )}
          >
            <p className="font-medium text-text">{ticket.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge status={ticket.status} />
              <Badge priority={ticket.priority} />
            </div>
            <p className="mt-1.5 flex items-center justify-between text-sm text-text-muted">
              <span className="truncate">{ticket.requester.name}</span>
              <span className="shrink-0 tabular-nums" title={ticket.lastActivityAt}>
                {timeAgo(ticket.lastActivityAt)}
              </span>
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}

import { Link } from 'react-router-dom'
import { EmptyState } from '../../../components/states/EmptyState'
import { ErrorState } from '../../../components/states/ErrorState'
import { Skeleton } from '../../../components/states/Skeleton'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatHours } from '../../../lib/dates'
import { priorityLabels, priorityOrder, statusLabels, statusOrder } from '../../../lib/labels'
import type { Stats } from '../../../types/api'
import { useAdminUsers } from '../../users/hooks'
import { useStats } from '../hooks'

function StatTiles({ byStatus }: { byStatus: Stats['byStatus'] }) {
  return (
    <div className="grid grid-cols-4 divide-x divide-border border border-border bg-surface-0">
      {statusOrder.map((status) => (
        <Link
          key={status}
          to={`/tickets?status=${status}`}
          className="p-4 hover:bg-surface-2"
          aria-label={`${statusLabels[status].label} tickets`}
        >
          <p className="text-sm text-text-muted">{statusLabels[status].label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-text">{byStatus[status]}</p>
        </Link>
      ))}
    </div>
  )
}

/** Plain divs sized from the numbers — no chart library (docs/DECISIONS.md). */
function PriorityBars({ byPriority }: { byPriority: Stats['byPriority'] }) {
  const max = Math.max(1, ...priorityOrder.map((p) => byPriority[p]))
  return (
    <section className="border border-border bg-surface-0 p-4">
      <h2 className="mb-3 text-sm font-medium text-text-muted">By priority</h2>
      <dl className="flex flex-col gap-2">
        {priorityOrder.map((priority) => (
          <div key={priority} className="grid grid-cols-[72px_1fr_40px] items-center gap-2">
            <dt className="text-sm text-text">{priorityLabels[priority].label}</dt>
            <dd className="h-4 rounded-md bg-surface-2">
              <div
                className={`h-4 rounded-md ${priorityLabels[priority].barClassName}`}
                style={{ width: `${(byPriority[priority] / max) * 100}%` }}
              />
            </dd>
            <dd className="text-right text-sm font-medium tabular-nums text-text">
              {byPriority[priority]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function OpenAge({ openAge, createdLast7Days }: Pick<Stats, 'openAge' | 'createdLast7Days'>) {
  return (
    <section className="border border-border bg-surface-0 p-4">
      <h2 className="mb-3 text-sm font-medium text-text-muted">Open age</h2>
      <dl className="flex flex-col gap-2 text-base text-text">
        <div className="flex justify-between">
          <dt>Open or in progress</dt>
          <dd className="font-medium tabular-nums">{openAge.count}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Average age</dt>
          <dd className="font-medium tabular-nums">{formatHours(openAge.averageHours)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Oldest</dt>
          <dd className="font-medium tabular-nums">
            {openAge.oldestTicketId ? (
              <Link to={`/tickets/${openAge.oldestTicketId}`} className="text-accent hover:text-accent-strong">
                {formatHours(openAge.maxHours)}
              </Link>
            ) : (
              formatHours(openAge.maxHours)
            )}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <dt>Created in the last 7 days</dt>
          <dd className="font-medium tabular-nums">{createdLast7Days}</dd>
        </div>
      </dl>
    </section>
  )
}

function StatsSection() {
  const stats = useStats()

  if (stats.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 divide-x divide-border border border-border bg-surface-0">
          {statusOrder.map((status) => (
            <div key={status} className="p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-2 h-7 w-12" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((panel) => (
            <div key={panel} className="border border-border bg-surface-0 p-4">
              <Skeleton className="mb-3 h-4 w-24" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-3/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (stats.isError) {
    return <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />
  }

  if (stats.data.total === 0) {
    return (
      <EmptyState
        title="No tickets yet"
        description="Stats appear as soon as the first ticket is created from the mobile app."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <StatTiles byStatus={stats.data.byStatus} />
      <div className="grid grid-cols-2 gap-4">
        <PriorityBars byPriority={stats.data.byPriority} />
        <OpenAge openAge={stats.data.openAge} createdLast7Days={stats.data.createdLast7Days} />
      </div>
    </div>
  )
}

/** Live before server Phase 2; also the roster behind the assignee picker. */
function TeamPanel() {
  const admins = useAdminUsers({ role: 'admin' })

  return (
    <section className="border border-border bg-surface-0 p-4">
      <h2 className="mb-3 text-sm font-medium text-text-muted">Team</h2>
      {admins.isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      )}
      {admins.isError && <ErrorState error={admins.error} onRetry={() => void admins.refetch()} />}
      {admins.isSuccess && (
        <ul className="flex flex-col gap-2">
          {admins.data.data.map((admin) => (
            <li key={admin.id} className="flex items-baseline justify-between gap-4">
              <span className="truncate text-base text-text">{admin.name}</span>
              <span className="truncate text-sm text-text-muted">{admin.email}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Ticket volume and team at a glance" />
      <div className="flex flex-col gap-4">
        <StatsSection />
        <TeamPanel />
      </div>
    </>
  )
}

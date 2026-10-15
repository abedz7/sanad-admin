import { ErrorState } from '../../../components/states/ErrorState'
import { Skeleton } from '../../../components/states/Skeleton'
import { PageHeader } from '../../../components/ui/PageHeader'
import { priorityLabels, priorityOrder, statusLabels, statusOrder } from '../../../lib/labels'
import { useAdminUsers } from '../../users/hooks'
import { useStats } from '../hooks'

function StatsSection() {
  const stats = useStats()

  if (stats.isPending) {
    return (
      <div className="grid grid-cols-4 divide-x divide-border border border-border bg-surface-0">
        {statusOrder.map((status) => (
          <div key={status} className="p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-7 w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (stats.isError) {
    return <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />
  }

  const { byStatus, byPriority, openAge, createdLast7Days, total } = stats.data

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 divide-x divide-border border border-border bg-surface-0">
        {statusOrder.map((status) => (
          <div key={status} className="p-4">
            <p className="text-sm text-text-muted">{statusLabels[status].label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-text">{byStatus[status]}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <section className="border border-border bg-surface-0 p-4">
          <h2 className="mb-3 text-sm font-medium text-text-muted">By priority</h2>
          <dl className="flex flex-col gap-2">
            {priorityOrder.map((priority) => (
              <div key={priority} className="flex items-center justify-between">
                <dt className="text-base text-text">{priorityLabels[priority].label}</dt>
                <dd className="text-base font-medium tabular-nums text-text">{byPriority[priority]}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="border border-border bg-surface-0 p-4">
          <h2 className="mb-3 text-sm font-medium text-text-muted">Open tickets age</h2>
          <dl className="flex flex-col gap-2 text-base text-text">
            <div className="flex justify-between">
              <dt>Open or in progress</dt>
              <dd className="font-medium tabular-nums">{openAge.count}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Average age</dt>
              <dd className="font-medium tabular-nums">{openAge.averageHours.toFixed(1)}h</dd>
            </div>
            <div className="flex justify-between">
              <dt>Oldest</dt>
              <dd className="font-medium tabular-nums">{openAge.maxHours.toFixed(1)}h</dd>
            </div>
            <div className="flex justify-between">
              <dt>Created last 7 days</dt>
              <dd className="font-medium tabular-nums">{createdLast7Days}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt>Total tickets</dt>
              <dd className="font-medium tabular-nums">{total}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}

/** The one data path that is live before server Phase 2. */
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

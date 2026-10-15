import { EmptyState } from '../../../components/states/EmptyState'
import { ErrorState } from '../../../components/states/ErrorState'
import { SkeletonRows } from '../../../components/states/Skeleton'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatDate } from '../../../lib/dates'
import type { AdminCategory } from '../../../types/api'
import { useAdminCategories } from '../hooks'

const columns: Column<AdminCategory>[] = [
  { key: 'name', header: 'Name', render: (c) => <span className="font-medium">{c.name}</span> },
  {
    key: 'description',
    header: 'Description',
    render: (c) => c.description ?? <span className="text-text-muted">—</span>,
  },
  { key: 'ticketCount', header: 'Tickets', className: 'w-20 tabular-nums', render: (c) => c.ticketCount },
  { key: 'createdAt', header: 'Created', className: 'w-28', render: (c) => formatDate(c.createdAt) },
]

/** Inline create/edit/delete arrive in Phase 3b once server Phase 2 lands. */
export function CategoriesPage() {
  const categories = useAdminCategories()

  return (
    <>
      <PageHeader title="Categories" />
      {categories.isPending && <SkeletonRows rows={5} />}
      {categories.isError && (
        <ErrorState error={categories.error} onRetry={() => void categories.refetch()} />
      )}
      {categories.isSuccess &&
        (categories.data.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Categories group tickets by topic. Create the first one once editing lands."
          />
        ) : (
          <DataTable columns={columns} rows={categories.data} rowKey={(c) => c.id} />
        ))}
    </>
  )
}

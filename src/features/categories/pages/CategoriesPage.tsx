import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../../components/states/EmptyState'
import { ErrorState } from '../../../components/states/ErrorState'
import { SkeletonRows } from '../../../components/states/Skeleton'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { Dialog } from '../../../components/ui/Dialog'
import { PageHeader } from '../../../components/ui/PageHeader'
import { useToast } from '../../../components/ui/Toast'
import { cn } from '../../../lib/cn'
import { formatDate } from '../../../lib/dates'
import type { AdminCategory } from '../../../types/api'
import { CategoryFormDialog } from '../components/CategoryFormDialog'
import { useAdminCategories, useDeleteCategory } from '../hooks'

export function CategoriesPage() {
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const includeDeleted = searchParams.get('includeDeleted') === 'true'
  const categories = useAdminCategories(includeDeleted)
  const deleteMutation = useDeleteCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCategory | undefined>(undefined)
  const [deleting, setDeleting] = useState<AdminCategory | undefined>(undefined)

  const openCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const openEdit = (category: AdminCategory) => {
    setEditing(category)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!deleting) return
    const target = deleting
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        toast(`Category “${target.name}” deleted`)
        setDeleting(undefined)
      },
      onError: (error) => {
        setDeleting(undefined)
        if (error.code === 'CATEGORY_IN_USE') {
          toast(`In use by ${target.ticketCount} tickets — cannot delete`, 'error')
        } else {
          toast(error.message, 'error')
        }
      },
    })
  }

  const columns: Column<AdminCategory>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (c) => (
        <span className={cn('font-medium', c.deletedAt !== null && 'text-text-muted line-through')}>
          {c.name}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (c) => c.description ?? <span className="text-text-muted">—</span>,
    },
    { key: 'ticketCount', header: 'Tickets', className: 'w-20 tabular-nums', render: (c) => c.ticketCount },
    {
      key: 'createdAt',
      header: 'Created',
      className: 'w-28',
      render: (c) =>
        c.deletedAt !== null ? (
          <span className="text-xs text-text-muted">deleted {formatDate(c.deletedAt)}</span>
        ) : (
          formatDate(c.createdAt)
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-36 text-right',
      render: (c) =>
        c.deletedAt === null ? (
          <span className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleting(c)}>
              Delete
            </Button>
          </span>
        ) : null,
    },
  ]

  return (
    <>
      <PageHeader
        title="Categories"
        action={<Button onClick={openCreate}>New category</Button>}
      />
      <div className="mb-3">
        <label className="flex w-fit items-center gap-1.5 text-sm text-text">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(event) =>
              setSearchParams(event.target.checked ? { includeDeleted: 'true' } : {}, { replace: true })
            }
            className="size-4 accent-(--accent)"
          />
          Show deleted
        </label>
      </div>

      {categories.isPending && <SkeletonRows rows={5} />}
      {categories.isError && (
        <ErrorState error={categories.error} onRetry={() => void categories.refetch()} />
      )}
      {categories.isSuccess &&
        (categories.data.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Categories group tickets by topic — create the first one."
            action={
              <Button size="sm" onClick={openCreate}>
                New category
              </Button>
            }
          />
        ) : (
          <DataTable columns={columns} rows={categories.data} rowKey={(c) => c.id} />
        ))}

      <CategoryFormDialog
        // Remount per target so the form never carries values across.
        key={editing?.id ?? 'create'}
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
      />

      <Dialog
        open={deleting !== undefined}
        onOpenChange={(next) => {
          if (!next) setDeleting(undefined)
        }}
        title="Delete this category?"
        description="Categories referenced by any ticket cannot be deleted. Deletion is a soft delete — old tickets keep the name."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(undefined)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteMutation.isPending} onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-base text-text">
          “{deleting?.name}” {deleting && deleting.ticketCount > 0 && `is used by ${deleting.ticketCount} tickets.`}
        </p>
      </Dialog>
    </>
  )
}

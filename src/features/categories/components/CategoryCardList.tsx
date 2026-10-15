import { Button } from '../../../components/ui/Button'
import { cn } from '../../../lib/cn'
import { formatDate } from '../../../lib/dates'
import type { AdminCategory } from '../../../types/api'

interface CategoryCardListProps {
  categories: AdminCategory[]
  onEdit: (category: AdminCategory) => void
  onDelete: (category: AdminCategory) => void
}

/** ≤768px replacement for the categories DataTable — one card per category. */
export function CategoryCardList({ categories, onEdit, onDelete }: CategoryCardListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {categories.map((category) => (
        <li
          key={category.id}
          className="rounded-md border border-border bg-surface-0 p-3 shadow-elevation-1"
        >
          <div className="flex items-start justify-between gap-2">
            <p className={cn('font-medium text-text', category.deletedAt !== null && 'text-text-muted line-through')}>
              {category.name}
            </p>
            <span className="shrink-0 text-xs tabular-nums text-text-muted">
              {category.ticketCount} tickets
            </span>
          </div>
          {category.description && (
            <p className="mt-1 text-sm text-text-muted">{category.description}</p>
          )}
          <p className="mt-1 text-xs text-text-muted">
            {category.deletedAt !== null
              ? `deleted ${formatDate(category.deletedAt)}`
              : `created ${formatDate(category.createdAt)}`}
          </p>
          {category.deletedAt === null && (
            <div className="mt-2 flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(category)}>
                Delete
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

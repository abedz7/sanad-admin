import { Select } from '../../../components/ui/Select'
import { useToast } from '../../../components/ui/Toast'
import type { Ticket } from '../../../types/api'
import { useCategories } from '../../categories/hooks'
import { useUpdateTicket } from '../hooks'

export function CategorySelect({ ticket }: { ticket: Ticket }) {
  const { toast } = useToast()
  const categories = useCategories()
  const mutation = useUpdateTicket(ticket.id)

  // A deleted category can still be the ticket's current one — keep it visible.
  const options = (categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))
  if (!options.some((o) => o.value === ticket.category.id)) {
    options.unshift({ value: ticket.category.id, label: `${ticket.category.name} (deleted)` })
  }

  return (
    <Select
      aria-label="Category"
      value={ticket.category.id}
      disabled={!categories.isSuccess || mutation.isPending || ticket.status === 'closed'}
      onValueChange={(value) =>
        mutation.mutate(
          { categoryId: value },
          {
            onSuccess: () => toast('Category updated'),
            onError: (error) => toast(error.message, 'error'),
          },
        )
      }
      options={options}
    />
  )
}

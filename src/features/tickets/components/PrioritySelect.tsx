import { Select } from '../../../components/ui/Select'
import { useToast } from '../../../components/ui/Toast'
import { priorityLabels, priorityOrder } from '../../../lib/labels'
import type { Priority, Ticket } from '../../../types/api'
import { useUpdateTicket } from '../hooks'

export function PrioritySelect({ ticket }: { ticket: Ticket }) {
  const { toast } = useToast()
  const mutation = useUpdateTicket(ticket.id)

  return (
    <Select
      aria-label="Priority"
      value={ticket.priority}
      disabled={mutation.isPending || ticket.status === 'closed'}
      onValueChange={(value) =>
        mutation.mutate(
          { priority: value as Priority },
          {
            onSuccess: () => toast('Priority updated'),
            onError: (error) => toast(error.message, 'error'),
          },
        )
      }
      options={priorityOrder.map((p) => ({ value: p, label: priorityLabels[p].label }))}
    />
  )
}

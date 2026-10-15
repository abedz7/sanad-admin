import { Select } from '../../../components/ui/Select'
import { useToast } from '../../../components/ui/Toast'
import type { Ticket } from '../../../types/api'
import { useAdminUsers } from '../../users/hooks'
import { useUpdateTicket } from '../hooks'

const UNASSIGNED = 'unassigned'

export function AssigneeSelect({ ticket }: { ticket: Ticket }) {
  const { toast } = useToast()
  const admins = useAdminUsers({ role: 'admin' })
  const mutation = useUpdateTicket(ticket.id)

  return (
    <Select
      aria-label="Assignee"
      value={ticket.assignee?.id ?? UNASSIGNED}
      disabled={!admins.isSuccess || mutation.isPending || ticket.status === 'closed'}
      onValueChange={(value) =>
        mutation.mutate(
          { assigneeId: value === UNASSIGNED ? null : value },
          {
            onSuccess: () => toast('Assignee updated'),
            onError: (error) => toast(error.message, 'error'),
          },
        )
      }
      options={[
        { value: UNASSIGNED, label: 'Unassigned' },
        ...(admins.data?.data ?? []).map((admin) => ({ value: admin.id, label: admin.name })),
      ]}
    />
  )
}

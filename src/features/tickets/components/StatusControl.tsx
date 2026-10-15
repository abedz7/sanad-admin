import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { useToast } from '../../../components/ui/Toast'
import { allowedAdminTransitions } from '../../../lib/labels'
import type { Status, Ticket } from '../../../types/api'
import { useChangeTicketStatus } from '../hooks'

/**
 * Offers only the transitions the contract allows an admin from the current
 * status (§5) — the server still decides, and a 409 is surfaced, not swallowed.
 */
export function StatusControl({ ticket }: { ticket: Ticket }) {
  const { toast } = useToast()
  const mutation = useChangeTicketStatus(ticket.id)
  const [confirmClose, setConfirmClose] = useState(false)

  const apply = (status: Status) => {
    mutation.mutate(status, {
      onSuccess: () => toast('Status updated'),
      onError: (error) => toast(error.message, 'error'),
    })
  }

  return (
    <div className="flex items-center gap-2">
      {allowedAdminTransitions(ticket.status).map((transition) => (
        <Button
          key={transition.to}
          variant={transition.to === 'closed' ? 'danger' : 'secondary'}
          size="sm"
          loading={mutation.isPending && mutation.variables === transition.to}
          disabled={mutation.isPending}
          onClick={() =>
            transition.to === 'closed' ? setConfirmClose(true) : apply(transition.to)
          }
        >
          {transition.label}
        </Button>
      ))}
      <Dialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title="Close this ticket?"
        description="Comments, attachments and edits are blocked while a ticket is closed. The requester can reopen it within 7 days."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmClose(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmClose(false)
                apply('closed')
              }}
            >
              Close ticket
            </Button>
          </>
        }
      >
        <p className="text-base text-text">“{ticket.title}” will be closed.</p>
      </Dialog>
    </div>
  )
}

import { useState } from 'react'
import { EmptyState } from '../../../components/states/EmptyState'
import { Button } from '../../../components/ui/Button'
import { useToast } from '../../../components/ui/Toast'
import { formatBytes, formatDateTime } from '../../../lib/dates'
import { toApiError } from '../../../lib/api'
import type { Ticket } from '../../../types/api'
import { downloadAttachment } from '../api'

export function AttachmentsTab({ ticket }: { ticket: Ticket }) {
  const { toast } = useToast()
  const [downloading, setDownloading] = useState<string | null>(null)

  if (ticket.attachments.length === 0) {
    return (
      <EmptyState
        title="No attachments"
        description="Files the requester uploads from the mobile app appear here."
      />
    )
  }

  const download = async (attachmentId: string) => {
    const attachment = ticket.attachments.find((a) => a.id === attachmentId)
    if (!attachment) return
    setDownloading(attachmentId)
    try {
      await downloadAttachment(ticket.id, attachment)
    } catch (error) {
      toast(toApiError(error).message, 'error')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <ul className="divide-y divide-border border border-border bg-surface-0">
      {ticket.attachments.map((attachment) => (
        <li key={attachment.id} className="flex items-center gap-4 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium text-text">{attachment.originalName}</p>
            <p className="text-xs text-text-muted">
              {attachment.mimeType} · {formatBytes(attachment.size)} · uploaded by{' '}
              {attachment.uploadedBy.name} · {formatDateTime(attachment.createdAt)}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            loading={downloading === attachment.id}
            onClick={() => void download(attachment.id)}
          >
            Download
          </Button>
        </li>
      ))}
    </ul>
  )
}

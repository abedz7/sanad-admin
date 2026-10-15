import { useState, type FormEvent } from 'react'
import { EmptyState } from '../../../components/states/EmptyState'
import { ErrorState } from '../../../components/states/ErrorState'
import { Skeleton } from '../../../components/states/Skeleton'
import { Button } from '../../../components/ui/Button'
import { Pagination } from '../../../components/ui/Pagination'
import { Textarea } from '../../../components/ui/Textarea'
import { useToast } from '../../../components/ui/Toast'
import { cn } from '../../../lib/cn'
import { formatDateTime } from '../../../lib/dates'
import type { Ticket } from '../../../types/api'
import { useAddComment, useTicketComments } from '../hooks'

function RoleChip({ role }: { role: string }) {
  return (
    <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-text-muted">
      {role}
    </span>
  )
}

export function ConversationTab({ ticket }: { ticket: Ticket }) {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const comments = useTicketComments(ticket.id, page)
  const addComment = useAddComment(ticket.id)
  const [body, setBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const closed = ticket.status === 'closed'

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    addComment.mutate(
      { body: trimmed, isInternal },
      {
        onSuccess: () => {
          setBody('')
          setIsInternal(false)
        },
        onError: (error) => toast(error.message, 'error'),
      },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.isPending && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}
      {comments.isError && (
        <ErrorState error={comments.error} onRetry={() => void comments.refetch()} />
      )}
      {comments.isSuccess &&
        (comments.data.data.length === 0 ? (
          <EmptyState title="No comments yet" description="Replies and internal notes appear here, oldest first." />
        ) : (
          <>
            <ol className="flex flex-col gap-2">
              {comments.data.data.map((comment) => (
                <li
                  key={comment.id}
                  className={cn(
                    'rounded-md border border-border p-3',
                    comment.isInternal ? 'bg-surface-2' : 'bg-surface-0',
                  )}
                >
                  <div className="mb-1 flex items-center gap-2 text-sm">
                    <span className="font-medium text-text">{comment.author.name}</span>
                    <RoleChip role={comment.author.role} />
                    {comment.isInternal && (
                      <span className="rounded-md bg-accent-tint px-1.5 py-0.5 text-xs font-medium text-accent">
                        Internal note
                      </span>
                    )}
                    <span className="ml-auto text-xs text-text-muted">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-base whitespace-pre-wrap text-text">{comment.body}</p>
                </li>
              ))}
            </ol>
            <Pagination meta={comments.data.meta} onPageChange={setPage} />
          </>
        ))}

      <form onSubmit={submit} className="flex flex-col gap-2 border-t border-border pt-4">
        <label htmlFor="comment-body" className="text-sm font-medium text-text">
          Reply
        </label>
        <Textarea
          id="comment-body"
          value={body}
          maxLength={2000}
          placeholder={closed ? 'This ticket is closed' : 'Write a reply…'}
          disabled={closed || addComment.isPending}
          onChange={(event) => setBody(event.target.value)}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-sm text-text">
            <input
              type="checkbox"
              checked={isInternal}
              disabled={closed || addComment.isPending}
              onChange={(event) => setIsInternal(event.target.checked)}
              className="size-4 accent-(--accent)"
            />
            Internal note (not visible to the requester)
          </label>
          <Button type="submit" loading={addComment.isPending} disabled={closed || body.trim() === ''}>
            {isInternal ? 'Add note' : 'Reply'}
          </Button>
        </div>
      </form>
    </div>
  )
}

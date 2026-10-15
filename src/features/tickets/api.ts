import { api } from '../../lib/api'
import type {
  Attachment,
  Comment,
  Paginated,
  Priority,
  SortKey,
  Status,
  Ticket,
  TicketEvent,
  TicketListItem,
} from '../../types/api'

export interface TicketListParams {
  page?: number
  limit?: number
  sort?: SortKey
  status?: Status
  priority?: Priority
  categoryId?: string
  assigneeId?: string
  unassigned?: boolean
  q?: string
}

export async function listTickets(params: TicketListParams): Promise<Paginated<TicketListItem>> {
  // The API rejects unknown/empty keys, so only send what is set;
  // `unassigned` is only ever sent as the literal `true`.
  const query = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== false),
  )
  const res = await api.get<Paginated<TicketListItem>>('/admin/tickets', { params: query })
  return res.data
}

export async function getTicket(id: string): Promise<Ticket> {
  const res = await api.get<{ data: Ticket }>(`/admin/tickets/${id}`)
  return res.data.data
}

export async function changeTicketStatus(id: string, status: Status): Promise<Ticket> {
  const res = await api.post<{ data: Ticket }>(`/admin/tickets/${id}/status`, { status })
  return res.data.data
}

export interface TicketPatch {
  priority?: Priority
  assigneeId?: string | null
  categoryId?: string
}

export async function updateTicket(id: string, patch: TicketPatch): Promise<Ticket> {
  const res = await api.patch<{ data: Ticket }>(`/admin/tickets/${id}`, patch)
  return res.data.data
}

export async function listComments(id: string, page: number): Promise<Paginated<Comment>> {
  const res = await api.get<Paginated<Comment>>(`/admin/tickets/${id}/comments`, {
    params: { page, limit: 50 },
  })
  return res.data
}

export async function addComment(
  id: string,
  input: { body: string; isInternal: boolean },
): Promise<Comment> {
  const res = await api.post<{ data: Comment }>(`/admin/tickets/${id}/comments`, input)
  return res.data.data
}

export async function listHistory(id: string): Promise<TicketEvent[]> {
  const res = await api.get<{ data: TicketEvent[] }>(`/admin/tickets/${id}/history`)
  return res.data.data
}

/**
 * Authenticated download: fetch bytes through the api client (bearer token),
 * hand them to the browser via a short-lived object URL. Never a plain
 * `<a href>` to the API — that would bypass the Authorization header.
 */
export async function downloadAttachment(ticketId: string, attachment: Attachment): Promise<void> {
  const res = await api.get<Blob>(
    `/admin/tickets/${ticketId}/attachments/${attachment.id}/download`,
    { responseType: 'blob' },
  )
  const url = URL.createObjectURL(res.data)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = attachment.originalName
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}

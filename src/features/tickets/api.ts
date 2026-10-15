import { api } from '../../lib/api'
import type { Paginated, Priority, SortKey, Status, Ticket, TicketListItem } from '../../types/api'

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

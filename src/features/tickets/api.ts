import { api } from '../../lib/api'
import type { Paginated, Priority, SortKey, Status, Ticket, TicketListItem } from '../../types/api'

export interface TicketListParams {
  page?: number
  limit?: number
  sort?: SortKey
  status?: Status
  priority?: Priority
  q?: string
}

export async function listTickets(params: TicketListParams): Promise<Paginated<TicketListItem>> {
  const res = await api.get<Paginated<TicketListItem>>('/admin/tickets', { params })
  return res.data
}

export async function getTicket(id: string): Promise<Ticket> {
  const res = await api.get<{ data: Ticket }>(`/admin/tickets/${id}`)
  return res.data.data
}

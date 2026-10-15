import { useQuery } from '@tanstack/react-query'
import type { ApiError, Paginated, Ticket, TicketListItem } from '../../types/api'
import { getTicket, listTickets, type TicketListParams } from './api'

export function useTickets(params: TicketListParams) {
  return useQuery<Paginated<TicketListItem>, ApiError>({
    queryKey: ['admin', 'tickets', params],
    queryFn: () => listTickets(params),
  })
}

export function useTicket(id: string) {
  return useQuery<Ticket, ApiError>({
    queryKey: ['admin', 'tickets', id],
    queryFn: () => getTicket(id),
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ApiError,
  Comment,
  Paginated,
  Status,
  Ticket,
  TicketEvent,
  TicketListItem,
} from '../../types/api'
import {
  addComment,
  changeTicketStatus,
  getTicket,
  listComments,
  listHistory,
  listTickets,
  updateTicket,
  type TicketListParams,
  type TicketPatch,
} from './api'

export function useTickets(params: TicketListParams) {
  return useQuery<Paginated<TicketListItem>, ApiError>({
    queryKey: ['admin', 'tickets', 'list', params],
    queryFn: () => listTickets(params),
  })
}

export function useTicket(id: string) {
  return useQuery<Ticket, ApiError>({
    queryKey: ['admin', 'tickets', id],
    queryFn: () => getTicket(id),
  })
}

export function useTicketComments(id: string, page: number) {
  return useQuery<Paginated<Comment>, ApiError>({
    queryKey: ['admin', 'tickets', id, 'comments', page],
    queryFn: () => listComments(id, page),
  })
}

export function useTicketHistory(id: string) {
  return useQuery<TicketEvent[], ApiError>({
    queryKey: ['admin', 'tickets', id, 'history'],
    queryFn: () => listHistory(id),
  })
}

/** Every ticket mutation touches the detail, its tabs, the list and the stats. */
function useInvalidateTicketData() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }
}

export function useChangeTicketStatus(id: string) {
  const invalidate = useInvalidateTicketData()
  return useMutation<Ticket, ApiError, Status>({
    mutationFn: (status) => changeTicketStatus(id, status),
    // Invalidate on error too: a 409 means our view of the status is stale.
    onSettled: invalidate,
  })
}

export function useUpdateTicket(id: string) {
  const invalidate = useInvalidateTicketData()
  return useMutation<Ticket, ApiError, TicketPatch>({
    mutationFn: (patch) => updateTicket(id, patch),
    onSettled: invalidate,
  })
}

export function useAddComment(id: string) {
  const invalidate = useInvalidateTicketData()
  return useMutation<Comment, ApiError, { body: string; isInternal: boolean }>({
    mutationFn: (input) => addComment(id, input),
    onSuccess: invalidate,
  })
}

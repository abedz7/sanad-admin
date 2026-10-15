import { useQuery } from '@tanstack/react-query'
import type { ApiError, Paginated, User } from '../../types/api'
import { listUsers, type UserListParams } from './api'

/** Live today; also feeds the future assignee picker on the ticket detail screen. */
export function useAdminUsers(params: UserListParams) {
  return useQuery<Paginated<User>, ApiError>({
    queryKey: ['admin', 'users', params],
    queryFn: () => listUsers(params),
  })
}

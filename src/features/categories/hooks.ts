import { useQuery } from '@tanstack/react-query'
import type { AdminCategory, ApiError } from '../../types/api'
import { listAdminCategories } from './api'

export function useAdminCategories(includeDeleted = false) {
  return useQuery<AdminCategory[], ApiError>({
    queryKey: ['admin', 'categories', { includeDeleted }],
    queryFn: () => listAdminCategories(includeDeleted),
  })
}

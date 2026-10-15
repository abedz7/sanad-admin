import { useQuery } from '@tanstack/react-query'
import type { AdminCategory, ApiError, Category } from '../../types/api'
import { listAdminCategories, listCategories } from './api'

export function useCategories() {
  return useQuery<Category[], ApiError>({
    queryKey: ['categories'],
    queryFn: listCategories,
  })
}

export function useAdminCategories(includeDeleted = false) {
  return useQuery<AdminCategory[], ApiError>({
    queryKey: ['admin', 'categories', { includeDeleted }],
    queryFn: () => listAdminCategories(includeDeleted),
  })
}

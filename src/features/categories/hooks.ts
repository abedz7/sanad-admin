import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AdminCategory, ApiError, Category } from '../../types/api'
import {
  createCategory,
  deleteCategory,
  listAdminCategories,
  listCategories,
  updateCategory,
  type CategoryInput,
} from './api'

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

/** Category mutations affect both category lists and category names on tickets. */
function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['categories'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
  }
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation<Category, ApiError, CategoryInput>({
    mutationFn: createCategory,
    onSuccess: invalidate,
  })
}

export function useUpdateCategory(id: string) {
  const invalidate = useInvalidateCategories()
  return useMutation<Category, ApiError, CategoryInput>({
    mutationFn: (input) => updateCategory(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation<void, ApiError, string>({
    mutationFn: deleteCategory,
    onSuccess: invalidate,
  })
}

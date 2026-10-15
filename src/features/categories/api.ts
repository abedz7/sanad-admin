import { api } from '../../lib/api'
import type { AdminCategory, Category } from '../../types/api'

/** Active categories (user route) — used by filter dropdowns and pickers. */
export async function listCategories(): Promise<Category[]> {
  const res = await api.get<{ data: Category[] }>('/categories')
  return res.data.data
}

export async function listAdminCategories(includeDeleted = false): Promise<AdminCategory[]> {
  const res = await api.get<{ data: AdminCategory[] }>('/admin/categories', {
    params: includeDeleted ? { includeDeleted: true } : undefined,
  })
  return res.data.data
}

export interface CategoryInput {
  name: string
  description?: string
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const res = await api.post<{ data: Category }>('/admin/categories', input)
  return res.data.data
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  const res = await api.patch<{ data: Category }>(`/admin/categories/${id}`, input)
  return res.data.data
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/admin/categories/${id}`)
}

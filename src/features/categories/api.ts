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

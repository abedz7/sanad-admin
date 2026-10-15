import { api } from '../../lib/api'
import type { AdminCategory } from '../../types/api'

export async function listAdminCategories(includeDeleted = false): Promise<AdminCategory[]> {
  const res = await api.get<{ data: AdminCategory[] }>('/admin/categories', {
    params: includeDeleted ? { includeDeleted: true } : undefined,
  })
  return res.data.data
}

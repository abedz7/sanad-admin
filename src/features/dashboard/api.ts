import { api } from '../../lib/api'
import type { Stats } from '../../types/api'

export async function getStats(): Promise<Stats> {
  const res = await api.get<{ data: Stats }>('/admin/stats')
  return res.data.data
}

import { api } from '../../lib/api'
import type { Paginated, Role, User } from '../../types/api'

export interface UserListParams {
  role?: Role
  page?: number
  limit?: number
}

export async function listUsers(params: UserListParams): Promise<Paginated<User>> {
  const res = await api.get<Paginated<User>>('/admin/users', { params })
  return res.data
}

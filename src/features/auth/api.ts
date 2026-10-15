import { api } from '../../lib/api'
import type { User } from '../../types/api'

interface LoginInput {
  email: string
  password: string
}

interface LoginResult {
  user: User
  accessToken: string
}

/** Web login: refresh token arrives only as the httpOnly cookie. */
export async function login(input: LoginInput): Promise<LoginResult> {
  const res = await api.post<{ data: LoginResult }>('/auth/login', { ...input, client: 'web' })
  return res.data.data
}

/** Revokes the cookie's whole token family server-side. Idempotent. */
export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function me(): Promise<User> {
  const res = await api.get<{ data: User }>('/auth/me')
  return res.data.data
}

/** Contract 1.3.0: only the display name is editable; email is the login identity. */
export async function updateMe(input: { name: string }): Promise<User> {
  const res = await api.patch<{ data: User }>('/auth/me', input)
  return res.data.data
}

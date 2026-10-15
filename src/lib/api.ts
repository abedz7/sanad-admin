import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '../types/api'
import { queryClient } from './queryClient'

/**
 * Axios client for the Sanad API.
 *
 * - baseURL is `/api/v1` — same-origin through the Vite proxy, so the httpOnly
 *   refresh cookie (`sanad_rt`) flows without CORS.
 * - The access token lives only in a module-level variable (never Web Storage,
 *   so it is not readable by injected scripts scanning storage, and it dies
 *   with the tab).
 * - On a 401 from any non-/auth route, all concurrent requests share ONE
 *   refresh call, then the original request retries exactly once.
 */

let accessToken: string | null = null

export function setAccessToken(token: string): void {
  accessToken = token
}

export function clearAccessToken(): void {
  accessToken = null
}

/** Dispatched on window when a refresh fails mid-session. */
export const SESSION_EXPIRED_EVENT = 'sanad:session-expired'

export const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

/** Normalise any failure into the one error shape the UI relies on. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { error?: Partial<ApiError> } | undefined
    if (error.response && body?.error?.code && body.error.message) {
      return {
        code: body.error.code,
        message: body.error.message,
        details: body.error.details,
        requestId: body.error.requestId ?? error.response.headers['x-request-id'],
        status: error.response.status,
      }
    }
    return {
      code: 'INTERNAL',
      message: error.response
        ? `Unexpected response (HTTP ${error.response.status})`
        : 'Could not reach the server. Check your connection and try again.',
      requestId: error.response?.headers['x-request-id'],
      status: error.response?.status ?? 0,
    }
  }
  return { code: 'INTERNAL', message: 'Something went wrong.', status: 0 }
}

// One refresh in flight at a time; every 401 awaits the same promise so the
// rotated refresh token is used exactly once.
let refreshPromise: Promise<string> | null = null

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    // Bare axios: the instance's interceptors must not run for the refresh itself.
    refreshPromise = axios
      .post<{ data: { accessToken: string } }>('/api/v1/auth/refresh', undefined, {
        withCredentials: true,
        timeout: 15_000,
      })
      .then((res) => {
        accessToken = res.data.data.accessToken
        return accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

// Only the routes where a 401 is a definitive answer, not a stale access
// token: credentials wrong (login/register), refresh token dead (refresh),
// or logout. /auth/me is NOT here — a 401 there just means the access token
// expired and the silent refresh should run like for any other route.
const NO_REFRESH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

function isNoRefreshRoute(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? ''
  return NO_REFRESH_ROUTES.some((route) => url === route || url.startsWith(`${route}?`))
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (status === 401 && config && !config._retried && !isNoRefreshRoute(config)) {
      try {
        await refreshAccessToken()
      } catch {
        clearAccessToken()
        queryClient.clear()
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
        return Promise.reject(toApiError(error))
      }
      config._retried = true
      return api(config)
    }

    return Promise.reject(toApiError(error))
  },
)

import { MutationCache, QueryClient } from '@tanstack/react-query'
import type { ApiError } from '../types/api'

/** ToastProvider listens for this and shows the detail as an error toast. */
export const API_ERROR_TOAST_EVENT = 'sanad:api-error-toast'

export function formatApiErrorToast(error: ApiError): string {
  const requestId = error.requestId ? ` (request ${error.requestId.slice(0, 8)})` : ''
  return `${error.code}: ${error.message}${requestId}`
}

export const queryClient = new QueryClient({
  // Safety net: any mutation without its own onError still surfaces as a toast
  // (code + message + requestId) instead of failing silently.
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError) return
      window.dispatchEvent(
        new CustomEvent(API_ERROR_TOAST_EVENT, {
          detail: formatApiErrorToast(error as unknown as ApiError),
        }),
      )
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      // 4xx responses are deterministic (missing route, forbidden, bad input) —
      // retrying only delays the error state. Retry twice on network/5xx.
      retry: (failureCount, error) => {
        const status = (error as unknown as ApiError).status
        return (status === 0 || status >= 500) && failureCount < 2
      },
    },
  },
})

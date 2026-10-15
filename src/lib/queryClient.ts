import { QueryClient } from '@tanstack/react-query'
import type { ApiError } from '../types/api'

export const queryClient = new QueryClient({
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

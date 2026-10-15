import { useQuery } from '@tanstack/react-query'
import type { ApiError } from '../../types/api'
import { getStats } from './api'

export function useStats() {
  return useQuery<Awaited<ReturnType<typeof getStats>>, ApiError>({
    queryKey: ['admin', 'stats'],
    queryFn: getStats,
  })
}

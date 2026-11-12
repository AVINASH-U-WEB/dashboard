import { useQuery } from '@tanstack/react-query'
import { fetchStats } from '../../api/ordersApi'
import { StatsResponse } from '../../types/order'

export function useStats() {
  return useQuery<StatsResponse, Error>({
    queryKey: ['order-stats'],
    queryFn: fetchStats,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}


import { useQuery } from '@tanstack/react-query'
import { searchOrders } from '../../api/ordersApi'
import { SearchResponse } from '../../types/order'

export function useOrderSearch(query: string, enabled: boolean = false) {
  return useQuery<SearchResponse, Error>({
    queryKey: ['order-search', query],
    queryFn: () => searchOrders(query, 15),
    enabled: enabled && query.trim().length > 1,
    staleTime: 60_000,
  })
}


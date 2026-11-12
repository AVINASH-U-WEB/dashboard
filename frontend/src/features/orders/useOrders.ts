import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchOrders } from '../../api/ordersApi'
import { OrdersQueryParams, OrdersResponse } from '../../types/order'

export function useOrders(params: OrdersQueryParams) {
  return useQuery<OrdersResponse, Error>({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

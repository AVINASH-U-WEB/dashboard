import { useQuery } from '@tanstack/react-query'
import { fetchCustomerOrders } from '../../../api/customersApi'

export function useCustomerOrders(
  customerId: string | null,
  page = 1,
  limit = 10,
) {
  return useQuery({
    queryKey: ['customer-orders', customerId, page, limit],
    queryFn: () => fetchCustomerOrders(customerId!, page, limit),
    enabled: Boolean(customerId),
    placeholderData: (previousData) => previousData,
  })
}
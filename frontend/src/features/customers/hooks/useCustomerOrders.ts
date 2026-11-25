import { useQuery } from '@tanstack/react-query'
import { fetchCustomerOrders } from '../api/customersApi'

export function useCustomerOrders(
  customerId: string | null | undefined,
  page = 1,
  limit = 10,
) {
  const normalizedId = customerId?.trim() || null

  return useQuery({
    queryKey: ['customer-orders', normalizedId, page, limit],
    queryFn: ({ signal }) => {
      if (!normalizedId) {
        throw new Error('Customer ID is required')
      }
      return fetchCustomerOrders(normalizedId, page, limit, signal)
    },
    enabled: Boolean(normalizedId),
    placeholderData: (previousData, previousQuery) => {
      const prevCustomerId = previousQuery?.queryKey?.[1]
      // Guard against cross-customer data leakage: only retain placeholder data
      // when paginating within the same customer
      if (prevCustomerId !== normalizedId) {
        return undefined
      }
      return previousData
    },
  })
}
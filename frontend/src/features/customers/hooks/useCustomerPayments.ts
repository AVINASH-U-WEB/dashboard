import { useQuery } from '@tanstack/react-query'
import { fetchCustomerPayments } from '../api/customersApi'

export function useCustomerPayments(customerId: string | null | undefined) {
  const normalizedId = customerId?.trim() || null

  return useQuery({
    queryKey: ['customer-payments', normalizedId],
    queryFn: ({ signal }) => {
      if (!normalizedId) {
        throw new Error('Customer ID is required')
      }
      return fetchCustomerPayments(normalizedId, signal)
    },
    enabled: Boolean(normalizedId),
  })
}
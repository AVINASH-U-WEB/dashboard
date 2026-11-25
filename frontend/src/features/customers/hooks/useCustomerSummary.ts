import { useQuery } from '@tanstack/react-query'
import { fetchCustomerSummary } from '../api/customersApi'

export function useCustomerSummary(customerId: string | null | undefined) {
  const normalizedId = customerId?.trim() || null

  return useQuery({
    queryKey: ['customer-summary', normalizedId],
    queryFn: ({ signal }) => {
      if (!normalizedId) {
        throw new Error('Customer ID is required')
      }
      return fetchCustomerSummary(normalizedId, signal)
    },
    enabled: Boolean(normalizedId),
  })
}
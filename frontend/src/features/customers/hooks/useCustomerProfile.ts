import { useQuery } from '@tanstack/react-query'
import { fetchCustomerProfile } from '../api/customersApi'

export function useCustomerProfile(customerId: string | null | undefined) {
  const normalizedId = customerId?.trim() || null

  return useQuery({
    queryKey: ['customer-profile', normalizedId],
    queryFn: ({ signal }) => {
      if (!normalizedId) {
        throw new Error('Customer ID is required')
      }
      return fetchCustomerProfile(normalizedId, signal)
    },
    enabled: Boolean(normalizedId),
  })
}
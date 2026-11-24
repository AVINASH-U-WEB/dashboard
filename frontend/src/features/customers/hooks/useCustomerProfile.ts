import { useQuery } from '@tanstack/react-query'
import { fetchCustomerProfile } from '../../../api/customersApi'

export function useCustomerProfile(customerId: string | null) {
  return useQuery({
    queryKey: ['customer-profile', customerId],
    queryFn: () => fetchCustomerProfile(customerId!),
    enabled: Boolean(customerId),
  })
}
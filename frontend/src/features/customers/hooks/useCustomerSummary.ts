import { useQuery } from '@tanstack/react-query'
import { fetchCustomerSummary } from '../../../api/customersApi'

export function useCustomerSummary(customerId: string | null) {
  return useQuery({
    queryKey: ['customer-summary', customerId],
    queryFn: () => fetchCustomerSummary(customerId!),
    enabled: Boolean(customerId),
  })
}
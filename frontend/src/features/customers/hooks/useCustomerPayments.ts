import { useQuery } from '@tanstack/react-query'
import { fetchCustomerPayments } from '../../../api/customersApi'

export function useCustomerPayments(customerId: string | null) {
  return useQuery({
    queryKey: ['customer-payments', customerId],
    queryFn: () => fetchCustomerPayments(customerId!),
    enabled: Boolean(customerId),
  })
}
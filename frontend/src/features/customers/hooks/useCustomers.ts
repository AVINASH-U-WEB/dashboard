
import { useQuery } from '@tanstack/react-query'
import { fetchCustomers } from '../api/customersApi'
import type { CustomersQueryParams } from '../types/customer'

export function useCustomers(params: CustomersQueryParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => fetchCustomers(params),
    placeholderData: (previousData) => previousData,
  })
}

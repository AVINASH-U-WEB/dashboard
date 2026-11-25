import { useQuery } from '@tanstack/react-query'
import { fetchCustomerDirectoryMeta } from '../api/customersApi'

export function useCustomerDirectoryMeta() {
  return useQuery({
    queryKey: ['customers-meta'],
    queryFn: ({ signal }) => fetchCustomerDirectoryMeta(signal),
    staleTime: 5 * 60_000,
  })
}

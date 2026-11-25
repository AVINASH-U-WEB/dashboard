
import { useQuery } from '@tanstack/react-query'
import { fetchCustomers } from '../api/customersApi'
import type { CustomersQueryParams } from '../types/customer'

export function useCustomers(params: CustomersQueryParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: ({ signal }) => fetchCustomers(params, signal),
    placeholderData: (previousData, previousQuery) => {
      const prevParams = previousQuery?.queryKey?.[1] as CustomersQueryParams | undefined
      if (
        prevParams &&
        (prevParams.search !== params.search ||
          prevParams.state !== params.state ||
          prevParams.customer_type !== params.customer_type ||
          prevParams.sort_by !== params.sort_by ||
          prevParams.sort_order !== params.sort_order)
      ) {
        return undefined
      }
      return previousData
    },
  })
}

import type {
  CustomersQueryParams,
  CustomersResponse,
  CustomerProfile,
  CustomerSummary,
  CustomerOrdersResponse,
  CustomerPaymentsResponse,
} from '../types/customer'
import { apiClient } from '../shared/api/client'

function isAbortSignal(value: unknown): value is AbortSignal {
  return (
    typeof value === 'object' &&
    value !== null &&
    'aborted' in value &&
    typeof (value as AbortSignal).addEventListener === 'function'
  )
}

function extractSignal(options?: AbortSignal | { signal?: AbortSignal }): AbortSignal | undefined {
  if (!options) return undefined
  if (isAbortSignal(options)) return options
  if (typeof options === 'object' && 'signal' in options && isAbortSignal(options.signal)) {
    return options.signal
  }
  return undefined
}

export async function fetchCustomers(
  params: CustomersQueryParams = {},
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<CustomersResponse> {
  const query = new URLSearchParams()

  query.append('page', String(params.page ?? 1))
  query.append('limit', String(params.limit ?? 20))

  if (params.search?.trim()) {
    query.append('search', params.search.trim())
  }

  if (params.state) {
    query.append('state', params.state)
  }

  if (params.sort_by) {
    query.append('sort_by', params.sort_by)
  }

  if (params.sort_order) {
    query.append('sort_order', params.sort_order)
  }

  return apiClient.get<CustomersResponse>('/customers', {
    params: query,
    signal: extractSignal(options),
  })
}

export async function fetchCustomerProfile(
  customerId: string,
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<CustomerProfile> {
  return apiClient.get<CustomerProfile>(`/customers/${encodeURIComponent(customerId)}`, {
    signal: extractSignal(options),
  })
}

export async function fetchCustomerSummary(
  customerId: string,
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<CustomerSummary> {
  return apiClient.get<CustomerSummary>(`/customers/${encodeURIComponent(customerId)}/summary`, {
    signal: extractSignal(options),
  })
}

export async function fetchCustomerOrders(
  customerId: string,
  page = 1,
  limit = 10,
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<CustomerOrdersResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  return apiClient.get<CustomerOrdersResponse>(
    `/customers/${encodeURIComponent(customerId)}/orders`,
    {
      params: query,
      signal: extractSignal(options),
    }
  )
}

export async function fetchCustomerPayments(
  customerId: string,
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<CustomerPaymentsResponse> {
  return apiClient.get<CustomerPaymentsResponse>(
    `/customers/${encodeURIComponent(customerId)}/payments`,
    {
      signal: extractSignal(options),
    }
  )
}

import type {
  CustomersQueryParams,
  CustomersResponse,
} from '../types/customer'
import type {
  CustomerProfile,
  CustomerSummary,
  CustomerOrdersResponse,
  CustomerPaymentsResponse,
} from '../types/customer'

const API_BASE = 'http://localhost:8000/api/v1'

export async function fetchCustomers(
  params: CustomersQueryParams = {},
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

  const response = await fetch(
    `${API_BASE}/customers?${query.toString()}`,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to fetch customers: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}


export async function fetchCustomerProfile(
  customerId: string,
): Promise<CustomerProfile> {
  const response = await fetch(
    `${API_BASE}/customers/${encodeURIComponent(customerId)}`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch customer profile: ${response.status}`)
  }

  return response.json()
}

export async function fetchCustomerSummary(
  customerId: string,
): Promise<CustomerSummary> {
  const response = await fetch(
    `${API_BASE}/customers/${encodeURIComponent(customerId)}/summary`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch customer summary: ${response.status}`)
  }

  return response.json()
}

export async function fetchCustomerOrders(
  customerId: string,
  page = 1,
  limit = 10,
): Promise<CustomerOrdersResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  const response = await fetch(
    `${API_BASE}/customers/${encodeURIComponent(customerId)}/orders?${query}`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch customer orders: ${response.status}`)
  }

  return response.json()
}

export async function fetchCustomerPayments(
  customerId: string,
): Promise<CustomerPaymentsResponse> {
  const response = await fetch(
    `${API_BASE}/customers/${encodeURIComponent(customerId)}/payments`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch customer payments: ${response.status}`)
  }

  return response.json()
}

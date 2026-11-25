import { OrdersQueryParams, OrdersResponse, Order, StatsResponse, SearchResponse } from '../types/order'
import { apiClient } from '../../../shared/api/client'

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

export async function fetchOrders(
  params: OrdersQueryParams = {},
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<OrdersResponse> {
  const query = new URLSearchParams()
  if (params.status && params.status !== 'all') query.append('status', params.status)
  if (params.from_date) query.append('from_date', params.from_date)
  if (params.to_date) query.append('to_date', params.to_date)
  if (params.is_anomaly !== undefined) query.append('is_anomaly', String(params.is_anomaly))
  if (params.is_late !== undefined) query.append('is_late', String(params.is_late))
  if (params.page) query.append('page', String(params.page))
  if (params.cursor) query.append('cursor', params.cursor)
  if (params.limit) query.append('limit', String(params.limit))

  return apiClient.get<OrdersResponse>('/orders', {
    params: query,
    signal: extractSignal(options),
  })
}

export async function fetchStats(
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<StatsResponse> {
  return apiClient.get<StatsResponse>('/orders/stats', {
    signal: extractSignal(options),
  })
}

export async function searchOrders(
  q: string,
  limit: number = 20,
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<SearchResponse> {
  const query = new URLSearchParams({ q, limit: String(limit) })
  return apiClient.get<SearchResponse>('/orders/search', {
    params: query,
    signal: extractSignal(options),
  })
}

export async function fetchOrderById(
  id: string,
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<Order> {
  return apiClient.get<Order>(`/orders/${encodeURIComponent(id)}`, {
    signal: extractSignal(options),
  })
}

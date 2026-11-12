import { OrdersQueryParams, OrdersResponse, Order, StatsResponse, SearchResponse } from '../types/order'

const API_BASE = 'http://localhost:8000/api/v1'

export async function fetchOrders(params: OrdersQueryParams = {}): Promise<OrdersResponse> {
  const query = new URLSearchParams()
  if (params.status && params.status !== 'all') query.append('status', params.status)
  if (params.from_date) query.append('from_date', params.from_date)
  if (params.to_date) query.append('to_date', params.to_date)
  if (params.is_anomaly !== undefined) query.append('is_anomaly', String(params.is_anomaly))
  if (params.is_late !== undefined) query.append('is_late', String(params.is_late))
  if (params.page) query.append('page', String(params.page))
  if (params.cursor) query.append('cursor', params.cursor)
  if (params.limit) query.append('limit', String(params.limit))

  const res = await fetch(`${API_BASE}/orders?${query.toString()}`)
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.statusText}`)
  return res.json()
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/orders/stats`)
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`)
  return res.json()
}

export async function searchOrders(q: string, limit: number = 20): Promise<SearchResponse> {
  const query = new URLSearchParams({ q, limit: String(limit) })
  const res = await fetch(`${API_BASE}/orders/search?${query.toString()}`)
  if (!res.ok) throw new Error(`Failed to search orders: ${res.statusText}`)
  return res.json()
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch order ${id}: ${res.statusText}`)
  return res.json()
}


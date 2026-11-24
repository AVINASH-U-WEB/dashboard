export type OrderStatus =
  | 'delivered'
  | 'shipped'
  | 'canceled'
  | 'processing'
  | 'invoiced'
  | 'approved'
  | 'unavailable'
  | 'created'

export interface Order {
  order_id: string
  customer_id: string
  order_status: OrderStatus
  order_purchase_timestamp: string
  order_approved_at: string | null
  order_delivered_carrier_date: string | null
  order_delivered_customer_date: string | null
  order_estimated_delivery_date: string | null
  customer_city: string | null
  customer_state: string | null
  seller_id: string | null
  seller_state: string | null
  product_category_name: string | null
  product_id: string | null
  price: number | null
  freight_value: number | null
  review_score: number | null
  review_comment_message: string | null
  seller_late_rate: number | null
  delivery_lag_days: number | null
  zscore_in_category: number | null
  is_anomaly: number
  is_late: number
}

export interface PaginationMeta {
  count: number
  total: number
  page: number
  total_pages: number
  limit: number
  next_cursor: string | null
  has_more: boolean
}

export interface OrdersResponse {
  data: Order[]
  meta: PaginationMeta
}

export interface StatsResponse {
  total: number
  by_status: Record<string, number>
  anomalies: number
  late_deliveries: number
  anomaly_pct: number
  late_pct: number
}

export interface SearchResult {
  order_id: string
  similarity_score: number
  order_status: string | null
  review_comment_message: string | null
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
}

export interface OrdersQueryParams {
  status?: string
  from_date?: string
  to_date?: string
  is_anomaly?: number
  is_late?: number
  page?: number
  cursor?: string
  limit?: number
}

export interface SLAPaginationMeta {
  total: number
  page: number
  limit: number
  total_pages: number
  count: number
}

export interface SLASummary {
  total_orders: number
  delivered_orders: number
  late_deliveries: number
  on_time_deliveries: number
  on_time_delivery_rate: number
  late_delivery_rate: number
  average_late_delay_days: number
}

export interface DelayBucket {
  label: string
  count: number
  percentage: number
}

export interface DelayDistribution {
  total_late_orders: number
  distribution: DelayBucket[]
}

export interface MonthlyTrend {
  month: string
  delivered_orders: number
  late_deliveries: number
  on_time_deliveries: number
  on_time_delivery_rate: number
  late_delivery_rate: number
}

export interface MonthlyTrendsResponse {
  total_delivered_orders: number
  monthly_trends: MonthlyTrend[]
}

export interface SLAOrderRecord {
  order_id: string
  customer_id: string
  order_status: string
  order_purchase_timestamp: string | null
  order_approved_at?: string | null
  order_delivered_carrier_date?: string | null
  order_estimated_delivery_date: string | null
  order_delivered_customer_date: string | null
  customer_city: string | null
  customer_state: string | null
  seller_id: string | null
  seller_state: string | null
  product_category_name: string | null
  product_id?: string | null
  price: number | null
  freight_value: number | null
  review_score: number | null
  review_comment_message?: string | null
  delivery_lag_days: number | null
  is_late: number
  seller_late_rate: number | null
  zscore_in_category?: number | null
  is_anomaly: number
}

export type LateDelivery = SLAOrderRecord

export interface LateDeliveriesResponse {
  data: LateDelivery[]
  meta: SLAPaginationMeta
}

export interface OverdueShipment extends SLAOrderRecord {
  days_overdue: number
}

export interface OverdueShipmentsResponse {
  reference_date: string
  total_overdue_shipments: number
  data: OverdueShipment[]
  meta: SLAPaginationMeta
}

export interface OverdueShipmentsParams {
  as_of_date: string
  page?: number
  limit?: number
}

export interface RegionalPerformanceItem {
  customer_state: string
  delivered_orders: number
  late_deliveries: number
  on_time_deliveries: number
  late_delivery_rate: number
  on_time_delivery_rate: number
  average_late_delay_days: number
}

export interface RegionalPerformanceResponse {
  total_delivered_orders: number
  regions: RegionalPerformanceItem[]
}

export interface SellerPerformanceItem {
  seller_id: string
  seller_state: string | null
  delivered_orders: number
  late_deliveries: number
  on_time_deliveries: number
  late_delivery_rate: number
  on_time_delivery_rate: number
  average_late_delay_days: number
}

export interface SellerPerformanceResponse {
  total_sellers: number
  min_orders: number
  data: SellerPerformanceItem[]
  meta: SLAPaginationMeta
}

export interface SellerPerformanceParams {
  min_orders?: number
  page?: number
  limit?: number
}

export type AnomalyOrder = SLAOrderRecord

export interface AnomalyAnalysisResponse {
  total_delivered_orders: number
  total_anomalous_orders: number
  late_anomalous_orders: number
  anomaly_rate: number
  data: AnomalyOrder[]
  meta: SLAPaginationMeta
}

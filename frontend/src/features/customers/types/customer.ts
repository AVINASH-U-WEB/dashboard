export interface CustomerDirectoryItem {
  customer_unique_id: string
  customer_city: string
  customer_state: string
  customer_zip_code_prefix: string
  record_count: number
  total_orders: number
  lifetime_spend: number
  average_order_value: number
  first_purchase: string | null
  last_purchase: string | null
  customer_type: 'New' | 'Returning'
  last_order_status: string | null
}

export interface CustomersResponse {
  items: CustomerDirectoryItem[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface CustomerDirectoryMeta {
  total_customers: number
  returning_customers: number
  new_customers: number
  states: string[]
}

export type CustomerTypeFilter = 'New' | 'Returning'

export interface CustomersQueryParams {
  page?: number
  limit?: number
  search?: string
  state?: string
  customer_type?: CustomerTypeFilter
  sort_by?: CustomerSortField
  sort_order?: 'asc' | 'desc'
}

export type CustomerSortField =
  | 'customer_unique_id'
  | 'customer_city'
  | 'total_orders'
  | 'lifetime_spend'
  | 'last_purchase'



export interface CustomerRecord {
  customer_id: string
  customer_zip_code_prefix: string
  customer_city: string
  customer_state: string
}

export interface CustomerProfile {
  customer_unique_id: string
  record_count: number
  customer_records: CustomerRecord[]
}

export interface CustomerSummary {
  customer_unique_id: string
  total_orders: number
  lifetime_spend: number
  average_order_value: number
  first_purchase: string | null
  last_purchase: string | null
  customer_type: 'New' | 'Returning'
  last_order_status: string | null
}

export interface CustomerOrder {
  order_id: string
  order_status: string
  order_purchase_timestamp: string | null
  order_approved_at: string | null
  order_delivered_carrier_date: string | null
  order_delivered_customer_date: string | null
  order_estimated_delivery_date: string | null
}

export interface CustomerOrdersResponse {
  customer_unique_id: string
  total_orders: number
  page: number
  limit: number
  total_pages: number
  orders: CustomerOrder[]
}

export interface CustomerPaymentMethod {
  payment_type: string
  payment_count: number
  total_amount: number
  percentage: number
}

export interface CustomerPaymentsResponse {
  customer_unique_id: string
  total_payment_value: number
  payment_methods: CustomerPaymentMethod[]
}

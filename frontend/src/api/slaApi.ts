export interface SLASummary {
  total_orders: number
  delivered_orders: number
  late_deliveries: number
  on_time_deliveries: number
  on_time_delivery_rate: number
  late_delivery_rate: number
  average_late_delay_days: number
}

const API_BASE = 'http://localhost:8000/api/v1'

export async function fetchSLASummary(): Promise<SLASummary> {
  const response = await fetch(`${API_BASE}/sla/summary`)

  if (!response.ok) {
    throw new Error(`Failed to fetch SLA summary: ${response.statusText}`)
  }

  return response.json()
}
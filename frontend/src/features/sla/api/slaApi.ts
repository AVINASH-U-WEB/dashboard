import { apiClient } from '../../../shared/api/client'
import type {
  SLASummary,
  DelayDistribution,
  MonthlyTrendsResponse,
  LateDeliveriesResponse,
  OverdueShipmentsParams,
  OverdueShipmentsResponse,
  RegionalPerformanceResponse,
  SellerPerformanceParams,
  SellerPerformanceResponse,
  AnomalyAnalysisResponse,
} from '../types/sla'

export type {
  SLASummary,
  DelayBucket,
  DelayDistribution,
  MonthlyTrend,
  MonthlyTrendsResponse,
  LateDelivery,
  LateDeliveriesResponse,
  OverdueShipment,
  OverdueShipmentsResponse,
  OverdueShipmentsParams,
  RegionalPerformanceItem,
  RegionalPerformanceResponse,
  SellerPerformanceItem,
  SellerPerformanceResponse,
  SellerPerformanceParams,
  AnomalyOrder,
  AnomalyAnalysisResponse,
  SLAPaginationMeta,
} from '../types/sla'

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

export async function fetchSLASummary(
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<SLASummary> {
  return apiClient.get<SLASummary>('/sla/summary', {
    signal: extractSignal(options),
  })
}

export async function fetchDelayDistribution(
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<DelayDistribution> {
  return apiClient.get<DelayDistribution>('/sla/delay-distribution', {
    signal: extractSignal(options),
  })
}

export async function fetchMonthlyTrends(
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<MonthlyTrendsResponse> {
  return apiClient.get<MonthlyTrendsResponse>('/sla/monthly-trends', {
    signal: extractSignal(options),
  })
}

export async function fetchLateDeliveries(
  page: number = 1,
  limit: number = 5,
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<LateDeliveriesResponse> {
  return apiClient.get<LateDeliveriesResponse>('/sla/late-deliveries', {
    params: { page, limit },
    signal: extractSignal(options),
  })
}

export async function fetchOverdueShipments(
  params: OverdueShipmentsParams,
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<OverdueShipmentsResponse> {
  return apiClient.get<OverdueShipmentsResponse>('/sla/overdue-shipments', {
    params: {
      as_of_date: params.as_of_date,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    },
    signal: extractSignal(options),
  })
}

export async function fetchRegionalPerformance(
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<RegionalPerformanceResponse> {
  return apiClient.get<RegionalPerformanceResponse>('/sla/regional-performance', {
    signal: extractSignal(options),
  })
}

export async function fetchSellerPerformance(
  params: SellerPerformanceParams = {},
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<SellerPerformanceResponse> {
  return apiClient.get<SellerPerformanceResponse>('/sla/seller-performance', {
    params: {
      min_orders: params.min_orders ?? 10,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    },
    signal: extractSignal(options),
  })
}

export async function fetchAnomalyAnalysis(
  page: number = 1,
  limit: number = 10,
  options?: AbortSignal | { signal?: AbortSignal }
): Promise<AnomalyAnalysisResponse> {
  return apiClient.get<AnomalyAnalysisResponse>('/sla/anomaly-analysis', {
    params: { page, limit },
    signal: extractSignal(options),
  })
}
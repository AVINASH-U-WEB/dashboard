import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
  fetchSLASummary,
  fetchDelayDistribution,
  fetchMonthlyTrends,
  fetchLateDeliveries,
  fetchOverdueShipments,
  fetchRegionalPerformance,
  fetchSellerPerformance,
  fetchAnomalyAnalysis,
} from '../api/slaApi'
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

export function useSLASummary() {
  return useQuery<SLASummary, Error>({
    queryKey: ['sla', 'summary'],
    queryFn: ({ signal }) => fetchSLASummary(signal),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

export function useDelayDistribution() {
  return useQuery<DelayDistribution, Error>({
    queryKey: ['sla', 'delay-distribution'],
    queryFn: ({ signal }) => fetchDelayDistribution(signal),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

export function useMonthlyTrends() {
  return useQuery<MonthlyTrendsResponse, Error>({
    queryKey: ['sla', 'monthly-trends'],
    queryFn: ({ signal }) => fetchMonthlyTrends(signal),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

export function useLateDeliveries(page: number = 1, limit: number = 5) {
  return useQuery<LateDeliveriesResponse, Error>({
    queryKey: ['sla', 'late-deliveries', page, limit],
    queryFn: ({ signal }) => fetchLateDeliveries(page, limit, signal),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useOverdueShipments(params: OverdueShipmentsParams) {
  return useQuery<OverdueShipmentsResponse, Error>({
    queryKey: ['sla', 'overdue-shipments', params],
    queryFn: ({ signal }) => fetchOverdueShipments(params, signal),
    enabled: Boolean(params.as_of_date),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useRegionalPerformance() {
  return useQuery<RegionalPerformanceResponse, Error>({
    queryKey: ['sla', 'regional-performance'],
    queryFn: ({ signal }) => fetchRegionalPerformance(signal),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

export function useSellerPerformance(params: SellerPerformanceParams) {
  return useQuery<SellerPerformanceResponse, Error>({
    queryKey: ['sla', 'seller-performance', params],
    queryFn: ({ signal }) => fetchSellerPerformance(params, signal),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

export function useAnomalyAnalysis(page: number = 1, limit: number = 10) {
  return useQuery<AnomalyAnalysisResponse, Error>({
    queryKey: ['sla', 'anomaly-analysis', page, limit],
    queryFn: ({ signal }) => fetchAnomalyAnalysis(page, limit, signal),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

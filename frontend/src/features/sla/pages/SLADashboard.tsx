import type { FC } from 'react'
import { SLASummaryCards } from '../components/SLASummaryCards'
import { DeliveryBreakdownCard } from '../components/DeliveryBreakdownCard'
import { DelayDistributionCard } from '../components/DelayDistributionCard'
import { MonthlyTrendsCard } from '../components/MonthlyTrendsCard'
import { LateDeliveriesTable } from '../components/LateDeliveriesTable'
import { OverdueShipmentsSection } from '../components/OverdueShipmentsSection'
import { RegionalPerformanceSection } from '../components/RegionalPerformanceSection'
import { SellerPerformanceSection } from '../components/SellerPerformanceSection'
import { AnomalyAnalysisSection } from '../components/AnomalyAnalysisSection'
import {
  useSLASummary,
  useDelayDistribution,
  useMonthlyTrends,
} from '../hooks/useSLAQueries'

export const SLADashboard: FC = () => {
  const summaryQuery = useSLASummary()
  const delayQuery = useDelayDistribution()
  const trendsQuery = useMonthlyTrends()

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          SLA &amp; Escalation Metrics
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Delivery performance, delay analytics, overdue shipments, regional and seller metrics, and anomaly monitoring
        </p>
      </div>

      {/* 1. SLA Summary KPI Cards */}
      <SLASummaryCards
        summary={summaryQuery.data}
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        error={summaryQuery.error}
        onRetry={() => summaryQuery.refetch()}
      />

      {/* 2 & 3. On-Time vs Late Donut + Delay Distribution Bar Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <DeliveryBreakdownCard
          summary={summaryQuery.data}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
          error={summaryQuery.error}
          onRetry={() => summaryQuery.refetch()}
        />

        <DelayDistributionCard
          delayDistribution={delayQuery.data}
          isLoading={delayQuery.isLoading}
          isError={delayQuery.isError}
          error={delayQuery.error}
          onRetry={() => delayQuery.refetch()}
        />
      </div>

      {/* 4. Monthly Delivery Performance Line Chart (6 months per page) */}
      <MonthlyTrendsCard
        monthlyTrends={trendsQuery.data}
        isLoading={trendsQuery.isLoading}
        isError={trendsQuery.isError}
        error={trendsQuery.error}
        onRetry={() => trendsQuery.refetch()}
      />

      {/* 5. Late Deliveries Table (5 per page) */}
      <LateDeliveriesTable />

      {/* 6. Overdue Shipments */}
      <OverdueShipmentsSection />

      {/* 7. Regional Performance (Bar Chart + Ranked Table) */}
      <RegionalPerformanceSection />

      {/* 8. Seller Performance (Horizontal Bar Chart + Paginated Table) */}
      <SellerPerformanceSection />

      {/* 9. Anomaly Analysis (Anomaly Overview Donut + Paginated Table) */}
      <AnomalyAnalysisSection />
    </div>
  )
}

export default SLADashboard

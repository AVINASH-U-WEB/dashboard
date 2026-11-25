import type { FC } from 'react'
import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import type { DelayBucket, DelayDistribution } from '../types/sla'

export interface DelayDistributionCardProps {
  delayDistribution?: DelayDistribution
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry?: () => void
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: DelayBucket }>
}

const DelayTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  const bucket = payload?.[0]?.payload
  if (!active || !bucket) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-md text-xs">
      <p className="font-semibold text-gray-900">{bucket.label}</p>
      <p className="mt-1 text-gray-600">
        Late Orders:{' '}
        <span className="font-bold text-gray-900">
          {bucket.count.toLocaleString()}
        </span>
      </p>
      <p className="text-gray-600">
        Share of Late:{' '}
        <span className="font-bold text-amber-600">{bucket.percentage}%</span>
      </p>
    </div>
  )
}

export const DelayDistributionCard: FC<DelayDistributionCardProps> = ({
  delayDistribution,
  isLoading,
  isError,
  error,
  onRetry,
}) => {
  const chartData = useMemo(
    () => delayDistribution?.distribution ?? [],
    [delayDistribution?.distribution]
  )

  return (
    <section className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-sm flex flex-col justify-between">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Delay Distribution
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Late deliveries grouped by delay duration
          </p>
        </div>
        {delayDistribution && (
          <span className="text-xs font-medium text-gray-500 shrink-0">
            {delayDistribution.total_late_orders.toLocaleString()} late orders
          </span>
        )}
      </div>

      {isLoading && !delayDistribution ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height="1.75rem" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-red-600">
            {error?.message || 'Unable to load delay distribution'}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100/60"
            >
              Retry
            </button>
          )}
        </div>
      ) : chartData.length > 0 ? (
        <div className="space-y-4">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => value.toLocaleString()}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={<DelayTooltip />}
                />
                <Bar
                  dataKey="count"
                  name="Late Orders"
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-gray-100">
            {chartData.map((bucket) => (
              <div
                key={bucket.label}
                className="rounded-xl bg-gray-50 px-2.5 py-2 text-center"
              >
                <p className="text-[11px] font-medium text-gray-500 truncate">
                  {bucket.label}
                </p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">
                  {bucket.count.toLocaleString()}
                </p>
                <p className="text-[10px] font-semibold text-amber-600">
                  {bucket.percentage}%
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No delay distribution data available"
          description="Late delivery delay buckets will appear here when data is available."
          className="py-8"
        />
      )}
    </section>
  )
}

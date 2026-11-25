import type { FC } from 'react'
import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import type { MonthlyTrend, MonthlyTrendsResponse } from '../types/sla'

const MONTHS_PER_PAGE = 6

export interface MonthlyTrendsCardProps {
  monthlyTrends?: MonthlyTrendsResponse
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry?: () => void
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: MonthlyTrend }>
  label?: string
}

const MonthlyTrendTooltip: FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-md text-xs space-y-1">
      <p className="font-semibold text-gray-900">{label ?? point.month}</p>
      <p className="text-emerald-700">
        On-Time Rate:{' '}
        <span className="font-bold">
          {point.on_time_delivery_rate.toFixed(2)}%
        </span>{' '}
        ({point.on_time_deliveries.toLocaleString()})
      </p>
      <p className="text-rose-600">
        Late Rate:{' '}
        <span className="font-bold">
          {point.late_delivery_rate.toFixed(2)}%
        </span>{' '}
        ({point.late_deliveries.toLocaleString()})
      </p>
      <p className="text-gray-500 pt-1 border-t border-gray-100">
        Total Delivered:{' '}
        <span className="font-semibold text-gray-800">
          {point.delivered_orders.toLocaleString()}
        </span>
      </p>
    </div>
  )
}

export const MonthlyTrendsCard: FC<MonthlyTrendsCardProps> = ({
  monthlyTrends,
  isLoading,
  isError,
  error,
  onRetry,
}) => {
  const [monthlyCurrentPage, setMonthlyCurrentPage] = useState(1)

  const monthlyTrendData = useMemo(
    () => monthlyTrends?.monthly_trends ?? [],
    [monthlyTrends?.monthly_trends]
  )
  const monthlyTotalPages = Math.ceil(monthlyTrendData.length / MONTHS_PER_PAGE)
  const safePage =
    monthlyTotalPages > 0 ? Math.min(monthlyCurrentPage, monthlyTotalPages) : 1

  const visibleMonths = useMemo(() => {
    const startIndex = (safePage - 1) * MONTHS_PER_PAGE
    return monthlyTrendData.slice(startIndex, startIndex + MONTHS_PER_PAGE)
  }, [monthlyTrendData, safePage])

  return (
    <section className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Monthly On-Time Delivery Trend
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              On-time vs late delivery rates across 6-month intervals
            </p>
          </div>
          {monthlyTrends && (
            <span className="text-xs font-medium text-gray-500 shrink-0">
              {monthlyTrends.total_delivered_orders.toLocaleString()} delivered
            </span>
          )}
        </div>

        {isLoading && !monthlyTrends ? (
          <div className="space-y-4">
            {Array.from({ length: MONTHS_PER_PAGE }).map((_, index) => (
              <Skeleton key={index} height="2.25rem" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-red-600">
              {error?.message || 'Unable to load monthly trends'}
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
        ) : monthlyTrendData.length > 0 ? (
          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visibleMonths}
                margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <Tooltip content={<MonthlyTrendTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs font-medium text-gray-700">
                      {value}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="on_time_delivery_rate"
                  name="On-Time Delivery Rate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="late_delivery_rate"
                  name="Late Delivery Rate"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="No monthly trend data available"
            description="Monthly delivery performance trends will appear here once delivered orders exist."
            className="py-8"
          />
        )}
      </div>

      {/* Monthly Trends Pagination (6 months per page, independent Previous/Next) */}
      {monthlyTotalPages > 1 && (
        <div className="mt-5 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page {safePage} of {monthlyTotalPages}
            {' · '}
            Showing {visibleMonths.length} months
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setMonthlyCurrentPage((page) => Math.max(1, page - 1))
              }
              disabled={safePage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setMonthlyCurrentPage((page) =>
                  Math.min(monthlyTotalPages, page + 1)
                )
              }
              disabled={safePage >= monthlyTotalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

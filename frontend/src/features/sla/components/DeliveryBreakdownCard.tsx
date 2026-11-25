import type { FC } from 'react'
import { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import type { SLASummary } from '../types/sla'

export interface DeliveryBreakdownCardProps {
  summary?: SLASummary
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry?: () => void
}

interface BreakdownSlice {
  name: string
  value: number
  rate: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: BreakdownSlice }>
}

const BreakdownTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  const item = payload?.[0]?.payload
  if (!active || !item) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-md text-xs">
      <p className="font-semibold text-gray-900">{item.name}</p>
      <p className="mt-1 text-gray-600">
        Orders: <span className="font-bold text-gray-900">{item.value.toLocaleString()}</span>
      </p>
      <p className="text-gray-600">
        Share: <span className="font-bold text-gray-900">{item.rate.toFixed(2)}%</span>
      </p>
    </div>
  )
}

export const DeliveryBreakdownCard: FC<DeliveryBreakdownCardProps> = ({
  summary,
  isLoading,
  isError,
  error,
  onRetry,
}) => {
  const chartData = useMemo<BreakdownSlice[]>(() => {
    if (!summary || summary.delivered_orders === 0) return []
    return [
      {
        name: 'On-Time Deliveries',
        value: summary.on_time_deliveries,
        rate: summary.on_time_delivery_rate,
        color: '#10b981',
      },
      {
        name: 'Late Deliveries',
        value: summary.late_deliveries,
        rate: summary.late_delivery_rate,
        color: '#f43f5e',
      },
    ]
  }, [summary])

  return (
    <section className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-sm flex flex-col justify-between">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            On-Time vs Late Deliveries
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Proportion of delivered orders meeting estimated delivery dates
          </p>
        </div>
        {summary && (
          <span className="text-xs font-medium text-gray-500 shrink-0">
            {summary.delivered_orders.toLocaleString()} delivered
          </span>
        )}
      </div>

      {isLoading && !summary ? (
        <div className="h-[260px] flex items-center justify-center">
          <Skeleton width="12rem" height="12rem" rounded="full" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-red-600">
            {error?.message || 'Unable to load delivery breakdown'}
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
      ) : chartData.length > 0 && summary ? (
        <div className="space-y-4">
          <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<BreakdownTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={28}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-gray-700">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center KPI overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-6">
              <span className="text-xl font-bold text-gray-900">
                {summary.on_time_delivery_rate.toFixed(1)}%
              </span>
              <span className="text-[11px] font-medium text-gray-500">
                On-Time
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div className="rounded-xl bg-emerald-50/60 px-3.5 py-2.5">
              <p className="text-xs text-emerald-700 font-medium">On-Time</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {summary.on_time_deliveries.toLocaleString()}{' '}
                <span className="text-xs font-medium text-emerald-700">
                  ({summary.on_time_delivery_rate.toFixed(2)}%)
                </span>
              </p>
            </div>
            <div className="rounded-xl bg-rose-50/60 px-3.5 py-2.5">
              <p className="text-xs text-rose-700 font-medium">Late</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {summary.late_deliveries.toLocaleString()}{' '}
                <span className="text-xs font-medium text-rose-700">
                  ({summary.late_delivery_rate.toFixed(2)}%)
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No delivery breakdown available"
          description="Delivered order breakdown will appear here once delivered orders exist."
          className="py-8"
        />
      )}
    </section>
  )
}

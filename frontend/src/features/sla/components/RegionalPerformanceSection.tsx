import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Badge } from '../../../shared/components/ui/Badge'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import { useRegionalPerformance } from '../hooks/useSLAQueries'
import type { RegionalPerformanceItem } from '../types/sla'

type RegionSortKey =
  | 'worst_late_rate'
  | 'best_on_time_rate'
  | 'most_orders'
  | 'state_asc'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: RegionalPerformanceItem }>
}

const RegionalTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  const region = payload?.[0]?.payload
  if (!active || !region) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-md text-xs space-y-1">
      <p className="font-bold text-gray-900">State: {region.customer_state}</p>
      <p className="text-emerald-700">
        On-Time Rate:{' '}
        <span className="font-bold">
          {region.on_time_delivery_rate.toFixed(2)}%
        </span>
      </p>
      <p className="text-rose-600">
        Late Deliveries:{' '}
        <span className="font-bold">
          {region.late_deliveries.toLocaleString()}
        </span>{' '}
        ({region.late_delivery_rate.toFixed(2)}%)
      </p>
      <p className="text-gray-600">
        Total Delivered:{' '}
        <span className="font-semibold text-gray-900">
          {region.delivered_orders.toLocaleString()}
        </span>
      </p>
    </div>
  )
}

export const RegionalPerformanceSection: FC = () => {
  const [sortBy, setSortBy] = useState<RegionSortKey>('worst_late_rate')
  const { data, isLoading, isError, error, refetch } = useRegionalPerformance()

  const sortedRegions = useMemo(() => {
    const regions = [...(data?.regions ?? [])]

    switch (sortBy) {
      case 'best_on_time_rate':
        return regions.sort(
          (a, b) =>
            b.on_time_delivery_rate - a.on_time_delivery_rate ||
            b.delivered_orders - a.delivered_orders
        )
      case 'most_orders':
        return regions.sort(
          (a, b) =>
            b.delivered_orders - a.delivered_orders ||
            a.customer_state.localeCompare(b.customer_state)
        )
      case 'state_asc':
        return regions.sort((a, b) =>
          a.customer_state.localeCompare(b.customer_state)
        )
      case 'worst_late_rate':
      default:
        return regions
    }
  }, [data?.regions, sortBy])

  return (
    <section className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Regional Performance
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            On-time delivery rate and late shipment volume grouped by customer state
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {data && (
            <span className="text-xs font-medium text-gray-500">
              {sortedRegions.length} regions ·{' '}
              {data.total_delivered_orders.toLocaleString()} delivered orders
            </span>
          )}

          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            <span className="text-gray-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as RegionSortKey)}
              aria-label="Sort regional performance"
              className="bg-transparent font-semibold text-gray-800 focus:outline-none"
            >
              <option value="worst_late_rate">Worst Late Rate</option>
              <option value="best_on_time_rate">Best On-Time Rate</option>
              <option value="most_orders">Most Delivered Orders</option>
              <option value="state_asc">State (A–Z)</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height="2.25rem" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 flex items-center justify-between gap-4 text-sm text-red-600 bg-red-50/60">
          <span>
            {error?.message || 'Unable to load regional performance'}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100/60 shrink-0"
          >
            Retry
          </button>
        </div>
      ) : sortedRegions.length === 0 ? (
        <EmptyState
          title="No regional performance data"
          description="Regional SLA comparisons will appear once delivered orders are available."
        />
      ) : (
        <>
          {/* Regional Bar Chart */}
          <div className="p-6 border-b border-gray-100">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                On-Time Delivery Rate by State (%)
              </p>
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  ≥ 92%
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                  85%–91.9%
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                  &lt; 85%
                </span>
              </div>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedRegions}
                  margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="customer_state"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) => `${value}%`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    content={<RegionalTooltip />}
                  />
                  <Bar
                    dataKey="on_time_delivery_rate"
                    name="On-Time Rate"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  >
                    {sortedRegions.map((region) => {
                      const fill =
                        region.on_time_delivery_rate < 85
                          ? '#f43f5e'
                          : region.on_time_delivery_rate < 92
                            ? '#fbbf24'
                            : '#10b981'
                      return <Cell key={region.customer_state} fill={fill} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Table */}
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-4">Rank</th>
                  <th className="px-5 py-4">Customer State</th>
                  <th className="px-5 py-4">Total Orders</th>
                  <th className="px-5 py-4">On-Time</th>
                  <th className="px-5 py-4">Late</th>
                  <th className="px-5 py-4 min-w-[220px]">On-Time Rate</th>
                  <th className="px-5 py-4">Avg Late Delay</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sortedRegions.map((region, index) => {
                  const isLowOnTime = region.on_time_delivery_rate < 85
                  const isModerate =
                    region.on_time_delivery_rate >= 85 &&
                    region.on_time_delivery_rate < 92

                  return (
                    <tr
                      key={region.customer_state}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-xs font-semibold text-gray-400">
                        #{index + 1}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-900 font-bold text-xs">
                          {region.customer_state}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        {region.delivered_orders.toLocaleString()}
                      </td>

                      <td className="px-5 py-3.5 text-emerald-700 font-medium">
                        {region.on_time_deliveries.toLocaleString()}
                      </td>

                      <td className="px-5 py-3.5 text-rose-600 font-medium">
                        {region.late_deliveries.toLocaleString()}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isLowOnTime
                                  ? 'bg-rose-500'
                                  : isModerate
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-500'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(0, region.on_time_delivery_rate))}%`,
                              }}
                            />
                          </div>
                          <Badge
                            size="sm"
                            variant={
                              isLowOnTime
                                ? 'danger'
                                : isModerate
                                  ? 'warning'
                                  : 'success'
                            }
                          >
                            {region.on_time_delivery_rate.toFixed(1)}%
                          </Badge>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                        {region.average_late_delay_days.toFixed(1)} days
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { Badge } from '../../../shared/components/ui/Badge'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import { useAnomalyAnalysis } from '../hooks/useSLAQueries'
import {
  formatCustomerLocation,
  truncateIdentifier,
} from '../utils/formatters'
import { SLAPaginationFooter } from './SLAPaginationFooter'

const ANOMALY_PAGE_SIZE = 10

interface AnomalySlice {
  name: string
  value: number
  percentage: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: AnomalySlice }>
}

const AnomalyTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  const slice = payload?.[0]?.payload
  if (!active || !slice) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-md text-xs">
      <p className="font-semibold text-gray-900">{slice.name}</p>
      <p className="mt-1 text-gray-600">
        Orders: <span className="font-bold text-gray-900">{slice.value.toLocaleString()}</span>
      </p>
      <p className="text-gray-600">
        Share: <span className="font-bold text-gray-900">{slice.percentage.toFixed(2)}%</span>
      </p>
    </div>
  )
}

export const AnomalyAnalysisSection: FC = () => {
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, isError, error, refetch } =
    useAnomalyAnalysis(page, ANOMALY_PAGE_SIZE)

  const anomalyOverviewData = useMemo<AnomalySlice[]>(() => {
    if (!data || data.total_delivered_orders <= 0) return []
    const normalOrders = Math.max(
      0,
      data.total_delivered_orders - data.total_anomalous_orders
    )
    const normalRate = Math.max(0, 100 - data.anomaly_rate)
    return [
      {
        name: 'Normal Delivered Orders',
        value: normalOrders,
        percentage: normalRate,
        color: '#cbd5e1',
      },
      {
        name: 'Anomalous Orders',
        value: data.total_anomalous_orders,
        percentage: data.anomaly_rate,
        color: '#f43f5e',
      },
    ]
  }, [data])

  return (
    <section className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900">
              Anomaly Analysis
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Delivered orders flagged as statistical delivery anomalies within their product category
          </p>
        </div>

        {data && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="danger" dot>
              {data.total_anomalous_orders.toLocaleString()} anomalies ({data.anomaly_rate.toFixed(2)}%)
            </Badge>
            <Badge variant="warning">
              {data.late_anomalous_orders.toLocaleString()} late anomalies
            </Badge>
          </div>
        )}
      </div>

      {isLoading && !data ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height="2.5rem" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 flex items-center justify-between gap-4 text-sm text-red-600 bg-red-50/60">
          <span>
            {error?.message || 'Unable to load anomaly analysis'}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100/60 shrink-0"
          >
            Retry
          </button>
        </div>
      ) : data && data.data.length === 0 ? (
        <EmptyState
          title="No delivery anomalies detected"
          description="No delivered orders are currently flagged as category delivery anomalies."
        />
      ) : data ? (
        <>
          {/* Anomaly Overview Donut Chart (uses population totals from /sla/anomaly-analysis) */}
          {anomalyOverviewData.length > 0 && (
            <div className="p-6 border-b border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={anomalyOverviewData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={74}
                      paddingAngle={2}
                      strokeWidth={2}
                      stroke="#ffffff"
                    >
                      {anomalyOverviewData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<AnomalyTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={24}
                      formatter={(value) => (
                        <span className="text-xs font-medium text-gray-600">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-5">
                  <span className="text-base font-bold text-gray-900">
                    {data.anomaly_rate.toFixed(2)}%
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    Anomaly Rate
                  </span>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500">
                    Delivered Orders Evaluated
                  </p>
                  <p className="mt-1.5 text-xl font-bold text-gray-900">
                    {data.total_delivered_orders.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Full delivered population
                  </p>
                </div>

                <div className="rounded-xl bg-rose-50/60 p-4 border border-rose-100">
                  <p className="text-xs font-medium text-rose-700">
                    Anomalous Orders
                  </p>
                  <p className="mt-1.5 text-xl font-bold text-gray-900">
                    {data.total_anomalous_orders.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[11px] text-rose-600">
                    {data.anomaly_rate.toFixed(2)}% of delivered orders
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50/60 p-4 border border-amber-100">
                  <p className="text-xs font-medium text-amber-700">
                    Late Anomalous Orders
                  </p>
                  <p className="mt-1.5 text-xl font-bold text-gray-900">
                    {data.late_anomalous_orders.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[11px] text-amber-700">
                    Anomalies also delivered late
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Anomalous Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Seller</th>
                  <th className="px-5 py-4">Delivery Delay</th>
                  <th className="px-5 py-4">Anomaly Indicator</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {data.data.map((order) => {
                  const location = formatCustomerLocation(
                    order.customer_city,
                    order.customer_state
                  )
                  const zscore = order.zscore_in_category
                  const absZscore = zscore != null ? Math.abs(zscore) : null
                  const isExtremeAnomaly = absZscore !== null && absZscore >= 3

                  return (
                    <tr
                      key={order.order_id}
                      className="bg-rose-50/20 hover:bg-rose-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div
                          className="font-mono text-xs font-semibold text-blue-600"
                          title={order.order_id}
                        >
                          {truncateIdentifier(order.order_id, 12)}
                        </div>
                        <div className="text-xs text-gray-500 capitalize mt-0.5">
                          {order.product_category_name?.replace(/_/g, ' ') || 'Uncategorized'}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-gray-900 capitalize">
                          {location.city}, {location.state}
                        </div>
                        <div
                          className="font-mono text-xs text-gray-400 mt-0.5"
                          title={order.customer_id}
                        >
                          {truncateIdentifier(order.customer_id, 10)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {order.seller_id ? (
                          <>
                            <div
                              className="font-mono text-xs text-gray-700"
                              title={order.seller_id}
                            >
                              {truncateIdentifier(order.seller_id, 10)}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {order.seller_state || '—'}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {order.delivery_lag_days !== null ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                order.is_late === 1 ? 'text-rose-600' : 'text-emerald-700'
                              }`}
                            >
                              {order.delivery_lag_days > 0
                                ? `+${order.delivery_lag_days.toFixed(1)} days`
                                : `${order.delivery_lag_days.toFixed(1)} days`}
                            </span>
                            <Badge
                              size="sm"
                              variant={order.is_late === 1 ? 'danger' : 'default'}
                            >
                              {order.is_late === 1 ? 'Late' : 'On Time'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isExtremeAnomaly ? 'danger' : 'warning'}
                            dot
                          >
                            {isExtremeAnomaly ? 'Extreme Anomaly' : 'Category Anomaly'}
                          </Badge>
                          {zscore !== null && zscore !== undefined && (
                            <span className="font-mono text-xs text-gray-500">
                              z={zscore.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <SLAPaginationFooter
            meta={data.meta}
            itemLabel="anomalous orders"
            onPageChange={setPage}
            disabled={isFetching}
          />
        </>
      ) : null}
    </section>
  )
}

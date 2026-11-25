import type { FC } from 'react'
import { useMemo, useState } from 'react'
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
import { useSellerPerformance } from '../hooks/useSLAQueries'
import type { SellerPerformanceItem } from '../types/sla'
import { truncateIdentifier } from '../utils/formatters'
import { SLAPaginationFooter } from './SLAPaginationFooter'

const SELLER_PAGE_SIZE = 10
const HIGH_LATE_RATE_THRESHOLD = 30
const MODERATE_LATE_RATE_THRESHOLD = 15

interface SellerChartDatum extends SellerPerformanceItem {
  shortLabel: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: SellerChartDatum }>
}

const SellerTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  const seller = payload?.[0]?.payload
  if (!active || !seller) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-md text-xs space-y-1 max-w-xs">
      <p className="font-mono font-semibold text-gray-900 break-all">
        {seller.seller_id}
      </p>
      <p className="text-gray-500">
        State: <span className="font-semibold text-gray-800">{seller.seller_state || '—'}</span>
      </p>
      <p className="text-rose-600">
        Late Rate:{' '}
        <span className="font-bold">
          {seller.late_delivery_rate.toFixed(2)}%
        </span>
      </p>
      <p className="text-gray-600">
        Late / Total:{' '}
        <span className="font-semibold text-gray-900">
          {seller.late_deliveries.toLocaleString()} /{' '}
          {seller.delivered_orders.toLocaleString()}
        </span>
      </p>
    </div>
  )
}

export const SellerPerformanceSection: FC = () => {
  const [minOrders, setMinOrders] = useState(10)
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, isError, error, refetch } =
    useSellerPerformance({
      min_orders: minOrders,
      page,
      limit: SELLER_PAGE_SIZE,
    })

  const chartData = useMemo<SellerChartDatum[]>(() => {
    if (!data?.data) return []
    return [...data.data]
      .sort(
        (a, b) =>
          b.late_delivery_rate - a.late_delivery_rate ||
          b.late_deliveries - a.late_deliveries
      )
      .map((seller) => ({
        ...seller,
        shortLabel: `${truncateIdentifier(seller.seller_id, 8)}${
          seller.seller_state ? ` (${seller.seller_state})` : ''
        }`,
      }))
  }, [data?.data])

  const handleMinOrdersChange = (nextMin: number) => {
    setMinOrders(nextMin)
    setPage(1)
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Seller Performance
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Seller-wise delivery SLA ranked by highest late-delivery rate
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
            <span className="font-medium text-gray-500">Min delivered orders:</span>
            <select
              value={minOrders}
              onChange={(e) => handleMinOrdersChange(Number(e.target.value))}
              aria-label="Minimum delivered orders per seller"
              className="bg-transparent font-semibold text-gray-800 focus:outline-none"
            >
              <option value={5}>5+</option>
              <option value={10}>10+</option>
              <option value={25}>25+</option>
              <option value={50}>50+</option>
              <option value={100}>100+</option>
            </select>
          </label>

          {data && (
            <span className="text-xs font-medium text-gray-500">
              {data.total_sellers.toLocaleString()} qualifying sellers
            </span>
          )}
        </div>
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
            {error?.message || 'Unable to load seller performance'}
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
          title="No sellers match this threshold"
          description={`No sellers found with at least ${minOrders} delivered orders.`}
        />
      ) : data ? (
        <>
          {/* Horizontal Bar Chart for current page */}
          {chartData.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Late Delivery Rate — Current Page ({chartData.length} sellers)
                </p>
                <span className="text-[11px] text-gray-400">
                  Page {data.meta.page} of {Math.max(1, data.meta.total_pages)}
                </span>
              </div>

              <div
                className="w-full"
                style={{ height: `${Math.max(220, chartData.length * 32)}px` }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                      tickFormatter={(value: number) => `${value}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="shortLabel"
                      width={132}
                      tick={{ fill: '#334155', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      content={<SellerTooltip />}
                    />
                    <Bar
                      dataKey="late_delivery_rate"
                      name="Late Delivery Rate"
                      radius={[0, 6, 6, 0]}
                      barSize={18}
                    >
                      {chartData.map((seller) => {
                        const fill =
                          seller.late_delivery_rate >= HIGH_LATE_RATE_THRESHOLD
                            ? '#f43f5e'
                            : seller.late_delivery_rate >= MODERATE_LATE_RATE_THRESHOLD
                              ? '#fbbf24'
                              : '#10b981'
                        return <Cell key={seller.seller_id} fill={fill} />
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Seller Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-5 py-4">Seller ID</th>
                  <th className="px-5 py-4">State</th>
                  <th className="px-5 py-4">Total Orders</th>
                  <th className="px-5 py-4">Late Deliveries</th>
                  <th className="px-5 py-4 min-w-[220px]">Late Delivery Rate</th>
                  <th className="px-5 py-4">Avg Late Delay</th>
                  <th className="px-5 py-4">Risk Level</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {data.data.map((seller) => {
                  const isHighLateRate =
                    seller.late_delivery_rate >= HIGH_LATE_RATE_THRESHOLD
                  const isModerateLateRate =
                    seller.late_delivery_rate >= MODERATE_LATE_RATE_THRESHOLD &&
                    seller.late_delivery_rate < HIGH_LATE_RATE_THRESHOLD

                  return (
                    <tr
                      key={seller.seller_id}
                      className={`transition-colors ${
                        isHighLateRate
                          ? 'bg-rose-50/40 hover:bg-rose-50/70'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span
                          className="font-mono text-xs font-semibold text-gray-800"
                          title={seller.seller_id}
                        >
                          {truncateIdentifier(seller.seller_id, 14)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-gray-600">
                        {seller.seller_state || '—'}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-800">
                        {seller.delivered_orders.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 font-medium text-rose-600">
                        {seller.late_deliveries.toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isHighLateRate
                                  ? 'bg-rose-500'
                                  : isModerateLateRate
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-500'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(0, seller.late_delivery_rate))}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-800 w-14 text-right">
                            {seller.late_delivery_rate.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                        {seller.average_late_delay_days.toFixed(1)} days
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {isHighLateRate ? (
                          <Badge variant="danger" dot>
                            High Delay
                          </Badge>
                        ) : isModerateLateRate ? (
                          <Badge variant="warning" dot>
                            Elevated
                          </Badge>
                        ) : (
                          <Badge variant="success" dot>
                            Healthy
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <SLAPaginationFooter
            meta={data.meta}
            itemLabel="sellers"
            onPageChange={setPage}
            disabled={isFetching}
          />
        </>
      ) : null}
    </section>
  )
}

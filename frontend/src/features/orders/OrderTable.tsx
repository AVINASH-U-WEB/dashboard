import React from 'react'
import { Order, PaginationMeta } from '../../types/order'
import { StatusChip } from './StatusChip'
import { AnomalyBadge } from './AnomalyBadge'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MapPin,
  AlertCircle,
} from 'lucide-react'
import { useStats } from './useStats'

interface OrderTableProps {
  orders: Order[]
  meta?: PaginationMeta
  isLoading: boolean
  currentPage: number
  pageSize: number
  selectedStatus: string
  onStatusChange: (s: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'shipped', label: 'Shipped (In-Transit)' },
  { id: 'processing', label: 'Processing' },
  { id: 'canceled', label: 'Canceled' },
  { id: 'invoiced', label: 'Invoiced' },
]

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  meta,
  isLoading,
  currentPage,
  pageSize,
  selectedStatus,
  onStatusChange,
  onPageChange,
  onPageSizeChange,
}) => {
  const { data: stats } = useStats()
  const total = meta?.total ?? orders.length
  const totalPages = meta?.total_pages ?? Math.max(1, Math.ceil(total / pageSize))
  const startRow = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRow = Math.min(currentPage * pageSize, total)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const delta = 2
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  const statusCount = (id: string) => {
    if (id === 'all') return stats?.total ?? 99441
    if (id === 'shipped') return stats?.by_status?.shipped ?? 1107
    return stats?.by_status?.[id] ?? 0
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
      {/* ── Table Header Strip ── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#14141f] tracking-tight">
            Orders Ledger
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Verified Brazilian e-commerce fulfillment records
          </p>
        </div>

        {/* Status Tabs — Intelly Pill Style */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#f5f5f0] p-1.5 rounded-2xl border border-gray-200/60">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.id
            const count = statusCount(tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#14141f] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-500'
                  }`}
                >
                  {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value))
              onPageChange(1)
            }}
            className="px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="font-semibold text-gray-700">
            {startRow.toLocaleString()}–{endRow.toLocaleString()} of {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Table Content ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Order ID</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Purchase Date</th>
              <th className="py-3.5 px-4">Customer Location</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Fulfillment Lag</th>
              <th className="py-3.5 px-4">Merchant Delay</th>
              <th className="py-3.5 px-6">Status Flag</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {isLoading && orders.length === 0 ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="py-4 px-6">
                    <div className="h-6 bg-gray-100 rounded-lg animate-pulse" />
                  </td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-bold text-gray-600">No orders match the selected filters</p>
                  <p className="text-xs text-gray-400 mt-1">Try resetting the date range or status filter.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const lag = order.delivery_lag_days
                const lagFormatted =
                  lag != null ? (
                    lag > 0 ? (
                      <span className="font-bold text-rose-500">+{lag.toFixed(1)}d late</span>
                    ) : lag < 0 ? (
                      <span className="font-bold text-emerald-600">{Math.abs(lag).toFixed(1)}d early</span>
                    ) : (
                      <span className="text-gray-400 font-medium">On schedule</span>
                    )
                  ) : (
                    <span className="text-gray-300">—</span>
                  )

                const sellerRate = order.seller_late_rate ?? 0
                const sellerRatePct = (sellerRate * 100).toFixed(0)

                return (
                  <tr
                    key={order.order_id}
                    className="hover:bg-gray-50/70 transition-colors text-gray-700"
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-6 font-mono font-bold text-[#14141f]">
                      <span title={order.order_id} className="cursor-pointer hover:text-yellow-600">
                        {order.order_id.slice(0, 8)}...
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusChip status={order.order_status} />
                    </td>

                    {/* Purchase Date */}
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap font-medium">
                      {order.order_purchase_timestamp
                        ? order.order_purchase_timestamp.slice(0, 10)
                        : '—'}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>
                          {order.customer_city || '—'}, {order.customer_state || ''}
                        </span>
                      </div>
                    </td>

                    {/* Category & Shipping Fee */}
                    <td
                      className="py-3.5 px-4 max-w-[150px]"
                      title={order.product_category_name || ''}
                    >
                      <p className="capitalize text-gray-700 font-semibold truncate text-[11px]">
                        {order.product_category_name?.replace(/_/g, ' ') || 'General'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Shipping: R$ {order.freight_value ? order.freight_value.toFixed(2) : '0.00'}
                      </p>
                    </td>

                    {/* Fulfillment Lag */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium">{lagFormatted}</td>

                    {/* Merchant Delay */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              sellerRate > 0.3
                                ? 'bg-rose-500'
                                : sellerRate > 0.15
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(6, sellerRate * 100))}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-gray-500">{sellerRatePct}%</span>
                      </div>
                    </td>

                    {/* Status Flag */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      {order.is_anomaly ? (
                        <AnomalyBadge isAnomaly={order.is_anomaly} zscore={order.zscore_in_category} />
                      ) : (
                        <span className="text-gray-400 font-medium text-[11px]">Standard</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Classic Numbered Pagination Bar ── */}
      <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-gray-500 font-medium">
          Page <span className="font-bold text-[#14141f]">{currentPage}</span> of{' '}
          <span className="font-bold text-[#14141f]">{totalPages.toLocaleString()}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="First page"
            className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous page"
            className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={`dots-${idx}`} className="px-2 text-gray-300 font-bold">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`min-w-[32px] h-8 px-2.5 rounded-xl font-bold text-xs transition-all ${
                    p === currentPage
                      ? 'bg-[#14141f] text-white shadow-xs'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next page"
            className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last page"
            className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

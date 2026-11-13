import React from 'react'
import { Order, PaginationMeta } from '../../types/order'
import { StatusChip } from './StatusChip'
import { AnomalyBadge } from './AnomalyBadge'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MapPin, AlertCircle } from 'lucide-react'

interface OrderTableProps {
  orders: Order[]
  meta?: PaginationMeta
  isLoading: boolean
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  meta,
  isLoading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
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

  if (isLoading && orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="h-6 w-48 bg-gray-100 rounded-md animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-[#1a1a2e] tracking-tight">Orders Ledger</h2>
          <p className="text-xs text-gray-400 font-medium">Customer shipment records and delivery details</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value))
              onPageChange(1)
            }}
            className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 font-medium focus:outline-none"
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Order ID</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Purchase Date</th>
              <th className="py-3.5 px-4">Customer Location</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Fulfillment</th>
              <th className="py-3.5 px-4">Merchant Delay</th>
              <th className="py-3.5 px-4">Status Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="font-semibold text-gray-600">No orders found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or date range.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const lag = order.delivery_lag_days
                const lagFormatted =
                  lag !== null && lag !== undefined ? (
                    lag > 0 ? (
                      <span className="font-semibold text-rose-500">+{lag.toFixed(1)}d late</span>
                    ) : lag < 0 ? (
                      <span className="font-semibold text-emerald-500">{Math.abs(lag).toFixed(1)}d early</span>
                    ) : (
                      <span className="text-gray-400">On schedule</span>
                    )
                  ) : (
                    <span className="text-gray-300">—</span>
                  )

                const sellerRate = order.seller_late_rate ?? 0
                const sellerRatePct = (sellerRate * 100).toFixed(0)

                return (
                  <tr
                    key={order.order_id}
                    className="hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-[#1a1a2e] text-[11px]">
                      <span title={order.order_id} className="cursor-pointer hover:text-indigo-500">
                        {order.order_id.slice(0, 8)}...
                      </span>
                    </td>

                    {/* Status Chip */}
                    <td className="py-3.5 px-4">
                      <StatusChip status={order.order_status} />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                      {order.order_purchase_timestamp
                        ? order.order_purchase_timestamp.slice(0, 10)
                        : '—'}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                        <span>
                          {order.customer_city || '—'}, {order.customer_state || ''}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td
                      className="py-3.5 px-4 capitalize text-gray-600 truncate max-w-[130px]"
                      title={order.product_category_name || ''}
                    >
                      {order.product_category_name?.replace(/_/g, ' ') || 'General'}
                    </td>

                    {/* Delivery Lag */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{lagFormatted}</td>

                    {/* Seller Late Rate */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sellerRate > 0.3
                                ? 'bg-rose-500'
                                : sellerRate > 0.15
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, sellerRate * 100))}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-gray-500">{sellerRatePct}%</span>
                      </div>
                    </td>

                    {/* Anomaly Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {order.is_anomaly ? (
                        <AnomalyBadge isAnomaly={order.is_anomaly} zscore={order.zscore_in_category} />
                      ) : (
                        <span className="text-[11px] text-gray-400">Standard</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Classic Numbered Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="text-gray-400 text-xs">
          Page <span className="font-semibold text-gray-800">{currentPage}</span> of{' '}
          <span className="font-semibold text-gray-800">{totalPages.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="First page"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous page"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-gray-300">
                    ...
                  </span>
                )
              }
              const pageNum = p as number
              const isCurrent = pageNum === currentPage
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg font-medium text-xs transition-all ${
                    isCurrent
                      ? 'bg-[#1a1a2e] text-white shadow-sm font-semibold'
                      : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next page"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last page"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

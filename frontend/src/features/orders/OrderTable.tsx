import React from 'react'
import { Order, PaginationMeta } from '../../types/order'
import { StatusChip } from './StatusChip'
import { AnomalyBadge } from './AnomalyBadge'
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  MapPin, AlertCircle,
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
  { id: 'all',        label: 'All' },
  { id: 'delivered',  label: 'Delivered' },
  { id: 'shipped',    label: 'Shipped' },
  { id: 'processing', label: 'Processing' },
  { id: 'canceled',   label: 'Canceled' },
  { id: 'invoiced',   label: 'Invoiced' },
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
    return stats?.by_status?.[id] ?? 0
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
        <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-11 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ── Section header: "Latest orders" + inline status tabs ── */}
      <div className="px-5 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-[#1a1a2e] tracking-tight">
            Latest orders
          </h2>
          {/* Rows per page */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1) }}
              className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 font-semibold focus:outline-none text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="font-semibold text-gray-600">
              {startRow.toLocaleString()}–{endRow.toLocaleString()} of {total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Inline filter tabs — exactly like "All | Telemedicine | In-clinic | Insurance" */}
        <div className="flex items-center gap-0 border-b border-gray-100">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.id
            const count = statusCount(tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className={`relative px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#1a1a2e] border-b-2 border-[#1a1a2e] -mb-px'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-[#1a1a2e] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {count > 999 ? `${(count / 1000).toFixed(0)}k` : count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-50/60 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-5">Type</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Fulfillment</th>
              <th className="py-3 px-4">Merchant Delay</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="font-semibold text-gray-500">No orders found</p>
                  <p className="text-xs text-gray-300 mt-1">Try adjusting filters or date range.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const lag = order.delivery_lag_days
                const lagEl =
                  lag != null ? (
                    lag > 0 ? (
                      <span className="font-semibold text-rose-500">+{lag.toFixed(1)}d</span>
                    ) : lag < 0 ? (
                      <span className="font-semibold text-emerald-500">{Math.abs(lag).toFixed(1)}d early</span>
                    ) : (
                      <span className="text-gray-400">On time</span>
                    )
                  ) : (
                    <span className="text-gray-200">—</span>
                  )

                const sellerRate = order.seller_late_rate ?? 0
                const sellerRatePct = (sellerRate * 100).toFixed(0)

                // Estimated delivery (purchase + ~8 days)
                const purchaseDate = order.order_purchase_timestamp?.slice(0, 10) ?? null
                const dueDate = purchaseDate
                  ? new Date(new Date(purchaseDate).getTime() + 8 * 86400000)
                      .toISOString()
                      .slice(0, 10)
                  : null

                return (
                  <tr key={order.order_id} className="hover:bg-gray-50/70 transition-colors group">
                    {/* Type / Order ID */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-black text-gray-500 uppercase">
                            {(order.order_status || 'ord').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-mono font-semibold text-[#1a1a2e] text-[11px]" title={order.order_id}>
                            #{order.order_id.slice(0, 8)}
                          </p>
                          <p className="text-[10px] text-gray-400 capitalize">
                            {order.order_status}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                      {purchaseDate ?? '—'}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                        <span className="text-[11px]">
                          {order.customer_city || '—'}, {order.customer_state || ''}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td
                      className="py-3.5 px-4 capitalize text-gray-500 truncate max-w-[110px] text-[11px]"
                      title={order.product_category_name || ''}
                    >
                      {order.product_category_name?.replace(/_/g, ' ') || 'General'}
                    </td>

                    {/* Delivery lag */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{lagEl}</td>

                    {/* Seller late rate */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sellerRate > 0.3 ? 'bg-rose-400' : sellerRate > 0.15 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, sellerRate * 100))}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">{sellerRatePct}%</span>
                      </div>
                    </td>

                    {/* Due date */}
                    <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                      {dueDate ?? '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {order.is_anomaly ? (
                        <AnomalyBadge isAnomaly={order.is_anomaly} zscore={order.zscore_in_category} />
                      ) : (
                        <StatusChip status={order.order_status} />
                      )}
                    </td>

                    {/* Action icons */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" title="Copy ID">
                          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" title="Flag">
                          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-gray-400">
          Page <span className="font-bold text-gray-700">{currentPage}</span> of{' '}
          <span className="font-bold text-gray-700">{totalPages.toLocaleString()}</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((p, idx) =>
            p === '...' ? (
              <span key={`d${idx}`} className="px-1.5 text-gray-300">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`min-w-[30px] h-7 px-2 rounded-lg font-semibold text-xs transition-all ${
                  p === currentPage
                    ? 'bg-[#1a1a2e] text-white'
                    : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

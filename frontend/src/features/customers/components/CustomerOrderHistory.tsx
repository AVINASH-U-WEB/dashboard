import { useState, useMemo, useRef, useEffect, type FC } from 'react'
import { AlertCircle, ArrowDown, ArrowUp, Check, Copy, Package } from 'lucide-react'
import { useCustomerOrders } from '../hooks/useCustomerOrders'
import { Badge } from '../../../shared/components/ui/Badge'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Pagination } from '../../../shared/components/ui/Pagination'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import {
  formatDate,
  formatStatusLabel,
  getOrderStatusVariant,
  parseTimestamp,
} from '../utils/formatters'

export interface CustomerOrderHistoryProps {
  customerId: string
}

type SortOrder = 'desc' | 'asc'

const ORDERS_PAGE_SIZE = 5

export const CustomerOrderHistory: FC<CustomerOrderHistoryProps> = ({
  customerId,
}) => {
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  const { data, isLoading, isError, error, refetch, isFetching } =
    useCustomerOrders(customerId, page, ORDERS_PAGE_SIZE)

  const sortedOrders = useMemo(() => {
    const rawOrders = data?.orders ?? []
    if (rawOrders.length <= 1) return rawOrders

    return [...rawOrders].sort((a, b) => {
      const dateA = parseTimestamp(a.order_purchase_timestamp)
      const dateB = parseTimestamp(b.order_purchase_timestamp)

      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      const diff = dateA.getTime() - dateB.getTime()
      return sortOrder === 'asc' ? diff : -diff
    })
  }, [data?.orders, sortOrder])

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }

  const handleCopyOrderId = async (orderId: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderId)
      }
      setCopiedOrderId(orderId)
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = setTimeout(() => {
        setCopiedOrderId(null)
      }, 1500)
    } catch {
      // Clipboard API may be restricted in non-secure contexts
    }
  }

  return (
    <section aria-label="Customer order history" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Order History
        </h3>
        {data && (
          <span className="text-xs text-gray-500 tabular-nums">
            {data.total_orders.toLocaleString()}{' '}
            {data.total_orders === 1 ? 'order' : 'orders'}
            {isFetching && !isLoading ? ' · Updating…' : ''}
          </span>
        )}
      </div>

      <span className="sr-only" aria-live="polite">
        {copiedOrderId ? `Copied order ID ${copiedOrderId}` : ''}
      </span>

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-3.5">
          <Skeleton count={4} height="2.25rem" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            icon={<AlertCircle className="w-5 h-5 text-rose-500" aria-hidden="true" />}
            title="Unable to load order history"
            description={
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred while fetching customer orders.'
            }
            action={
              <button
                type="button"
                onClick={() => refetch()}
                className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                Try again
              </button>
            }
            className="py-6"
          />
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            icon={<Package className="w-5 h-5 text-gray-500" aria-hidden="true" />}
            title="No orders found"
            description="This customer does not have any orders yet."
            className="py-6"
          />
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-3.5 py-2">Order</th>
                    <th
                      className="px-3.5 py-2"
                      aria-sort={sortOrder === 'desc' ? 'descending' : 'ascending'}
                    >
                      <button
                        type="button"
                        onClick={handleToggleSort}
                        aria-label={`Sort ${
                          data && data.total_pages > 1 ? 'current page ' : ''
                        }by purchase date (${
                          sortOrder === 'desc'
                            ? 'newest first, switch to oldest'
                            : 'oldest first, switch to newest'
                        })`}
                        title={
                          data && data.total_pages > 1
                            ? 'Sorts orders on the current page by purchase date'
                            : 'Sort orders by purchase date'
                        }
                        className="inline-flex items-center gap-1 uppercase tracking-wider text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-sm"
                      >
                        <span>Purchased</span>
                        {sortOrder === 'desc' ? (
                          <ArrowDown className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <ArrowUp className="w-3 h-3" aria-hidden="true" />
                        )}
                      </button>
                    </th>
                    <th className="px-3.5 py-2">Delivery</th>
                    <th className="px-3.5 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {sortedOrders.map((order) => {
                    const isCopied = copiedOrderId === order.order_id

                    return (
                      <tr
                        key={order.order_id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="px-3.5 py-2.5 align-top whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <span
                              title={order.order_id}
                              className="font-mono font-medium text-gray-900"
                            >
                              {order.order_id.slice(0, 10)}…
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyOrderId(order.order_id)}
                              aria-label={
                                isCopied
                                  ? `Copied order ID ${order.order_id}`
                                  : `Copy order ID ${order.order_id}`
                              }
                              title={isCopied ? 'Copied' : 'Copy full order ID'}
                              className="p-1 rounded-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                            >
                              {isCopied ? (
                                <Check
                                  className="w-3 h-3 text-emerald-600"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Copy className="w-3 h-3" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="px-3.5 py-2.5 align-top text-gray-700 tabular-nums whitespace-nowrap">
                          {formatDate(order.order_purchase_timestamp)}
                        </td>

                        <td className="px-3.5 py-2.5 align-top tabular-nums whitespace-nowrap">
                          {order.order_delivered_customer_date ||
                          order.order_estimated_delivery_date ? (
                            <div className="space-y-0.5">
                              {order.order_delivered_customer_date && (
                                <p className="text-gray-800">
                                  <span className="text-gray-500">Delivered:</span>{' '}
                                  {formatDate(order.order_delivered_customer_date)}
                                </p>
                              )}
                              {order.order_estimated_delivery_date && (
                                <p className="text-[11px] text-gray-500">
                                  <span>Est.:</span>{' '}
                                  {formatDate(order.order_estimated_delivery_date)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-3.5 py-2.5 align-top text-right whitespace-nowrap">
                          <Badge
                            variant={getOrderStatusVariant(order.order_status)}
                            size="sm"
                          >
                            {formatStatusLabel(order.order_status)}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {data && data.total_pages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-0.5">
              <p className="text-xs text-gray-500 tabular-nums">
                Page {data.page} of {data.total_pages.toLocaleString()}
              </p>
              <Pagination
                currentPage={data.page}
                totalPages={data.total_pages}
                onPageChange={setPage}
                disabled={isFetching}
              />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

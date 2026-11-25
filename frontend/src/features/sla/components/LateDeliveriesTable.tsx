import type { FC } from 'react'
import { useState } from 'react'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { useLateDeliveries } from '../hooks/useSLAQueries'
import {
  formatCustomerLocation,
  formatDisplayDate,
  truncateIdentifier,
} from '../utils/formatters'

const LATE_DELIVERIES_PAGE_SIZE = 5

export const LateDeliveriesTable: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const {
    data: lateDeliveries,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLateDeliveries(currentPage, LATE_DELIVERIES_PAGE_SIZE)

  const tableBusy = isLoading || isFetching

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Late Deliveries
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Orders delivered after their estimated delivery date
          </p>
        </div>

        {lateDeliveries && (
          <span className="text-sm text-gray-500">
            {lateDeliveries.meta.total.toLocaleString()} late orders
          </span>
        )}
      </div>

      {/* Table Loading */}
      {isLoading && !lateDeliveries && (
        <div className="p-8 text-center text-gray-500 text-sm">
          Loading late deliveries...
        </div>
      )}

      {/* Table Error */}
      {isError && (
        <div className="p-6 flex items-center justify-between gap-4 text-sm text-red-600 bg-red-50/60">
          <span>
            {error?.message || 'Unable to load late deliveries'}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100/60 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Content */}
      {!isError && lateDeliveries && (
        lateDeliveries.data.length === 0 ? (
          <EmptyState
            title="No late deliveries found"
            description="All delivered orders arrived on or before their estimated delivery date."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-5 py-4">Order ID</th>
                    <th className="px-5 py-4">Customer Location</th>
                    <th className="px-5 py-4">Estimated Delivery</th>
                    <th className="px-5 py-4">Actual Delivery</th>
                    <th className="px-5 py-4">Delay</th>
                    <th className="px-5 py-4">Review</th>
                    <th className="px-5 py-4">Anomaly</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {lateDeliveries.data.map((order) => {
                    const location = formatCustomerLocation(
                      order.customer_city,
                      order.customer_state
                    )
                    return (
                      <tr
                        key={order.order_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Order ID */}
                        <td className="px-5 py-4">
                          <span
                            className="font-mono text-xs text-blue-600"
                            title={order.order_id}
                          >
                            {truncateIdentifier(order.order_id, 12)}
                          </span>
                        </td>

                        {/* Customer Location */}
                        <td className="px-5 py-4">
                          <div className="text-gray-900 capitalize">
                            {location.city}
                          </div>
                          <div className="text-xs text-gray-400">
                            {location.state}
                          </div>
                        </td>

                        {/* Estimated Delivery */}
                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                          {formatDisplayDate(order.order_estimated_delivery_date)}
                        </td>

                        {/* Actual Delivery */}
                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                          {formatDisplayDate(order.order_delivered_customer_date)}
                        </td>

                        {/* Delay */}
                        <td className="px-5 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-medium text-xs">
                            {Math.round(order.delivery_lag_days ?? 0)} days
                          </span>
                        </td>

                        {/* Review Score */}
                        <td className="px-5 py-4">
                          {order.review_score !== null ? (
                            <span className="text-gray-700">
                              ⭐ {order.review_score}/5
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>

                        {/* Anomaly */}
                        <td className="px-5 py-4">
                          {order.is_anomaly === 1 ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                              Anomaly
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Late Deliveries Pagination (5 records per page) */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-500">
                Page {lateDeliveries.meta.page} of{' '}
                {lateDeliveries.meta.total_pages}
                {' · '}
                Showing {lateDeliveries.meta.count} orders
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1 || tableBusy}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={
                    currentPage >= lateDeliveries.meta.total_pages || tableBusy
                  }
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )
      )}
    </section>
  )
}

import type { FC } from 'react'
import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Badge } from '../../../shared/components/ui/Badge'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import { useOverdueShipments } from '../hooks/useSLAQueries'
import {
  formatCustomerLocation,
  formatDisplayDate,
  truncateIdentifier,
} from '../utils/formatters'
import { SLAPaginationFooter } from './SLAPaginationFooter'

const OVERDUE_PAGE_SIZE = 10

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export const OverdueShipmentsSection: FC = () => {
  const [asOfDate, setAsOfDate] = useState<string>(getTodayIsoDate)
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, isError, error, refetch } =
    useOverdueShipments({
      as_of_date: asOfDate,
      page,
      limit: OVERDUE_PAGE_SIZE,
    })

  const handleDateChange = (nextDate: string) => {
    setAsOfDate(nextDate)
    setPage(1)
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header & Date Filter */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Overdue Shipments
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Shipped orders past their estimated delivery date as of the selected date
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            <span className="font-medium text-gray-500">As of date:</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => handleDateChange(e.target.value)}
              aria-label="Overdue evaluation date"
              className="bg-transparent text-xs font-semibold text-gray-800 focus:outline-none [color-scheme:light]"
            />
          </label>

          {data && (
            <Badge variant={data.total_overdue_shipments > 0 ? 'warning' : 'success'}>
              {data.total_overdue_shipments.toLocaleString()} overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Missing Date Prompt */}
      {!asOfDate ? (
        <EmptyState
          title="Select a reference date"
          description="Choose a date above to evaluate shipped orders against their estimated delivery dates."
        />
      ) : isLoading && !data ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height="2.5rem" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 flex items-center justify-between gap-4 text-sm text-red-600 bg-red-50/60">
          <span>
            {error?.message || 'Unable to load overdue shipments'}
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
          title="No overdue shipments"
          description={`No shipped orders were past their estimated delivery date as of ${data.reference_date}.`}
        />
      ) : data ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Seller</th>
                  <th className="px-5 py-4">Estimated Delivery</th>
                  <th className="px-5 py-4">Overdue Duration</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {data.data.map((shipment) => {
                  const location = formatCustomerLocation(
                    shipment.customer_city,
                    shipment.customer_state
                  )
                  return (
                    <tr
                      key={shipment.order_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div
                          className="font-mono text-xs font-semibold text-blue-600"
                          title={shipment.order_id}
                        >
                          {truncateIdentifier(shipment.order_id, 12)}
                        </div>
                        <div className="text-xs text-gray-400 capitalize mt-0.5">
                          {shipment.product_category_name?.replace(/_/g, ' ') ||
                            shipment.order_status}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-gray-900 capitalize">
                          {location.city}, {location.state}
                        </div>
                        <div
                          className="font-mono text-xs text-gray-400 mt-0.5"
                          title={shipment.customer_id}
                        >
                          {truncateIdentifier(shipment.customer_id, 10)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {shipment.seller_id ? (
                          <>
                            <div
                              className="font-mono text-xs text-gray-700"
                              title={shipment.seller_id}
                            >
                              {truncateIdentifier(shipment.seller_id, 10)}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {shipment.seller_state || '—'}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                        {formatDisplayDate(shipment.order_estimated_delivery_date)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge
                          variant={shipment.days_overdue > 30 ? 'danger' : 'warning'}
                        >
                          {shipment.days_overdue.toLocaleString()} days overdue
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <SLAPaginationFooter
            meta={data.meta}
            itemLabel="shipments"
            onPageChange={setPage}
            disabled={isFetching}
          />
        </>
      ) : null}
    </section>
  )
}

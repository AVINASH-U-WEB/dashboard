import { useState, useId, type FC } from 'react'
import { AlertCircle, Info } from 'lucide-react'
import { useCustomerSummary } from '../hooks/useCustomerSummary'
import { Badge } from '../../../shared/components/ui/Badge'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import {
  formatCurrency,
  formatDate,
  formatStatusLabel,
  getOrderStatusVariant,
} from '../utils/formatters'

export interface CustomerSummaryCardsProps {
  customerId: string
}

const LIFETIME_SPEND_EXPLANATION =
  'Represents total recorded payment value across all customer orders, including canceled orders.'

export const CustomerSummaryCards: FC<CustomerSummaryCardsProps> = ({
  customerId,
}) => {
  const [showSpendTooltip, setShowSpendTooltip] = useState(false)
  const tooltipId = useId()

  const { data: summary, isLoading, isError, error, refetch } =
    useCustomerSummary(customerId)

  if (isLoading) {
    return (
      <section aria-label="Customer summary metrics" className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Summary
        </h3>
        <div className="grid grid-cols-2 gap-px bg-gray-200 rounded-lg border border-gray-200 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-white px-3.5 py-3">
              <Skeleton count={2} height="0.875rem" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section aria-label="Customer summary metrics" className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Summary
        </h3>
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            icon={<AlertCircle className="w-5 h-5 text-rose-500" aria-hidden="true" />}
            title="Unable to load customer summary"
            description={
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred while fetching summary metrics.'
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
      </section>
    )
  }

  if (!summary) {
    return (
      <section aria-label="Customer summary metrics" className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Summary
        </h3>
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            title="No summary available"
            description="No purchase summary metrics were found for this customer."
            className="py-6"
          />
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Customer summary metrics" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Summary
        </h3>
        <span className="text-xs text-gray-500">
          {summary.customer_type} customer
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-200 rounded-lg border border-gray-200">
        <div className="relative bg-white px-3.5 py-3 min-w-0 rounded-tl-lg">
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-gray-500">Lifetime Spend</p>
            <button
              type="button"
              onClick={() => setShowSpendTooltip((prev) => !prev)}
              onMouseEnter={() => setShowSpendTooltip(true)}
              onMouseLeave={() => setShowSpendTooltip(false)}
              onFocus={() => setShowSpendTooltip(true)}
              onBlur={() => setShowSpendTooltip(false)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.stopPropagation()
                  setShowSpendTooltip(false)
                }
              }}
              aria-label="Lifetime spend calculation details"
              aria-expanded={showSpendTooltip}
              aria-describedby={showSpendTooltip ? tooltipId : undefined}
              title={LIFETIME_SPEND_EXPLANATION}
              className="text-gray-400 hover:text-gray-600 focus:text-gray-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {showSpendTooltip && (
            <div
              id={tooltipId}
              role="tooltip"
              className="absolute left-3 top-9 z-20 w-56 max-w-[calc(100vw-4rem)] rounded-md border border-gray-200 bg-gray-900 px-2.5 py-2 text-[11px] leading-relaxed text-white shadow-md"
            >
              {LIFETIME_SPEND_EXPLANATION}
            </div>
          )}

          <p className="mt-1 text-base font-semibold text-gray-900 tabular-nums truncate">
            {formatCurrency(summary.lifetime_spend)}
          </p>
        </div>

        <div className="bg-white px-3.5 py-3 min-w-0 rounded-tr-lg">
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="mt-1 text-base font-semibold text-gray-900 tabular-nums">
            {summary.total_orders.toLocaleString()}
          </p>
        </div>

        <div className="bg-white px-3.5 py-3 min-w-0 rounded-bl-lg">
          <p className="text-xs text-gray-500">Average Order Value</p>
          <p className="mt-1 text-base font-semibold text-gray-900 tabular-nums truncate">
            {formatCurrency(summary.average_order_value)}
          </p>
        </div>

        <div className="bg-white px-3.5 py-3 min-w-0 rounded-br-lg">
          <p className="text-xs text-gray-500">Last Order Status</p>
          <div className="mt-1.5">
            {summary.last_order_status ? (
              <Badge
                variant={getOrderStatusVariant(summary.last_order_status)}
                size="sm"
              >
                {formatStatusLabel(summary.last_order_status)}
              </Badge>
            ) : (
              <span className="text-sm font-medium text-gray-500">—</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-0.5 text-xs text-gray-500">
        <span>
          First purchase:{' '}
          <span className="font-medium text-gray-700 tabular-nums">
            {formatDate(summary.first_purchase)}
          </span>
        </span>
        <span>
          Last purchase:{' '}
          <span className="font-medium text-gray-700 tabular-nums">
            {formatDate(summary.last_purchase)}
          </span>
        </span>
      </div>
    </section>
  )
}

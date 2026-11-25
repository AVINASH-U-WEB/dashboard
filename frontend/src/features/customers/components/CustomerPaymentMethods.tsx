import type { FC } from 'react'
import { AlertCircle, CreditCard } from 'lucide-react'
import { useCustomerPayments } from '../hooks/useCustomerPayments'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import { formatCurrency, formatPaymentType } from '../utils/formatters'

export interface CustomerPaymentMethodsProps {
  customerId: string
}

export const CustomerPaymentMethods: FC<CustomerPaymentMethodsProps> = ({
  customerId,
}) => {
  const { data, isLoading, isError, error, refetch } =
    useCustomerPayments(customerId)

  const methods = data?.payment_methods ?? []
  const hasTotalValue = (data?.total_payment_value ?? 0) > 0

  return (
    <section aria-label="Customer payment methods" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Payment Methods
        </h3>
        {data && (
          <span className="text-xs text-gray-500 tabular-nums">
            Total{' '}
            <span className="font-medium text-gray-800">
              {formatCurrency(data.total_payment_value)}
            </span>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-3.5">
          <Skeleton count={2} height="2rem" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            icon={<AlertCircle className="w-5 h-5 text-rose-500" aria-hidden="true" />}
            title="Unable to load payment methods"
            description={
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred while fetching payment details.'
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
      ) : methods.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            icon={<CreditCard className="w-5 h-5 text-gray-500" aria-hidden="true" />}
            title="No payment records"
            description="No payment method breakdown is available for this customer."
            className="py-6"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
          {methods.map((method) => {
            const showPercentage =
              hasTotalValue && Number.isFinite(method.percentage)
            const clampedPct = Math.min(100, Math.max(0, method.percentage))

            return (
              <div key={method.payment_type} className="px-3.5 py-2.5 space-y-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {formatPaymentType(method.payment_type)}
                    </span>
                    <span className="text-xs text-gray-500 tabular-nums shrink-0">
                      {method.payment_count.toLocaleString()}{' '}
                      {method.payment_count === 1 ? 'payment' : 'payments'}
                    </span>
                  </div>

                  <div className="text-right shrink-0 tabular-nums">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(method.total_amount)}
                    </span>
                    {showPercentage && (
                      <span className="ml-2 text-xs text-gray-500">
                        {method.percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                {showPercentage && (
                  <div
                    className="h-1 w-full rounded-full bg-gray-100 overflow-hidden"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-gray-700 transition-all"
                      style={{ width: `${clampedPct}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

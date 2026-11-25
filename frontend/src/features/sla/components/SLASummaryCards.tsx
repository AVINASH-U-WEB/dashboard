import type { FC } from 'react'
import {
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Timer,
} from 'lucide-react'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import type { SLASummary } from '../types/sla'

export interface SLASummaryCardsProps {
  summary?: SLASummary
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry?: () => void
}

export const SLASummaryCards: FC<SLASummaryCardsProps> = ({
  summary,
  isLoading,
  isError,
  error,
  onRetry,
}) => {
  if (isLoading && !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3"
          >
            <Skeleton width="55%" height="0.875rem" />
            <Skeleton width="45%" height="1.75rem" />
            <Skeleton width="70%" height="0.75rem" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-red-700 text-sm">
            Failed to load SLA summary metrics
          </h2>
          <p className="mt-1 text-xs text-red-600">
            {error?.message || 'Unable to load SLA summary'}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3.5 py-2 rounded-xl bg-white border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100/60 transition-colors shrink-0"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const metrics = [
    {
      title: 'Total Orders',
      value: summary.total_orders.toLocaleString(),
      description: 'Orders in dataset',
      icon: Package,
      iconBg: 'bg-slate-100 text-slate-700',
    },
    {
      title: 'Delivered Orders',
      value: summary.delivered_orders.toLocaleString(),
      description: 'Successfully delivered',
      icon: CheckCircle2,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      title: 'On-Time Deliveries',
      value: summary.on_time_deliveries.toLocaleString(),
      description: `${summary.on_time_delivery_rate.toFixed(2)}% of delivered orders`,
      icon: Clock,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Late Deliveries',
      value: summary.late_deliveries.toLocaleString(),
      description: `${summary.late_delivery_rate.toFixed(2)}% of delivered orders`,
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Average Late Delay',
      value: `${summary.average_late_delay_days.toFixed(2)} days`,
      description: 'Average delay for late orders',
      icon: Timer,
      iconBg: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <div
            key={metric.title}
            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {metric.title}
              </p>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${metric.iconBg}`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
              {metric.value}
            </p>
            <p className="mt-2 text-xs text-gray-500">{metric.description}</p>
          </div>
        )
      })}
    </div>
  )
}

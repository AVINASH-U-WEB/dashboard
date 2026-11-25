import { useEffect, useMemo, useRef, useState, type FC } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
} from 'lucide-react'
import { useCustomerOrders } from '../hooks/useCustomerOrders'
import { Badge } from '../../../shared/components/ui/Badge'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import {
  formatDate,
  formatDateTime,
  formatStatusLabel,
  getOrderStatusVariant,
  parseTimestamp,
} from '../utils/formatters'

export interface CustomerActivityTimelineProps {
  customerId: string
}

type MilestoneKind = 'approved' | 'shipped' | 'delivered'

interface OrderMilestone {
  id: string
  timestamp: string
  timeMs: number
  label: string
  kind: MilestoneKind
  orderPriority: number
}

interface OrderActivityGroup {
  orderId: string
  orderStatus: string
  purchaseTimestamp: string | null
  latestActivityMs: number
  milestones: OrderMilestone[]
}

const DOT_STYLES: Record<MilestoneKind, string> = {
  approved: 'bg-gray-500',
  shipped: 'bg-sky-500',
  delivered: 'bg-emerald-500',
}

const RECENT_ORDERS_LIMIT = 5

export const CustomerActivityTimeline: FC<CustomerActivityTimelineProps> = ({
  customerId,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  )
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCustomerOrders(customerId, 1, RECENT_ORDERS_LIMIT)

  const orderGroups = useMemo<OrderActivityGroup[]>(() => {
    const orders = ordersData?.orders ?? []

    const groups: OrderActivityGroup[] = orders.map((order) => {
      const milestones: OrderMilestone[] = []

      const pushMilestone = (
        timestamp: string | null,
        idSuffix: string,
        label: string,
        kind: MilestoneKind,
        orderPriority: number,
      ) => {
        if (!timestamp) return
        const parsed = parseTimestamp(timestamp)
        if (!parsed) return
        milestones.push({
          id: `${order.order_id}-${idSuffix}`,
          timestamp,
          timeMs: parsed.getTime(),
          label,
          kind,
          orderPriority,
        })
      }

      pushMilestone(
        order.order_approved_at,
        'approved',
        'Payment approved',
        'approved',
        1,
      )
      pushMilestone(
        order.order_delivered_carrier_date,
        'carrier',
        'Handed to carrier',
        'shipped',
        2,
      )
      pushMilestone(
        order.order_delivered_customer_date,
        'delivered',
        'Delivered to customer',
        'delivered',
        3,
      )

      // Chronological ascending order inside each order lifecycle
      milestones.sort((a, b) => {
        if (a.timeMs !== b.timeMs) {
          return a.timeMs - b.timeMs
        }
        return a.orderPriority - b.orderPriority
      })

      const purchaseMs =
        parseTimestamp(order.order_purchase_timestamp)?.getTime() ?? 0
      const latestActivityMs = milestones.reduce(
        (max, item) => Math.max(max, item.timeMs),
        purchaseMs,
      )

      return {
        orderId: order.order_id,
        orderStatus: order.order_status,
        purchaseTimestamp: order.order_purchase_timestamp,
        latestActivityMs,
        milestones,
      }
    })

    // Most recently active order first at the group level
    return groups.sort((a, b) => b.latestActivityMs - a.latestActivityMs)
  }, [ordersData?.orders])

  const handleToggleGroup = (orderId: string, defaultExpanded: boolean) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [orderId]: !(prev[orderId] ?? defaultExpanded),
    }))
  }

  const handleCopyOrderId = async (orderId: string) => {
    if (!navigator.clipboard?.writeText) {
      return
    }

    try {
      await navigator.clipboard.writeText(orderId)
      setCopiedOrderId(orderId)
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = setTimeout(() => {
        setCopiedOrderId(null)
      }, 1500)
    } catch {
      // Clipboard write failed or permission denied
    }
  }

  return (
    <section aria-label="Recent order activity" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Recent Order Activity
        </h3>
        {ordersData && orderGroups.length > 0 && (
          <span className="text-xs text-gray-500 tabular-nums">
            {ordersData.total_orders > RECENT_ORDERS_LIMIT
              ? `Showing latest ${RECENT_ORDERS_LIMIT} of ${ordersData.total_orders.toLocaleString()} orders`
              : `${orderGroups.length} ${orderGroups.length === 1 ? 'order' : 'orders'} (fetches latest ${RECENT_ORDERS_LIMIT})`}
          </span>
        )}
      </div>

      <span className="sr-only" aria-live="polite">
        {copiedOrderId ? `Copied order ID ${copiedOrderId}` : ''}
      </span>

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-3.5">
          <Skeleton count={3} height="1.5rem" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            icon={<AlertCircle className="w-5 h-5 text-rose-500" aria-hidden="true" />}
            title="Unable to load order activity"
            description={
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred while fetching order activity.'
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
      ) : orderGroups.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            icon={<Clock className="w-5 h-5 text-gray-500" aria-hidden="true" />}
            title="No recorded activity"
            description="No order lifecycle events were found for this customer."
            className="py-6"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
          {orderGroups.map((group, index) => {
            const defaultExpanded = index === 0
            const isExpanded = expandedGroups[group.orderId] ?? defaultExpanded
            const isCopied = copiedOrderId === group.orderId
            const panelId = `order-activity-${group.orderId}`
            const normalizedStatus = (group.orderStatus || '').toLowerCase()
            const isCanceled = normalizedStatus === 'canceled'
            const isUnavailable = normalizedStatus === 'unavailable'

            return (
              <div key={group.orderId}>
                <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-gray-50/70 transition-colors">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleGroup(group.orderId, defaultExpanded)
                      }
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      aria-label={`${
                        isExpanded ? 'Collapse' : 'Expand'
                      } lifecycle events for order ${group.orderId}`}
                      className="flex items-center gap-2 min-w-0 text-left focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-sm"
                    >
                      {isExpanded ? (
                        <ChevronDown
                          className="w-3.5 h-3.5 text-gray-400 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronRight
                          className="w-3.5 h-3.5 text-gray-400 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span
                            title={group.orderId}
                            className="text-xs font-mono font-medium text-gray-900"
                          >
                            {group.orderId.slice(0, 10)}…
                          </span>
                          <span className="text-[11px] text-gray-500 tabular-nums">
                            Placed {formatDate(group.purchaseTimestamp)}
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyOrderId(group.orderId)}
                      aria-label={
                        isCopied
                          ? `Copied order ID ${group.orderId}`
                          : `Copy order ID ${group.orderId}`
                      }
                      title={isCopied ? 'Copied' : 'Copy full order ID'}
                      className="p-1 rounded-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 shrink-0 transition-colors"
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

                  <Badge
                    variant={getOrderStatusVariant(group.orderStatus)}
                    size="sm"
                    className="shrink-0"
                  >
                    {formatStatusLabel(group.orderStatus)}
                  </Badge>
                </div>

                <div
                  id={panelId}
                  hidden={!isExpanded}
                  className={
                    isExpanded
                      ? 'border-t border-gray-100 bg-gray-50/40 px-3.5 py-2.5 pl-8 space-y-2'
                      : 'hidden'
                  }
                >
                  {group.milestones.length === 0 ? (
                    <p className="text-xs text-gray-500">
                      No post-purchase lifecycle timestamps available for this order.
                    </p>
                  ) : (
                    <ol className="relative border-l border-gray-200 ml-1 space-y-2">
                      {group.milestones.map((milestone) => (
                        <li key={milestone.id} className="pl-3.5 relative">
                          <span
                            className={`absolute -left-[3.5px] top-1.5 w-1.5 h-1.5 rounded-full ${DOT_STYLES[milestone.kind]}`}
                            aria-hidden="true"
                          />
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                            <span className="text-xs text-gray-800 font-medium">
                              {milestone.label}
                            </span>
                            <time
                              dateTime={milestone.timestamp}
                              className="text-[11px] text-gray-500 tabular-nums shrink-0"
                            >
                              {formatDateTime(milestone.timestamp)}
                            </time>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  {isCanceled && (
                    <p className="text-[11px] text-gray-500 pt-0.5">
                      Current status: Canceled (cancellation timestamp unavailable in source data).
                    </p>
                  )}

                  {isUnavailable && (
                    <p className="text-[11px] text-gray-500 pt-0.5">
                      Current status: Unavailable (status change timestamp unavailable in source data).
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

import { useMemo, useState, useRef, useEffect, type FC } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  User,
} from 'lucide-react'
import { Drawer } from '../../../shared/components/ui/Drawer'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import { useCustomerProfile } from '../hooks/useCustomerProfile'
import type { CustomerRecord } from '../types/customer'
import { CustomerSummaryCards } from './CustomerSummaryCards'
import { CustomerPaymentMethods } from './CustomerPaymentMethods'
import { CustomerOrderHistory } from './CustomerOrderHistory'
import { CustomerActivityTimeline } from './CustomerActivityTimeline'

export interface CustomerDrawerProps {
  customerId: string | null
  onClose: () => void
}

interface CustomerDrawerContentProps {
  customerId: string
}

interface LocationGroup {
  key: string
  city: string
  state: string
  zipPrefix: string
  records: CustomerRecord[]
}

const CustomerProfileSection: FC<CustomerDrawerContentProps> = ({
  customerId,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  const { data: profile, isLoading, isError, error, refetch } =
    useCustomerProfile(customerId)

  const locationGroups = useMemo<LocationGroup[]>(() => {
    const records = profile?.customer_records ?? []
    const groupMap = new Map<string, LocationGroup>()

    for (const record of records) {
      const city = record.customer_city ?? ''
      const state = record.customer_state ?? ''
      const zipPrefix = record.customer_zip_code_prefix ?? ''
      const key = `${city}\0${state}\0${zipPrefix}`

      const existing = groupMap.get(key)
      if (existing) {
        existing.records.push(record)
      } else {
        groupMap.set(key, {
          key,
          city,
          state,
          zipPrefix,
          records: [record],
        })
      }
    }

    return Array.from(groupMap.values())
  }, [profile?.customer_records])

  const handleToggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleCopyId = async (id: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(id)
      }
      setCopiedId(id)
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = setTimeout(() => {
        setCopiedId(null)
      }, 1500)
    } catch {
      // Clipboard API may be restricted in non-secure contexts
    }
  }

  if (isLoading) {
    return (
      <section aria-label="Customer profile information" className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Profile
        </h3>
        <div className="rounded-lg border border-gray-200 bg-white p-3.5">
          <Skeleton count={2} height="1.25rem" />
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section aria-label="Customer profile information" className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Profile
        </h3>
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            icon={<AlertCircle className="w-5 h-5 text-rose-500" aria-hidden="true" />}
            title="Unable to load customer profile"
            description={
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred while fetching customer details.'
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

  if (!profile) {
    return (
      <section aria-label="Customer profile information" className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Profile
        </h3>
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            icon={<User className="w-5 h-5 text-gray-500" aria-hidden="true" />}
            title="Customer not found"
            description="No profile data was found for this customer ID."
            className="py-6"
          />
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Customer profile information" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Profile
        </h3>
        <span className="text-xs text-gray-500 tabular-nums">
          {locationGroups.length}{' '}
          {locationGroups.length === 1 ? 'location' : 'locations'} ·{' '}
          {profile.record_count}{' '}
          {profile.record_count === 1 ? 'record' : 'records'}
        </span>
      </div>

      <span className="sr-only" aria-live="polite">
        {copiedId ? `Copied ID ${copiedId}` : ''}
      </span>

      <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <span className="text-xs text-gray-500 shrink-0">Unique ID</span>
          <div className="flex items-center gap-1.5 min-w-0 sm:justify-end">
            <span className="text-xs font-mono text-gray-900 break-all select-all">
              {profile.customer_unique_id}
            </span>
            <button
              type="button"
              onClick={() => handleCopyId(profile.customer_unique_id)}
              aria-label={
                copiedId === profile.customer_unique_id
                  ? 'Copied customer unique ID'
                  : 'Copy customer unique ID'
              }
              title={
                copiedId === profile.customer_unique_id
                  ? 'Copied'
                  : 'Copy unique ID'
              }
              className="p-1 rounded-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 shrink-0 transition-colors"
            >
              {copiedId === profile.customer_unique_id ? (
                <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
              ) : (
                <Copy className="w-3 h-3" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {locationGroups.length === 0 ? (
          <EmptyState
            title="No address records"
            description="No location records are linked to this customer profile."
            className="py-6"
          />
        ) : (
          locationGroups.map((group, index) => {
            const isExpanded = Boolean(expandedGroups[group.key])
            const panelId = `customer-location-records-${index}`
            const locationLabel = `${group.city || '—'}${
              group.state ? `, ${group.state}` : ''
            }`

            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => handleToggleGroup(group.key)}
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  aria-label={`${
                    isExpanded ? 'Collapse' : 'Expand'
                  } customer IDs for ${locationLabel}, ZIP ${
                    group.zipPrefix || 'unknown'
                  } (${group.records.length} ${
                    group.records.length === 1 ? 'record' : 'records'
                  })`}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-gray-50/70 focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
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
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {locationLabel}
                      </p>
                      <p className="text-xs text-gray-500 tabular-nums">
                        ZIP {group.zipPrefix || '—'}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-gray-500 tabular-nums shrink-0">
                    {group.records.length}{' '}
                    {group.records.length === 1 ? 'record' : 'records'}
                  </span>
                </button>

                <div
                    id={panelId}
                    hidden={!isExpanded}
                    className="border-t border-gray-100 bg-gray-50/50 px-3.5 py-2 pl-9 space-y-1.5"
                  >
                    <p className="text-[11px] font-medium text-gray-500">
                      Linked Customer Record IDs
                    </p>
                    <ul className="space-y-1">
                      {group.records.map((record) => {
                        const isRecordCopied = copiedId === record.customer_id
                        return (
                          <li
                            key={record.customer_id}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="font-mono text-gray-700 break-all select-all">
                              {record.customer_id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyId(record.customer_id)}
                              aria-label={
                                isRecordCopied
                                  ? `Copied record ID ${record.customer_id}`
                                  : `Copy record ID ${record.customer_id}`
                              }
                              title={
                                isRecordCopied ? 'Copied' : 'Copy record ID'
                              }
                              className="p-1 rounded-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 shrink-0 transition-colors"
                            >
                              {isRecordCopied ? (
                                <Check
                                  className="w-3 h-3 text-emerald-600"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Copy className="w-3 h-3" aria-hidden="true" />
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

const CustomerDrawerContent: FC<CustomerDrawerContentProps> = ({
  customerId,
}) => {
  return (
    <div className="space-y-5">
      <CustomerProfileSection customerId={customerId} />
      <CustomerSummaryCards customerId={customerId} />
      <CustomerPaymentMethods customerId={customerId} />
      <CustomerOrderHistory customerId={customerId} />
      <CustomerActivityTimeline customerId={customerId} />
    </div>
  )
}

export const CustomerDrawer: FC<CustomerDrawerProps> = ({
  customerId,
  onClose,
}) => {
  return (
    <Drawer
      open={Boolean(customerId)}
      onClose={onClose}
      title="Customer Profile"
      description={customerId ?? undefined}
      side="right"
      size="lg"
    >
      {customerId ? (
        <CustomerDrawerContent key={customerId} customerId={customerId} />
      ) : null}
    </Drawer>
  )
}

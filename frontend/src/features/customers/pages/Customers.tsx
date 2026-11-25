import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw, Users, X } from 'lucide-react'
import { useCustomers } from '../hooks/useCustomers'
import { useCustomerDirectoryMeta } from '../hooks/useCustomerDirectoryMeta'
import type { CustomerTypeFilter } from '../types/customer'
import { CustomerDrawer } from '../components/CustomerDrawer'
import { Badge } from '../../../shared/components/ui/Badge'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Pagination } from '../../../shared/components/ui/Pagination'
import { SearchInput } from '../../../shared/components/ui/SearchInput'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import {
  formatCurrency,
  formatDate,
  formatStatusLabel,
  getOrderStatusVariant,
} from '../utils/formatters'

const PAGE_LIMIT = 20

export const Customers = () => {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [state, setState] = useState('')
  const [customerType, setCustomerType] = useState<CustomerTypeFilter | ''>('')
  const [page, setPage] = useState(1)
  const [selectedCustomerId, setSelectedCustomerId] =
    useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const {
    data: meta,
    isLoading: isMetaLoading,
    refetch: refetchMeta,
  } = useCustomerDirectoryMeta()

  const { data, isLoading, isError, error, refetch, isFetching } =
    useCustomers({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch.trim() || undefined,
      state: state || undefined,
      customer_type: customerType || undefined,
      sort_by: 'last_purchase',
      sort_order: 'desc',
    })

  const customers = data?.items ?? []
  const availableStates = meta?.states ?? []
  const hasActiveFilters = Boolean(search.trim() || state || customerType)

  const returningShare =
    meta && meta.total_customers > 0
      ? ((meta.returning_customers / meta.total_customers) * 100).toFixed(1)
      : null

  const handleSearchClear = () => {
    setSearch('')
    setDebouncedSearch('')
    setPage(1)
  }

  const handleStateChange = (value: string) => {
    setState(value)
    setPage(1)
  }

  const handleCustomerTypeChange = (value: string) => {
    if (value === 'New' || value === 'Returning') {
      setCustomerType(value)
    } else {
      setCustomerType('')
    }
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setState('')
    setCustomerType('')
    setPage(1)
  }

  const handleRefresh = () => {
    refetch()
    refetchMeta()
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-5">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <span>Operations</span>
            <span aria-hidden="true">/</span>
            <span className="text-gray-800 font-medium">Customers</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Search profiles, segment returning buyers, and inspect order lifecycles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Compact Directory KPI Summary */}
      <section
        aria-label="Customer directory summary"
        className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-200 rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-gray-500">Total Customers</p>
          {isMetaLoading ? (
            <div className="mt-1.5">
              <Skeleton width="6rem" height="1.5rem" />
            </div>
          ) : (
            <>
              <p className="mt-1 text-xl font-semibold text-gray-900 tabular-nums">
                {meta ? meta.total_customers.toLocaleString() : '—'}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500 tabular-nums">
                {meta
                  ? `${meta.new_customers.toLocaleString()} single-order customers`
                  : 'Directory total'}
              </p>
            </>
          )}
        </div>

        <div className="bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-gray-500">
            Returning Customers
          </p>
          {isMetaLoading ? (
            <div className="mt-1.5">
              <Skeleton width="5rem" height="1.5rem" />
            </div>
          ) : (
            <>
              <p className="mt-1 text-xl font-semibold text-gray-900 tabular-nums">
                {meta ? meta.returning_customers.toLocaleString() : '—'}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500 tabular-nums">
                {returningShare !== null
                  ? `${returningShare}% repeat buyers`
                  : 'Repeat buyers'}
              </p>
            </>
          )}
        </div>

        <div className="bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-gray-500">
            Represented States
          </p>
          {isMetaLoading ? (
            <div className="mt-1.5">
              <Skeleton width="3.5rem" height="1.5rem" />
            </div>
          ) : (
            <>
              <p className="mt-1 text-xl font-semibold text-gray-900 tabular-nums">
                {meta ? meta.states.length.toLocaleString() : '—'}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Active Brazilian states
              </p>
            </>
          )}
        </div>
      </section>

      {/* Compact Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col lg:flex-row lg:items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <SearchInput
            value={search}
            onChange={setSearch}
            onClear={handleSearchClear}
            placeholder="Search customer ID, city, or ZIP prefix..."
            aria-label="Search customers by unique ID, city, or ZIP prefix"
            className="rounded-lg border-gray-200 shadow-none py-1.5 px-3"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={state}
            onChange={(event) => handleStateChange(event.target.value)}
            aria-label="Filter by state"
            disabled={isMetaLoading && availableStates.length === 0}
            className="h-9 min-w-[140px] rounded-lg border border-gray-200 bg-white px-3 text-xs sm:text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">
              {isMetaLoading && availableStates.length === 0
                ? 'Loading states...'
                : 'All states'}
            </option>
            {availableStates.map((stateCode) => (
              <option key={stateCode} value={stateCode}>
                {stateCode}
              </option>
            ))}
          </select>

          <select
            value={customerType}
            onChange={(event) => handleCustomerTypeChange(event.target.value)}
            aria-label="Filter by customer type"
            className="h-9 min-w-[150px] rounded-lg border border-gray-200 bg-white px-3 text-xs sm:text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
          >
            <option value="">All customer types</option>
            <option value="Returning">Returning</option>
            <option value="New">New</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Customers</h2>
            {data && (
              <span className="text-xs text-gray-500 tabular-nums">
                {data.total.toLocaleString()}{' '}
                {data.total === 1 ? 'result' : 'results'}
                {hasActiveFilters ? ' (filtered)' : ''}
              </span>
            )}
          </div>

          <span className="text-xs text-gray-500 tabular-nums">
            {isFetching && !isLoading
              ? 'Updating…'
              : data
                ? `Showing ${customers.length} on page ${data.page}`
                : 'Loading…'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-4">
            <Skeleton count={6} height="2.75rem" rounded="md" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={
              <AlertCircle
                className="w-5 h-5 text-rose-500"
                aria-hidden="true"
              />
            }
            title="Unable to load customers"
            description={
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred while fetching the customer directory.'
            }
            action={
              <button
                type="button"
                onClick={() => refetch()}
                className="px-3.5 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                Try again
              </button>
            }
          />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-5 h-5 text-gray-500" aria-hidden="true" />}
            title="No customers found"
            description={
              hasActiveFilters
                ? 'No customers match your current search or filter criteria.'
                : 'No customer records are available in the directory.'
            }
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5 text-right">Orders</th>
                  <th className="px-4 py-2.5 text-right">Lifetime Spend</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Last Purchase</th>
                  <th className="px-4 py-2.5 text-right">Last Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {customers.map((customer) => {
                  const isSelected =
                    selectedCustomerId === customer.customer_unique_id

                  return (
                    <tr
                      key={customer.customer_unique_id}
                      onClick={() =>
                        setSelectedCustomerId(customer.customer_unique_id)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedCustomerId(customer.customer_unique_id)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View customer ${customer.customer_unique_id}`}
                      className={`transition-colors cursor-pointer outline-none focus:bg-gray-50 ${
                        isSelected ? 'bg-gray-50' : 'hover:bg-gray-50/70'
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p
                          title={customer.customer_unique_id}
                          className="text-xs font-mono font-medium text-gray-900"
                        >
                          {customer.customer_unique_id.slice(0, 12)}…
                        </p>
                        <p className="text-[11px] text-gray-500 tabular-nums mt-0.5">
                          ZIP {customer.customer_zip_code_prefix || '—'}
                        </p>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs font-medium text-gray-900">
                          {customer.customer_city || '—'}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {customer.customer_state || '—'}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-right text-xs font-medium text-gray-700 tabular-nums whitespace-nowrap">
                        {customer.total_orders.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-right text-xs font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                        {formatCurrency(customer.lifetime_spend)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant={
                            customer.customer_type === 'Returning'
                              ? 'info'
                              : 'default'
                          }
                          size="sm"
                        >
                          {customer.customer_type}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-600 tabular-nums whitespace-nowrap">
                        {formatDate(customer.last_purchase)}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {customer.last_order_status ? (
                          <Badge
                            variant={getOrderStatusVariant(
                              customer.last_order_status,
                            )}
                            size="sm"
                          >
                            {formatStatusLabel(customer.last_order_status)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs text-gray-500 tabular-nums">
              Page {data.page} of {data.total_pages.toLocaleString()} ·{' '}
              {data.total.toLocaleString()}{' '}
              {data.total === 1 ? 'customer' : 'customers'}
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

      <CustomerDrawer
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  )
}

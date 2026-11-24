
import { useState } from 'react'
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react'

import { useCustomers } from '../features/customers/hooks/useCustomers'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)

export const Customers = () => {
  const [search, setSearch] = useState('')
  const [state, setState] = useState('')
  const [page, setPage] = useState(1)
  const [selectedCustomerId, setSelectedCustomerId] =
    useState<string | null>(null)

  const limit = 20

  const { data, isLoading, isError, error, refetch, isFetching } =
    useCustomers({
      page,
      limit,
      search,
      state: state.trim().toUpperCase() || undefined,
      sort_by: 'last_purchase',
      sort_order: 'desc',
    })

  const customers = data?.items ?? []

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStateChange = (value: string) => {
    setState(value)
    setPage(1)
  }

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">

      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span>Operations</span>
            <span>/</span>
            <span className="text-gray-800">Customers</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Customer Directory
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Explore customer profiles, purchase history and spending.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Customer count */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-600" />
        </div>

        <div>
          <p className="text-xs text-gray-500 font-medium">
            Total unique customers
          </p>

          <p className="text-2xl font-bold text-gray-900">
            {data?.total.toLocaleString() ?? '—'}
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200">
          <Search className="w-4 h-4 text-gray-400" />

          <input
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search customer ID, city or state..."
            className="flex-1 outline-none text-sm text-gray-800 placeholder:text-gray-400"
          />
        </div>

        <input
          value={state}
          onChange={(event) => handleStateChange(event.target.value)}
          placeholder="Filter state (e.g. SP)"
          maxLength={2}
          className="sm:w-48 px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm uppercase"
        />
      </div>

      {/* Customer table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Customers
          </h2>

          <span className="text-xs text-gray-500">
            {data
              ? `${customers.length} records on this page`
              : 'Loading records'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading customers...
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />

            <p className="text-sm font-medium text-gray-800">
              Unable to load customers
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>

            <button
              onClick={() => refetch()}
              className="mt-4 text-sm font-semibold text-blue-600"
            >
              Try again
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Orders</th>
                  <th className="px-5 py-3 font-semibold">Lifetime spend</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Last purchase</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
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
                    className="hover:bg-blue-50/50 focus:bg-blue-50 transition-colors cursor-pointer outline-none"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-800">
                        {customer.customer_unique_id.slice(0, 12)}...
                      </p>

                      <p className="text-xs text-gray-400">
                        {customer.customer_zip_code_prefix}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-800">
                        {customer.customer_city}
                      </p>

                      <p className="text-xs text-gray-400">
                        {customer.customer_state}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {customer.total_orders}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(customer.lifetime_spend)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          customer.customer_type === 'Returning'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {customer.customer_type}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {customer.last_purchase?.slice(0, 10) ?? '—'}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-600 capitalize">
                        {customer.last_order_status ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {/* Pagination */}
        {data && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">

            <p className="text-xs text-gray-500">
              Page {data.page} of {data.total_pages.toLocaleString()}
              {' · '}
              {data.total.toLocaleString()} customers
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                disabled={page === 1 || isFetching}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  setPage((current) =>
                    Math.min(data.total_pages, current + 1)
                  )
                }
                disabled={page >= data.total_pages || isFetching}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Temporary customer selection indicator */}
      {selectedCustomerId && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-gray-900 text-white p-4 rounded-xl shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">
                Selected customer
              </p>

              <p className="text-sm font-medium break-all">
                {selectedCustomerId}
              </p>
            </div>

            <button
              onClick={() => setSelectedCustomerId(null)}
              className="text-gray-400 hover:text-white"
              aria-label="Clear selected customer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

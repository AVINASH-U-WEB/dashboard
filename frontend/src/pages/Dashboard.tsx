import React, { useState, useMemo, useEffect } from 'react'
import { HeroSection } from '../components/HeroSection'
import { StatsBar } from '../features/orders/StatsBar'
import { FilterBar } from '../features/orders/FilterBar'
import { OrderTable } from '../features/orders/OrderTable'
import { useOrders } from '../features/orders/useOrders'
import { Search, X } from 'lucide-react'

interface DashboardProps {
  searchQuery?: string
  onClearSearch?: () => void
  activePage?: string
}

export const Dashboard: React.FC<DashboardProps> = ({
  searchQuery = '',
  onClearSearch,
  activePage = 'dashboard',
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [isAnomaly, setIsAnomaly] = useState<boolean>(false)
  const [isLate, setIsLate] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(25)

  // React to sidebar navigation clicks
  useEffect(() => {
    if (activePage === 'tickets') {
      setSelectedStatus('all')
      setIsAnomaly(false)
      setIsLate(false)
      setCurrentPage(1)
    } else if (activePage === 'customers') {
      setSelectedStatus('all')
      setIsLate(false)
      setIsAnomaly(false)
      setCurrentPage(1)
    } else if (activePage === 'sla_escalations') {
      setSelectedStatus('all')
      setIsLate(true)
      setIsAnomaly(false)
      setCurrentPage(1)
    } else if (activePage === 'ledger' || activePage === 'dashboard') {
      setSelectedStatus('all')
      setIsAnomaly(false)
      setIsLate(false)
      setCurrentPage(1)
    }
  }, [activePage])

  const { data, isLoading } = useOrders({
    status: selectedStatus,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    is_anomaly: isAnomaly ? 1 : undefined,
    is_late: isLate ? 1 : undefined,
    page: currentPage,
    limit: pageSize,
  })

  const rawOrders = data?.data ?? []
  const meta = data?.meta

  // Real-time client-side filter by search query (city, state, order id, category)
  const orders = useMemo(() => {
    if (!searchQuery.trim()) return rawOrders
    const q = searchQuery.toLowerCase().trim()
    return rawOrders.filter((o) => {
      const city = (o.customer_city || '').toLowerCase()
      const state = (o.customer_state || '').toLowerCase()
      const id = (o.order_id || '').toLowerCase()
      const cat = (o.product_category_name || '').toLowerCase()
      const status = (o.order_status || '').toLowerCase()
      const cityState = `${city}, ${state}`
      return (
        city.includes(q) ||
        state.includes(q) ||
        cityState.includes(q) ||
        id.includes(q) ||
        cat.includes(q) ||
        status.includes(q)
      )
    })
  }, [rawOrders, searchQuery])

  const handleStatusChange = (s: string) => {
    setSelectedStatus(s)
    setCurrentPage(1)
  }
  const handleFromDateChange = (v: string) => {
    setFromDate(v)
    setCurrentPage(1)
  }
  const handleToDateChange = (v: string) => {
    setToDate(v)
    setCurrentPage(1)
  }
  const handleToggleAnomaly = () => {
    setIsAnomaly((a) => !a)
    setCurrentPage(1)
  }
  const handleToggleLate = () => {
    setIsLate((l) => !l)
    setCurrentPage(1)
  }
  const handleResetFilters = () => {
    setSelectedStatus('all')
    setFromDate('')
    setToDate('')
    setIsAnomaly(false)
    setIsLate(false)
    setCurrentPage(1)
    if (onClearSearch) onClearSearch()
  }

  return (
    <div className="px-8 pb-12 space-y-6 max-w-[1600px] mx-auto">
      {/* 1. Header with greeting and live indicators */}
      <HeroSection />

      {/* 2. 4 Consistently Named KPI Cards */}
      <StatsBar />

      {/* Active Search Banner (when user searches) */}
      {searchQuery.trim() && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-2xl text-xs text-yellow-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-yellow-600" />
            <span>
              Searching for: <strong className="font-bold">"{searchQuery}"</strong> · Found{' '}
              <strong className="font-bold">{orders.length}</strong> matching orders on this page
            </span>
          </div>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="flex items-center gap-1 text-[11px] font-bold text-yellow-800 hover:text-black bg-yellow-200/60 hover:bg-yellow-200 px-2 py-0.5 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear search</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Filter Bar */}
      <FilterBar
        fromDate={fromDate}
        toDate={toDate}
        isAnomaly={isAnomaly}
        isLate={isLate}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onToggleAnomaly={handleToggleAnomaly}
        onToggleLate={handleToggleLate}
        onReset={handleResetFilters}
        totalCount={searchQuery.trim() ? orders.length : meta?.total}
      />

      {/* 4. Full Orders Ledger Table with status pills & numbered pagination */}
      <OrderTable
        orders={orders}
        meta={meta}
        isLoading={isLoading}
        currentPage={currentPage}
        pageSize={pageSize}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}

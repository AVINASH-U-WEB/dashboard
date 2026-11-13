import React, { useState } from 'react'
import { HeroSection } from '../components/HeroSection'
import { StatsBar } from '../features/orders/StatsBar'
import { FilterBar } from '../features/orders/FilterBar'
import { OrderTable } from '../features/orders/OrderTable'
import { useOrders } from '../features/orders/useOrders'

export const Dashboard: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [isAnomaly, setIsAnomaly] = useState<boolean>(false)
  const [isLate, setIsLate] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(25)

  const { data, isLoading } = useOrders({
    status: selectedStatus,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    is_anomaly: isAnomaly ? 1 : undefined,
    is_late: isLate ? 1 : undefined,
    page: currentPage,
    limit: pageSize,
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  const handleStatusChange = (s: string) => { setSelectedStatus(s); setCurrentPage(1) }
  const handleFromDateChange = (v: string) => { setFromDate(v); setCurrentPage(1) }
  const handleToDateChange = (v: string) => { setToDate(v); setCurrentPage(1) }
  const handleToggleAnomaly = () => { setIsAnomaly(a => !a); setCurrentPage(1) }
  const handleToggleLate = () => { setIsLate(l => !l); setCurrentPage(1) }
  const handleResetFilters = () => {
    setSelectedStatus('all'); setFromDate(''); setToDate('')
    setIsAnomaly(false); setIsLate(false); setCurrentPage(1)
  }

  return (
    <div className="pb-10">
      {/* Page heading */}
      <HeroSection />

      {/* Two-column body: left = KPI cards, right = table */}
      <div className="mt-6 px-6 flex gap-5 items-start">

        {/* ── LEFT COLUMN: stacked KPI cards (fixed width) ── */}
        <div className="w-64 shrink-0">
          <StatsBar />
        </div>

        {/* ── RIGHT COLUMN: filter + table ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
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
            totalCount={meta?.total}
          />

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
      </div>
    </div>
  )
}

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
  }

  return (
    <div className="px-8 pb-12 space-y-6 max-w-[1600px] mx-auto">
      {/* 1. Header with greeting and live indicators */}
      <HeroSection />

      {/* 2. 4 Intelly-style Colorful KPI Cards */}
      <StatsBar />

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
        totalCount={meta?.total}
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

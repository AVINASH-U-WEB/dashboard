import React, { useState } from 'react'
import { HeroSection } from '../components/HeroSection'
import { StatusTabBar } from '../features/orders/StatusTabBar'
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

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleFromDateChange = (val: string) => {
    setFromDate(val)
    setCurrentPage(1)
  }

  const handleToDateChange = (val: string) => {
    setToDate(val)
    setCurrentPage(1)
  }

  const handleToggleAnomaly = () => {
    setIsAnomaly(!isAnomaly)
    setCurrentPage(1)
  }

  const handleToggleLate = () => {
    setIsLate(!isLate)
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
    <div className="space-y-5 pb-8">
      {/* 1. Greeting */}
      <HeroSection />

      {/* 2. Status Pill Tabs */}
      <StatusTabBar
        selectedStatus={selectedStatus}
        onSelectStatus={handleStatusChange}
      />

      {/* 3. KPI Cards */}
      <div className="px-6">
        <StatsBar />
      </div>

      {/* 4. Filter Bar */}
      <div className="px-6">
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
      </div>

      {/* 5. Orders Table */}
      <div className="px-6">
        <OrderTable
          orders={orders}
          meta={meta}
          isLoading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}

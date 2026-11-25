import type { FC } from 'react'
import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDashboardContext } from '../../../layouts/DashboardLayout'
import { useTickets } from '../hooks/useTickets'
import { useTicketFilters } from '../hooks/useTicketFilters'
import { TicketHero } from '../components/TicketHero'
import TicketStats from '../components/TicketStats'
import { TicketInsights } from '../components/TicketInsights'
import { TicketFilterBar } from '../components/TicketFilterBar'
import TicketTable from '../components/TicketTable'
import TicketDetailDrawer from '../components/TicketDetailDrawer'
import OpenTicketModal from '../components/OpenTicketModal'
import EditTicketModal from '../components/EditTicketModal'
import type { Ticket } from '../types/ticket'

export const TicketsPage: FC = () => {
  const { searchQuery, onSearchChange } = useDashboardContext()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)

  const {
    data: rawTickets,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTickets()

  const tickets = Array.isArray(rawTickets) ? rawTickets : []

  const {
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    selectedCategory,
    setSelectedCategory,
    unresolvedOnly,
    toggleUnresolved,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    filteredTickets,
    paginatedTickets,
    hasActiveFilters,
    resetFilters,
  } = useTicketFilters({
    tickets,
    searchQuery,
    onClearSearch: () => onSearchChange(''),
  })

  return (
    <div className="w-full px-8 pb-12 space-y-6 max-w-[1600px] mx-auto">
      {/* 1. Hero Header with Live Summary Pills */}
      <TicketHero tickets={tickets} />

      {/* Active Search Indicator */}
      {searchQuery.trim() !== '' && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-2xl border border-gray-200/80 shadow-xs text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Search className="w-3.5 h-3.5 text-yellow-500" />
            <span>
              Filtering tickets matching:{' '}
              <strong className="text-[#14141f]">&ldquo;{searchQuery}&rdquo;</strong>{' '}
              ({filteredTickets.length} result{filteredTickets.length !== 1 ? 's' : ''})
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold transition-colors"
          >
            <X className="w-3 h-3" />
            Clear Search
          </button>
        </div>
      )}

      {/* 2. Pastel KPI Summary Cards */}
      <TicketStats tickets={tickets} />

      {/* 3. Filter Bar */}
      <TicketFilterBar
        selectedPriority={selectedPriority}
        selectedCategory={selectedCategory}
        unresolvedOnly={unresolvedOnly}
        onPriorityChange={setSelectedPriority}
        onCategoryChange={setSelectedCategory}
        onToggleUnresolved={toggleUnresolved}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        filteredCount={filteredTickets.length}
        totalCount={tickets.length}
      />

      {/* 4. Tickets Ledger Table (always rendered with loading/error/empty states) */}
      <TicketTable
        tickets={paginatedTickets}
        totalFilteredCount={filteredTickets.length}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={
          error instanceof Error
            ? error.message
            : 'Unable to reach the tickets API.'
        }
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onView={(ticket) => setSelectedTicket(ticket)}
        onEdit={(ticket) => setEditingTicket(ticket)}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onRefresh={() => refetch()}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. Interactive Category & Priority Breakdown Cards */}
      <TicketInsights
        tickets={tickets}
        selectedCategory={selectedCategory}
        selectedPriority={selectedPriority}
        onSelectCategory={setSelectedCategory}
        onSelectPriority={setSelectedPriority}
      />

      {/* Drawers & Modals */}
      <TicketDetailDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onEdit={(ticket) => setEditingTicket(ticket)}
      />

      <OpenTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditTicketModal
        ticket={editingTicket}
        onClose={() => setEditingTicket(null)}
      />
    </div>
  )
}

export default TicketsPage

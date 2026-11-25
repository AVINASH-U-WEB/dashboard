import { useEffect, useMemo, useState } from 'react'
import type { Ticket, TicketStatus } from '../types/ticket'

interface UseTicketFiltersOptions {
  tickets: Ticket[]
  searchQuery: string
  onClearSearch?: () => void
}

export function useTicketFilters({
  tickets,
  searchQuery,
  onClearSearch,
}: UseTicketFiltersOptions) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | TicketStatus>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [unresolvedOnly, setUnresolvedOnly] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const safeTickets = useMemo(
    () => (Array.isArray(tickets) ? tickets : []),
    [tickets]
  )

  const filteredTickets = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase()

    return safeTickets.filter((ticket) => {
      if (selectedStatus !== 'all' && ticket.status !== selectedStatus) {
        return false
      }
      if (selectedPriority !== 'all' && ticket.priority !== selectedPriority) {
        return false
      }
      if (selectedCategory !== 'all' && ticket.category !== selectedCategory) {
        return false
      }
      if (unresolvedOnly && ticket.status === 'Resolved') {
        return false
      }
      if (!q) return true

      return (
        String(ticket.ticket_id ?? '').includes(q) ||
        (ticket.order_id ?? '').toLowerCase().includes(q) ||
        (ticket.category ?? '').toLowerCase().includes(q) ||
        (ticket.priority ?? '').toLowerCase().includes(q) ||
        (ticket.status ?? '').toLowerCase().includes(q) ||
        (ticket.notes ?? '').toLowerCase().includes(q)
      )
    })
  }, [
    safeTickets,
    selectedStatus,
    selectedPriority,
    selectedCategory,
    unresolvedOnly,
    searchQuery,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [
    selectedStatus,
    selectedPriority,
    selectedCategory,
    unresolvedOnly,
    searchQuery,
    pageSize,
  ])

  const safePage = Math.min(currentPage, totalPages)
  const paginatedTickets = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize
    return filteredTickets.slice(startIndex, startIndex + pageSize)
  }, [filteredTickets, safePage, pageSize])

  const hasActiveFilters =
    selectedStatus !== 'all' ||
    selectedPriority !== 'all' ||
    selectedCategory !== 'all' ||
    unresolvedOnly ||
    (searchQuery || '').trim() !== ''

  const resetFilters = () => {
    setSelectedStatus('all')
    setSelectedPriority('all')
    setSelectedCategory('all')
    setUnresolvedOnly(false)
    setCurrentPage(1)
    if (onClearSearch && searchQuery) {
      onClearSearch()
    }
  }

  return {
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    selectedCategory,
    setSelectedCategory,
    unresolvedOnly,
    setUnresolvedOnly,
    toggleUnresolved: () => setUnresolvedOnly((prev) => !prev),
    currentPage: safePage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    filteredTickets,
    paginatedTickets,
    hasActiveFilters,
    resetFilters,
  }
}

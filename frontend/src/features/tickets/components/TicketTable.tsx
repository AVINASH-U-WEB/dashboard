import { AlertCircle, Eye, Pencil, Plus, RefreshCw, Ticket as TicketIcon } from 'lucide-react'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Pagination } from '../../../shared/components/ui/Pagination'
import { useTicketStats } from '../hooks/useTicketStats'
import type { Ticket, TicketStatus } from '../types/ticket'
import TicketStatusBadge from './TicketStatusBadge'

interface TicketTableProps {
  tickets: Ticket[]
  allTickets: Ticket[]
  totalFilteredCount: number
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  currentPage: number
  pageSize: number
  totalPages: number
  selectedStatus: 'all' | TicketStatus
  onStatusChange: (status: 'all' | TicketStatus) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onView: (ticket: Ticket) => void
  onEdit: (ticket: Ticket) => void
  onOpenCreate: () => void
  onRetry: () => void
  onResetFilters?: () => void
  hasActiveFilters?: boolean
}

const PRIORITY_STYLES: Record<string, string> = {
  High: 'bg-rose-100 text-rose-700 border-rose-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
}

export default function TicketTable({
  tickets,
  allTickets,
  totalFilteredCount,
  isLoading,
  isError,
  errorMessage,
  currentPage,
  pageSize,
  totalPages,
  selectedStatus,
  onStatusChange,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onOpenCreate,
  onRetry,
  onResetFilters,
  hasActiveFilters = false,
}: TicketTableProps) {
  const stats = useTicketStats(allTickets)
  const startRow =
    totalFilteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRow = Math.min(currentPage * pageSize, totalFilteredCount)

  const statusTabs: Array<{
    id: 'all' | TicketStatus
    label: string
    count: number
  }> = [
    { id: 'all', label: 'All Tickets', count: stats.total },
    { id: 'Open', label: 'Open', count: stats.open },
    { id: 'In Progress', label: 'In Progress', count: stats.inProgress },
    { id: 'Resolved', label: 'Resolved', count: stats.resolved },
  ]

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
      {/* Table Header Strip — always rendered */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#14141f] tracking-tight">
            Tickets Ledger
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Click any ticket row to inspect notes or update resolution status
          </p>
        </div>

        {/* Status Tabs — Pill Style */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#f5f5f0] p-1.5 rounded-2xl border border-gray-200/60">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#14141f] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200/80 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="font-semibold text-gray-700">
            {startRow.toLocaleString()}–{endRow.toLocaleString()} of{' '}
            {totalFilteredCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Ticket ID</th>
              <th className="py-3.5 px-4">Order ID</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Notes</th>
              <th className="py-3.5 px-4">Created</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading && tickets.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="py-4 px-6">
                    <div className="h-7 bg-gray-100 rounded-xl animate-pulse" />
                  </td>
                </tr>
              ))
            ) : isError && tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 px-6">
                  <div className="max-w-lg mx-auto rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-rose-900">
                        Unable to load tickets from the backend API
                      </p>
                      <p className="text-xs text-rose-700 mt-1">
                        {errorMessage || 'Make sure the FastAPI server is running on port 8000.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#14141f] px-4 py-2 text-xs font-bold text-white hover:bg-[#1f1f2e] transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-yellow-400" />
                      Retry Connection
                    </button>
                  </div>
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-0">
                  <EmptyState
                    icon={
                      <TicketIcon
                        className="w-6 h-6 text-gray-500"
                        aria-hidden="true"
                      />
                    }
                    title={
                      hasActiveFilters
                        ? 'No tickets match your filters'
                        : 'No support tickets yet'
                    }
                    description={
                      hasActiveFilters
                        ? 'Try clearing your active status, category, priority, or search filters.'
                        : 'Open your first customer support ticket linked to an existing Olist order ID.'
                    }
                    action={
                      hasActiveFilters && onResetFilters ? (
                        <button
                          type="button"
                          onClick={onResetFilters}
                          className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Reset All Filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onOpenCreate}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#14141f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1f1f2e] transition-colors"
                        >
                          <Plus className="w-4 h-4 text-yellow-400" />
                          Open First Ticket
                        </button>
                      )
                    }
                  />
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                const priorityBadge =
                  PRIORITY_STYLES[ticket.priority] ??
                  'bg-gray-100 text-gray-700 border-gray-200'

                return (
                  <tr
                    key={ticket.ticket_id}
                    onClick={() => onView(ticket)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onView(ticket)
                      }
                    }}
                    tabIndex={0}
                    className="hover:bg-[#fafaf7] focus:bg-[#fafaf7] transition-colors cursor-pointer outline-none"
                  >
                    <td className="whitespace-nowrap py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#f5f5f0] border border-gray-200/80 font-mono text-[11px] font-bold text-[#14141f]">
                        #{ticket.ticket_id}
                      </span>
                    </td>

                    <td className="whitespace-nowrap py-4 px-4">
                      <span className="font-mono text-[11px] font-semibold text-gray-700">
                        {ticket.order_id}
                      </span>
                    </td>

                    <td className="whitespace-nowrap py-4 px-4 font-semibold text-gray-800">
                      {ticket.category}
                    </td>

                    <td className="whitespace-nowrap py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${priorityBadge}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="whitespace-nowrap py-4 px-4">
                      <TicketStatusBadge status={ticket.status} />
                    </td>

                    <td className="py-4 px-4 max-w-[260px]">
                      <p className="text-gray-500 truncate" title={ticket.notes || ''}>
                        {ticket.notes || '—'}
                      </p>
                    </td>

                    <td className="whitespace-nowrap py-4 px-4 text-gray-500 font-medium">
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    <td className="whitespace-nowrap py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onView(ticket)
                          }}
                          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 hover:text-[#14141f] hover:bg-gray-100 transition-colors"
                          title="Inspect ticket"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(ticket)
                          }}
                          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-[#14141f] bg-[#f5f5f0] hover:bg-yellow-100 border border-gray-200/80 transition-colors"
                          title="Edit ticket"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalFilteredCount > 0 && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50/40">
          <p className="text-xs text-gray-500 font-medium">
            Page <span className="font-bold text-[#14141f]">{currentPage}</span> of{' '}
            <span className="font-bold text-[#14141f]">{totalPages}</span>
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}

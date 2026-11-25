
import { useState } from 'react'

import {
  useTickets,
} from '../features/tickets/useTickets'

import TicketStats from '../features/tickets/TicketStats'
import TicketTable from '../features/tickets/TicketTable'
import OpenTicketModal from '../features/tickets/OpenTicketModal'

import type { Ticket } from '../types/ticket'

export default function Tickets() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    data: tickets = [],
    isLoading,
    isError,
    error,
  } = useTickets()

  function handleEdit(ticket: Ticket) {
    alert(
      `Edit form for ticket #${ticket.ticket_id} will be connected in a later step.`
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ticketing Module
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer support tickets and track their resolution.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create Ticket
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <p className="text-sm text-gray-500">
          Loading tickets...
        </p>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Unable to load tickets: {error.message}
          </p>
        </div>
      )}

      {/* Ticket statistics and table */}
      {!isLoading && !isError && (
        <>
          <TicketStats tickets={tickets} />

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">
              All Tickets
            </h2>

            <TicketTable
              tickets={tickets}
              onEdit={handleEdit}
            />
          </div>
        </>
      )}

      {/* Create ticket modal */}
      <OpenTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

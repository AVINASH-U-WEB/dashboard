
import type { Ticket } from '../../types/ticket'
import TicketStatusBadge from './TicketStatusBadge'

interface TicketTableProps {
  tickets: Ticket[]
  onEdit: (ticket: Ticket) => void
}

export default function TicketTable({
  tickets,
  onEdit,
}: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">
          No tickets found.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[900px] divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
              Ticket ID
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
              Order ID
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
              Category
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
              Priority
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
              Status
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
              Created At
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr key={ticket.ticket_id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                #{ticket.ticket_id}
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                {ticket.order_id}
              </td>

              <td className="px-5 py-4 text-sm text-gray-600">
                {ticket.category}
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                {ticket.priority}
              </td>

              <td className="whitespace-nowrap px-5 py-4">
                <TicketStatusBadge status={ticket.status} />
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                {new Date(ticket.created_at).toLocaleDateString()}
              </td>

              <td className="whitespace-nowrap px-5 py-4">
                <button
                  type="button"
                  onClick={() => onEdit(ticket)}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

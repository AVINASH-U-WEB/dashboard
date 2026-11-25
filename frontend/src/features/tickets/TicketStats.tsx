
import type { Ticket } from '../../types/ticket'

interface TicketStatsProps {
  tickets: Ticket[]
}

export default function TicketStats({ tickets }: TicketStatsProps) {
  const totalTickets = tickets.length

  const openTickets = tickets.filter(
    (ticket) => ticket.status === 'Open'
  ).length

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === 'In Progress'
  ).length

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === 'Resolved'
  ).length

  const stats = [
    {
      label: 'Total Tickets',
      value: totalTickets,
      style: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Open Tickets',
      value: openTickets,
      style: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'In Progress',
      value: inProgressTickets,
      style: 'bg-yellow-50 text-yellow-700',
    },
    {
      label: 'Resolved',
      value: resolvedTickets,
      style: 'bg-green-50 text-green-700',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">
            {stat.label}
          </p>

          <p className={`mt-2 text-3xl font-bold ${stat.style}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}

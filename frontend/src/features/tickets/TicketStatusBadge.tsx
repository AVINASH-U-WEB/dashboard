
interface TicketStatusBadgeProps {
  status: string
}

export default function TicketStatusBadge({
  status,
}: TicketStatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    Open: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    Resolved: 'bg-green-100 text-green-700',
  }

  const badgeStyle =
    statusStyles[status] ?? 'bg-gray-100 text-gray-700'

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeStyle}`}
    >
      {status}
    </span>
  )
}

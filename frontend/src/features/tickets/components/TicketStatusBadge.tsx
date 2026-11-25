interface TicketStatusBadgeProps {
  status: string
}

export default function TicketStatusBadge({
  status,
}: TicketStatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    Open: 'bg-sky-100 text-sky-800',
    'In Progress': 'bg-amber-100 text-amber-800',
    Resolved: 'bg-emerald-100 text-emerald-700',
  }

  const badgeStyle =
    statusStyles[status] ?? 'bg-gray-100 text-gray-700'

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-tight text-center ${badgeStyle}`}
    >
      {status}
    </span>
  )
}

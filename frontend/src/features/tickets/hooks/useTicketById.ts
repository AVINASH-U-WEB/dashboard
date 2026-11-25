import { useQuery } from '@tanstack/react-query'
import { fetchTicketById } from '../api/ticketsApi'
import type { Ticket } from '../types/ticket'

// Fetch a single ticket by ID for detail inspection.
export function useTicketById(ticketId: number | null | undefined) {
  return useQuery<Ticket, Error>({
    queryKey: ['ticket', ticketId],
    queryFn: ({ signal }) => fetchTicketById(ticketId!, { signal }),
    enabled: typeof ticketId === 'number' && ticketId > 0,
    staleTime: 15_000,
  })
}

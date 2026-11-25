import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchTickets } from '../api/ticketsApi'
import type { Ticket } from '../types/ticket'

export { useCreateTicket } from './useCreateTicket'
export { useUpdateTicket } from './useUpdateTicket'

// Fetch all tickets or tickets filtered by a specific order ID.
export function useTickets(orderId?: string) {
  return useQuery<Ticket[], Error>({
    queryKey: ['tickets', orderId ?? 'all'],
    queryFn: ({ signal }) => fetchTickets(orderId, { signal }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}

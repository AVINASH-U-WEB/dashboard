
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  fetchTickets,
  createTicket,
  updateTicket,
} from '../../api/ticketsApi'

import type {
  TicketCreate,
  TicketUpdate,
} from '../../types/ticket'


// Fetch tickets from the backend.
export function useTickets(orderId?: string) {
  return useQuery({
    queryKey: ['tickets', orderId ?? 'all'],

    queryFn: () => fetchTickets(orderId),

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  })
}


// Create a new ticket.
export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TicketCreate) =>
      createTicket(payload),

    onSuccess: () => {
      // Refresh ticket data after successful creation.
      queryClient.invalidateQueries({
        queryKey: ['tickets'],
      })
    },
  })
}


// Update an existing ticket.
export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ticketId,
      payload,
    }: {
      ticketId: number
      payload: TicketUpdate
    }) => updateTicket(ticketId, payload),

    onSuccess: () => {
      // Refresh ticket data after successful update.
      queryClient.invalidateQueries({
        queryKey: ['tickets'],
      })
    },
  })
}

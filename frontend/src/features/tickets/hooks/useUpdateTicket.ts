import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTicket } from '../api/ticketsApi'
import type { Ticket, TicketUpdate } from '../types/ticket'

interface UpdateTicketVariables {
  ticketId: number
  payload: TicketUpdate
}

// Update an existing support ticket and sync caches.
export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation<Ticket, Error, UpdateTicketVariables>({
    mutationFn: ({ ticketId, payload }) => updateTicket(ticketId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Ticket>(['ticket', updated.ticket_id], updated)
      queryClient.setQueryData<Ticket[]>(['tickets', 'all'], (prev) =>
        Array.isArray(prev)
          ? prev.map((item) =>
              item.ticket_id === updated.ticket_id ? updated : item
            )
          : prev
      )
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['ticket', updated.ticket_id] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTicket } from '../api/ticketsApi'
import type { Ticket, TicketCreate } from '../types/ticket'

// Create a new support ticket and refresh cached ticket queries.
export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation<Ticket, Error, TicketCreate>({
    mutationFn: (payload) => createTicket(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<Ticket[]>(['tickets', 'all'], (prev) =>
        Array.isArray(prev) ? [created, ...prev] : [created]
      )
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

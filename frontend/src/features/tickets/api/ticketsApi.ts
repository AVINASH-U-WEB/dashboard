import type {
  Ticket,
  TicketCreate,
  TicketUpdate,
} from '../types/ticket'
import { apiClient } from '../../../shared/api/client'

interface RequestConfig {
  signal?: AbortSignal
}

// GET: Retrieve all tickets or filter by order ID.
export async function fetchTickets(
  orderId?: string,
  config?: RequestConfig
): Promise<Ticket[]> {
  const result = await apiClient.get<Ticket[]>('/tickets', {
    params: orderId ? { order_id: orderId } : undefined,
    signal: config?.signal,
  })
  return Array.isArray(result) ? result : []
}

// GET: Retrieve one ticket using its ticket ID.
export async function fetchTicketById(
  ticketId: number,
  config?: RequestConfig
): Promise<Ticket> {
  return apiClient.get<Ticket>(`/tickets/${ticketId}`, {
    signal: config?.signal,
  })
}

// POST: Create a new ticket.
export async function createTicket(
  ticket: TicketCreate
): Promise<Ticket> {
  return apiClient.post<Ticket>('/tickets', ticket)
}

// PATCH: Update an existing ticket.
export async function updateTicket(
  ticketId: number,
  updates: TicketUpdate
): Promise<Ticket> {
  return apiClient<Ticket>(`/tickets/${ticketId}`, {
    method: 'PATCH',
    body: updates,
  })
}

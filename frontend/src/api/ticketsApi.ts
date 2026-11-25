
import type {
  Ticket,
  TicketCreate,
  TicketUpdate,
} from '../types/ticket'


const API_BASE = 'http://localhost:8000/api/v1'


// GET: Retrieve all tickets or filter by order ID.
export async function fetchTickets(
  orderId?: string
): Promise<Ticket[]> {

  const query = new URLSearchParams()

  if (orderId) {
    query.append('order_id', orderId)
  }

  const queryString = query.toString()

  const url = queryString
    ? `${API_BASE}/tickets?${queryString}`
    : `${API_BASE}/tickets`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.statusText}`)
  }

  return response.json()
}


// GET: Retrieve one ticket using its ticket ID.
export async function fetchTicketById(
  ticketId: number
): Promise<Ticket> {

  const response = await fetch(
    `${API_BASE}/tickets/${ticketId}`
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch ticket: ${response.statusText}`)
  }

  return response.json()
}


// POST: Create a new ticket.
export async function createTicket(
  ticket: TicketCreate
): Promise<Ticket> {

  const response = await fetch(
    `${API_BASE}/tickets`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(ticket),
    }
  )

  if (!response.ok) {
    const error = await response.json()

    throw new Error(
      error.detail || 'Failed to create ticket'
    )
  }

  return response.json()
}


// PATCH: Update an existing ticket.
export async function updateTicket(
  ticketId: number,
  updates: TicketUpdate
): Promise<Ticket> {

  const response = await fetch(
    `${API_BASE}/tickets/${ticketId}`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(updates),
    }
  )

  if (!response.ok) {
    const error = await response.json()

    throw new Error(
      error.detail || 'Failed to update ticket'
    )
  }

  return response.json()
}

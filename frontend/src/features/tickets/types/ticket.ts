
export type TicketPriority = 'Low' | 'Medium' | 'High'

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved'

export type TicketCategory =
  | 'Delivery'
  | 'Refund'
  | 'Product'
  | 'Payment'
  | 'Order Cancellation'
  | 'General Inquiry'


export interface Ticket {
  ticket_id: number
  order_id: string
  priority: string
  category: string
  status: string
  notes: string
  created_at: string
}


export interface TicketCreate {
  order_id: string
  priority: TicketPriority
  category: string
  notes: string
}


export interface TicketUpdate {
  priority?: TicketPriority
  category?: string
  status?: TicketStatus
  notes?: string
}

import { useMemo } from 'react'
import type { Ticket } from '../types/ticket'

const DEFAULT_CATEGORIES = [
  'Delivery',
  'Refund',
  'Product',
  'Payment',
  'Order Cancellation',
  'General Inquiry',
]

export interface CategoryBreakdownItem {
  category: string
  count: number
  percentage: number
}

export interface PriorityBreakdownItem {
  priority: 'High' | 'Medium' | 'Low'
  count: number
  percentage: number
}

export interface TicketStatsSummary {
  total: number
  open: number
  inProgress: number
  resolved: number
  active: number
  highPriorityOpen: number
  inProgressHigh: number
  inProgressOther: number
  resolutionRate: string
  openSharePct: string
  categoryBreakdown: CategoryBreakdownItem[]
  priorityBreakdown: PriorityBreakdownItem[]
}

export function useTicketStats(tickets: Ticket[]): TicketStatsSummary {
  return useMemo(() => {
    const safeTickets = Array.isArray(tickets) ? tickets : []
    const total = safeTickets.length
    const open = safeTickets.filter((t) => t.status === 'Open').length
    const inProgress = safeTickets.filter((t) => t.status === 'In Progress').length
    const resolved = safeTickets.filter((t) => t.status === 'Resolved').length
    const active = open + inProgress

    const highPriorityOpen = safeTickets.filter(
      (t) => t.priority === 'High' && t.status !== 'Resolved'
    ).length
    const inProgressHigh = safeTickets.filter(
      (t) => t.status === 'In Progress' && t.priority === 'High'
    ).length
    const inProgressOther = inProgress - inProgressHigh

    const resolutionRate =
      total > 0 ? `${((resolved / total) * 100).toFixed(1)}%` : '0.0%'
    const openSharePct =
      total > 0 ? `${((open / total) * 100).toFixed(1)}%` : '0.0%'

    const categoryMap = new Map<string, number>()
    for (const cat of DEFAULT_CATEGORIES) {
      categoryMap.set(cat, 0)
    }
    for (const ticket of safeTickets) {
      const cat = ticket.category || 'General Inquiry'
      categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1)
    }

    const categoryBreakdown: CategoryBreakdownItem[] = Array.from(
      categoryMap.entries()
    )
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))

    const priorityLevels: Array<'High' | 'Medium' | 'Low'> = [
      'High',
      'Medium',
      'Low',
    ]
    const priorityBreakdown: PriorityBreakdownItem[] = priorityLevels.map(
      (priority) => {
        const count = safeTickets.filter((t) => t.priority === priority).length
        return {
          priority,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }
      }
    )

    return {
      total,
      open,
      inProgress,
      resolved,
      active,
      highPriorityOpen,
      inProgressHigh,
      inProgressOther,
      resolutionRate,
      openSharePct,
      categoryBreakdown,
      priorityBreakdown,
    }
  }, [tickets])
}

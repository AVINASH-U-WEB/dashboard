import { useEffect, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { useUpdateTicket } from '../hooks/useUpdateTicket'
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketUpdate,
} from '../types/ticket'

interface EditTicketModalProps {
  ticket: Ticket | null
  onClose: () => void
}

const CATEGORIES = [
  'Delivery',
  'Refund',
  'Product',
  'Payment',
  'Order Cancellation',
  'General Inquiry',
]

export default function EditTicketModal({
  ticket,
  onClose,
}: EditTicketModalProps) {
  const [priority, setPriority] = useState<TicketPriority>('Medium')
  const [category, setCategory] = useState<string>('Delivery')
  const [status, setStatus] = useState<TicketStatus>('Open')
  const [notes, setNotes] = useState('')

  const updateTicketMutation = useUpdateTicket()

  useEffect(() => {
    if (ticket) {
      setPriority((ticket.priority as TicketPriority) || 'Medium')
      setCategory(ticket.category || 'Delivery')
      setStatus((ticket.status as TicketStatus) || 'Open')
      setNotes(ticket.notes || '')
      updateTicketMutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket])

  if (!ticket) {
    return null
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ticket) return

    const payload: TicketUpdate = {}
    if (priority !== ticket.priority) payload.priority = priority
    if (category !== ticket.category) payload.category = category
    if (status !== ticket.status) payload.status = status
    if (notes.trim() !== ticket.notes) payload.notes = notes.trim()

    if (Object.keys(payload).length === 0) {
      onClose()
      return
    }

    try {
      await updateTicketMutation.mutateAsync({
        ticketId: ticket.ticket_id,
        payload,
      })
      onClose()
    } catch {
      // Mutation error is rendered below the form.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-200/80">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#bae6fd] text-[#14141f] flex items-center justify-center shrink-0">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#14141f] tracking-tight">
                Edit Ticket #{ticket.ticket_id}
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                Order: {ticket.order_id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TicketStatus)
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm font-medium outline-none focus:bg-white focus:border-[#14141f]"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TicketPriority)
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm font-medium outline-none focus:bg-white focus:border-[#14141f]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm font-medium outline-none focus:bg-white focus:border-[#14141f]"
            >
              {!CATEGORIES.includes(category) && (
                <option value={category}>{category}</option>
              )}
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              required
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#14141f] transition-colors"
            />
          </div>

          {updateTicketMutation.isError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              {updateTicketMutation.error.message}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateTicketMutation.isPending}
              className="rounded-xl bg-[#14141f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1f1f2e] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {updateTicketMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

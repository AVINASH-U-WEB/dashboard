import { useState } from 'react'
import { Plus, Ticket as TicketIcon, X } from 'lucide-react'
import { useCreateTicket } from '../hooks/useCreateTicket'
import type { TicketPriority, TicketCategory } from '../types/ticket'

interface OpenTicketModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function OpenTicketModal({
  isOpen,
  onClose,
}: OpenTicketModalProps) {
  const [orderId, setOrderId] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('Medium')
  const [category, setCategory] = useState<TicketCategory>('Delivery')
  const [notes, setNotes] = useState('')

  const createTicketMutation = useCreateTicket()

  if (!isOpen) {
    return null
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await createTicketMutation.mutateAsync({
        order_id: orderId.trim(),
        priority,
        category,
        notes: notes.trim(),
      })

      setOrderId('')
      setPriority('Medium')
      setCategory('Delivery')
      setNotes('')
      onClose()
    } catch {
      // The mutation error is displayed below the form.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-200/80">
        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fef08a] text-[#14141f] flex items-center justify-center shrink-0">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#14141f] tracking-tight">
                Open New Ticket
              </h2>
              <p className="text-xs text-gray-500">
                Log a support ticket against an existing Olist order ID
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

        {/* Ticket Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Enter an existing Olist order ID"
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm font-mono outline-none focus:bg-white focus:border-[#14141f] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as TicketCategory)
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm font-medium outline-none focus:bg-white focus:border-[#14141f]"
              >
                <option value="Delivery">Delivery</option>
                <option value="Refund">Refund</option>
                <option value="Product">Product</option>
                <option value="Payment">Payment</option>
                <option value="Order Cancellation">Order Cancellation</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Describe the customer's issue..."
              rows={4}
              required
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#14141f] transition-colors"
            />
          </div>

          {createTicketMutation.isError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              {createTicketMutation.error.message}
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
              disabled={createTicketMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#14141f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1f1f2e] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

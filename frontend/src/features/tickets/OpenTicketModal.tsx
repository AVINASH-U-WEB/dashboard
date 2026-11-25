
import { useState } from 'react'
import { useCreateTicket } from './useTickets'
import type { TicketPriority, TicketCategory } from '../../types/ticket'

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

      // Reset form fields after successful ticket creation.
      setOrderId('')
      setPriority('Medium')
      setCategory('Delivery')
      setNotes('')

      // Close the modal.
      onClose()
    } catch {
      // The mutation error is displayed below the form.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Open New Ticket
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-700"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Ticket Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Order ID */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Order ID
            </label>

            <input
              type="text"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Enter an existing Olist order ID"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Priority
            </label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TicketPriority)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as TicketCategory)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="Delivery">Delivery</option>
              <option value="Refund">Refund</option>
              <option value="Product">Product</option>
              <option value="Payment">Payment</option>
              <option value="Order Cancellation">Order Cancellation</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Describe the customer's issue..."
              rows={4}
              required
              maxLength={2000}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Error Message */}
          {createTicketMutation.isError && (
            <p className="text-sm text-red-600">
              {createTicketMutation.error.message}
            </p>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createTicketMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createTicketMutation.isPending
                ? 'Creating...'
                : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

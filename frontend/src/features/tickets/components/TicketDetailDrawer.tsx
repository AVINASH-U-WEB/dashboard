import { useState } from 'react'
import {
  Calendar,
  Check,
  Copy,
  FileText,
  Layers,
  Package,
  Pencil,
  ShieldAlert,
} from 'lucide-react'
import { Drawer } from '../../../shared/components/ui/Drawer'
import { useTicketById } from '../hooks/useTicketById'
import { useUpdateTicket } from '../hooks/useUpdateTicket'
import type { Ticket, TicketStatus } from '../types/ticket'
import TicketStatusBadge from './TicketStatusBadge'

interface TicketDetailDrawerProps {
  ticket: Ticket | null
  onClose: () => void
  onEdit: (ticket: Ticket) => void
}

const STATUS_OPTIONS: TicketStatus[] = ['Open', 'In Progress', 'Resolved']

export default function TicketDetailDrawer({
  ticket,
  onClose,
  onEdit,
}: TicketDetailDrawerProps) {
  const [copied, setCopied] = useState(false)
  const { data: liveTicket } = useTicketById(ticket?.ticket_id)
  const updateTicketMutation = useUpdateTicket()

  const activeTicket = liveTicket ?? ticket

  const handleCopyOrderId = async () => {
    if (!activeTicket) return
    try {
      await navigator.clipboard.writeText(activeTicket.order_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable in restricted contexts.
    }
  }

  const handleQuickStatus = async (status: TicketStatus) => {
    if (!activeTicket || activeTicket.status === status) return
    await updateTicketMutation.mutateAsync({
      ticketId: activeTicket.ticket_id,
      payload: { status },
    })
    onClose()
  }

  return (
    <Drawer
      open={activeTicket !== null}
      onClose={onClose}
      title={activeTicket ? `Ticket #${activeTicket.ticket_id}` : 'Ticket Details'}
      description={
        activeTicket ? `Linked order ${activeTicket.order_id}` : undefined
      }
      size="md"
    >
      {activeTicket && (
        <div className="space-y-6">
          {/* Status & Quick Workflow Transition */}
          <div className="rounded-2xl bg-[#f5f5f0] border border-gray-200/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Current Status
              </span>
              <TicketStatusBadge status={activeTicket.status} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {STATUS_OPTIONS.map((status) => {
                const isCurrent = activeTicket.status === status
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={isCurrent || updateTicketMutation.isPending}
                    onClick={() => handleQuickStatus(status)}
                    className={`rounded-xl px-2.5 py-2 text-[11px] font-bold transition-all border ${
                      isCurrent
                        ? 'bg-[#14141f] text-white border-[#14141f] cursor-default'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                    }`}
                  >
                    {status}
                  </button>
                )
              })}
            </div>

            {updateTicketMutation.isError && (
              <p className="text-xs text-red-600 font-medium">
                {updateTicketMutation.error.message}
              </p>
            )}
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-gray-200/80 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    Order ID
                  </p>
                  <p className="font-mono text-xs font-bold text-[#14141f] truncate">
                    {activeTicket.order_id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200/80 p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    Category
                  </p>
                  <p className="text-xs font-bold text-[#14141f] truncate">
                    {activeTicket.category}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200/80 p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-800 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    Priority
                  </p>
                  <p className="text-xs font-bold text-[#14141f]">
                    {activeTicket.priority}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/80 p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">
                  Created Timestamp
                </p>
                <p className="text-xs font-bold text-[#14141f]">
                  {activeTicket.created_at
                    ? new Date(activeTicket.created_at).toLocaleString()
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-gray-200/80 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#14141f]">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Customer Issue &amp; Agent Notes</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {activeTicket.notes || 'No notes recorded.'}
            </p>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                const target = activeTicket
                onClose()
                onEdit(target)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#14141f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1f1f2e] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-yellow-400" />
              <span>Edit Full Ticket</span>
            </button>
          </div>
        </div>
      )}
    </Drawer>
  )
}

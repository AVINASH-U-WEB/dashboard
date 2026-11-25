import type { FC } from 'react'
import { CheckCircle2, Flame, Plus, RefreshCw, Ticket as TicketIcon } from 'lucide-react'
import { useTicketStats } from '../hooks/useTicketStats'
import type { Ticket } from '../types/ticket'

interface TicketHeroProps {
  tickets: Ticket[]
  isFetching: boolean
  onRefresh: () => void
  onOpenCreate: () => void
}

export const TicketHero: FC<TicketHeroProps> = ({
  tickets,
  isFetching,
  onRefresh,
  onOpenCreate,
}) => {
  const stats = useTicketStats(tickets)

  return (
    <div className="pt-6 pb-2">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-bold text-gray-700 shadow-xs mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Olist Support Write Layer</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#14141f]">
            Ticketing &amp; Resolution Hub
          </h1>
          <p className="mt-1 text-xs md:text-sm text-gray-500 max-w-2xl font-normal leading-relaxed">
            Create, triage, and resolve customer support tickets linked directly to Olist fulfillment orders.
          </p>
        </div>

        {/* Live metric summary pills + actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-800">
              <TicketIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none">
                Active Queue
              </p>
              <p className="text-xs font-black text-[#14141f] mt-0.5">
                {stats.open.toLocaleString()} Open
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-800">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none">
                High Priority
              </p>
              <p className="text-xs font-black text-[#14141f] mt-0.5">
                {stats.highPriorityOpen.toLocaleString()} Urgent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none">
                Resolution
              </p>
              <p className="text-xs font-black text-[#14141f] mt-0.5">
                {stats.resolutionRate}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-gray-200/80 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#14141f] text-white text-xs font-bold shadow-xs hover:bg-[#1f1f2e] transition-colors"
          >
            <Plus className="w-4 h-4 text-yellow-400" />
            <span>Open Ticket</span>
          </button>
        </div>
      </div>
    </div>
  )
}

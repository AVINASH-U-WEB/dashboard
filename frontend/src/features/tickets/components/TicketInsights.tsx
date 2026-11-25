import type { FC } from 'react'
import { Layers, ShieldAlert } from 'lucide-react'
import { useTicketStats } from '../hooks/useTicketStats'
import type { Ticket } from '../types/ticket'

interface TicketInsightsProps {
  tickets: Ticket[]
  selectedCategory: string
  selectedPriority: string
  onSelectCategory: (category: string) => void
  onSelectPriority: (priority: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Delivery: 'bg-sky-500',
  Refund: 'bg-pink-500',
  Product: 'bg-amber-500',
  Payment: 'bg-emerald-500',
  'Order Cancellation': 'bg-rose-500',
  'General Inquiry': 'bg-indigo-500',
}

const PRIORITY_CONFIG = {
  High: {
    pill: 'bg-rose-50 border-rose-200 text-rose-700',
    activePill: 'bg-rose-600 border-rose-600 text-white',
    bar: 'bg-rose-500',
    dot: 'bg-rose-500',
    hint: 'Immediate SLA escalation',
  },
  Medium: {
    pill: 'bg-amber-50 border-amber-200 text-amber-800',
    activePill: 'bg-amber-500 border-amber-500 text-white',
    bar: 'bg-amber-400',
    dot: 'bg-amber-400',
    hint: 'Standard fulfillment review',
  },
  Low: {
    pill: 'bg-sky-50 border-sky-200 text-sky-800',
    activePill: 'bg-sky-600 border-sky-600 text-white',
    bar: 'bg-sky-400',
    dot: 'bg-sky-400',
    hint: 'General customer inquiry',
  },
} as const

export const TicketInsights: FC<TicketInsightsProps> = ({
  tickets,
  selectedCategory,
  selectedPriority,
  onSelectCategory,
  onSelectPriority,
}) => {
  const { total, categoryBreakdown, priorityBreakdown } = useTicketStats(tickets)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Category Breakdown */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f5f5f0] border border-gray-200/70 flex items-center justify-center text-[#14141f]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#14141f] tracking-tight">
                Category Breakdown
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">
                Click any category to filter the tickets ledger
              </p>
            </div>
          </div>

          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className="text-[11px] font-bold text-gray-500 hover:text-[#14141f] px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {categoryBreakdown.map(({ category, count, percentage }) => {
            const isSelected = selectedCategory === category
            const barColor = CATEGORY_COLORS[category] ?? 'bg-[#14141f]'

            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(isSelected ? 'all' : category)}
                className={`text-left p-2.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-[#14141f]/5 border-[#14141f] shadow-xs'
                    : 'bg-[#fafaf8] border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#14141f] truncate">
                    {category}
                  </span>
                  <span className="text-[11px] font-extrabold text-gray-600 shrink-0 ml-2">
                    {count}{' '}
                    <span className="text-gray-400 font-medium">
                      ({percentage}%)
                    </span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Priority & Triage Mix */}
      <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#f5f5f0] border border-gray-200/70 flex items-center justify-center text-[#14141f]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#14141f] tracking-tight">
                  Priority &amp; Triage Mix
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">
                  Click a severity tier to focus urgent cases
                </p>
              </div>
            </div>

            {selectedPriority !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectPriority('all')}
                className="text-[11px] font-bold text-gray-500 hover:text-[#14141f] px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden flex gap-0.5 p-0.5 mb-4">
            {total > 0 ? (
              priorityBreakdown.map(({ priority, count }) => {
                const widthPct = (count / total) * 100
                if (widthPct === 0) return null
                return (
                  <div
                    key={priority}
                    className={`h-full rounded-full transition-all duration-300 ${PRIORITY_CONFIG[priority].bar}`}
                    style={{ width: `${widthPct}%` }}
                    title={`${priority}: ${count}`}
                  />
                )
              })
            ) : (
              <div className="h-full w-full rounded-full bg-gray-200" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          {priorityBreakdown.map(({ priority, count, percentage }) => {
            const cfg = PRIORITY_CONFIG[priority]
            const isSelected = selectedPriority === priority

            return (
              <button
                key={priority}
                type="button"
                onClick={() =>
                  onSelectPriority(isSelected ? 'all' : priority)
                }
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-left transition-all ${
                  isSelected ? cfg.activePill : `${cfg.pill} hover:opacity-90`
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isSelected ? 'bg-white' : cfg.dot
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold leading-tight">
                      {priority} Priority
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-white/80' : 'opacity-75'
                      }`}
                    >
                      {cfg.hint}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className="text-sm font-black">{count}</span>
                  <span
                    className={`ml-1.5 text-[10px] font-bold ${
                      isSelected ? 'text-white/80' : 'opacity-70'
                    }`}
                  >
                    {percentage}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

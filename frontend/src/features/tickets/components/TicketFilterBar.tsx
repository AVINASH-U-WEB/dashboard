import type { FC } from 'react'
import { AlertTriangle, Clock, Filter, RefreshCw, Tag, Layers } from 'lucide-react'

interface TicketFilterBarProps {
  selectedPriority: string
  selectedCategory: string
  unresolvedOnly: boolean
  onPriorityChange: (val: string) => void
  onCategoryChange: (val: string) => void
  onToggleUnresolved: () => void
  onReset: () => void
  hasActiveFilters: boolean
  filteredCount: number
  totalCount: number
}

const CATEGORIES = [
  'Delivery',
  'Refund',
  'Product',
  'Payment',
  'Order Cancellation',
  'General Inquiry',
]

export const TicketFilterBar: FC<TicketFilterBarProps> = ({
  selectedPriority,
  selectedCategory,
  unresolvedOnly,
  onPriorityChange,
  onCategoryChange,
  onToggleUnresolved,
  onReset,
  hasActiveFilters,
  filteredCount,
  totalCount,
}) => {
  const isHighOnly = selectedPriority === 'High'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        {/* Label */}
        <div className="flex items-center gap-1.5 font-bold text-gray-700">
          <Filter className="w-3.5 h-3.5 text-[#1a1a2e]" />
          <span>Filter:</span>
        </div>

        {/* Category Select */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
          <Layers className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-400">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-transparent border-none text-gray-800 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Select */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
          <Tag className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-400">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="bg-transparent border-none text-gray-800 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Toggle: High Priority Only */}
        <button
          type="button"
          onClick={() => onPriorityChange(isHighOnly ? 'all' : 'High')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            isHighOnly
              ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <AlertTriangle
            className={`w-3.5 h-3.5 ${isHighOnly ? 'text-rose-500' : 'text-gray-400'}`}
          />
          <span>High Priority Only</span>
        </button>

        {/* Toggle: Unresolved Only */}
        <button
          type="button"
          onClick={onToggleUnresolved}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            unresolvedOnly
              ? 'bg-amber-50 text-amber-700 border-amber-300 font-semibold'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Clock
            className={`w-3.5 h-3.5 ${unresolvedOnly ? 'text-amber-500' : 'text-gray-400'}`}
          />
          <span>Unresolved Only</span>
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="text-[11px] font-medium text-gray-500">
        Filtered Results:{' '}
        <span className="font-semibold text-gray-800">
          {filteredCount.toLocaleString()}
        </span>
        {filteredCount !== totalCount && (
          <span className="text-gray-400"> / {totalCount.toLocaleString()}</span>
        )}
      </div>
    </div>
  )
}

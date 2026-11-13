import React from 'react'
import { Filter, Calendar, AlertTriangle, Clock, RefreshCw } from 'lucide-react'

interface FilterBarProps {
  fromDate: string
  toDate: string
  isAnomaly: boolean
  isLate: boolean
  onFromDateChange: (val: string) => void
  onToDateChange: (val: string) => void
  onToggleAnomaly: () => void
  onToggleLate: () => void
  onReset: () => void
  totalCount?: number
}

export const FilterBar: React.FC<FilterBarProps> = ({
  fromDate,
  toDate,
  isAnomaly,
  isLate,
  onFromDateChange,
  onToDateChange,
  onToggleAnomaly,
  onToggleLate,
  onReset,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        {/* Label */}
        <div className="flex items-center gap-1.5 font-bold text-gray-700">
          <Filter className="w-3.5 h-3.5 text-[#1a1a2e]" />
          <span>Filter:</span>
        </div>

        {/* Date From */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-400">From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="bg-transparent border-none text-gray-800 text-xs focus:outline-none [color-scheme:light]"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-400">To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="bg-transparent border-none text-gray-800 text-xs focus:outline-none [color-scheme:light]"
          />
        </div>

        {/* Toggle: Discrepancies Only */}
        <button
          onClick={onToggleAnomaly}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            isAnomaly
              ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${isAnomaly ? 'text-rose-500' : 'text-gray-400'}`} />
          <span>Discrepancies Only</span>
        </button>

        {/* Toggle: Delayed Only */}
        <button
          onClick={onToggleLate}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            isLate
              ? 'bg-amber-50 text-amber-700 border-amber-300 font-semibold'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isLate ? 'text-amber-500' : 'text-gray-400'}`} />
          <span>Delayed Only</span>
        </button>

        {/* Reset */}
        {(fromDate || toDate || isAnomaly || isLate) && (
          <button
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
          {totalCount?.toLocaleString() ?? '—'}
        </span>
      </div>
    </div>
  )
}

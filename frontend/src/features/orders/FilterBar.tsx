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
    <div className="bg-white/70 dark:bg-[#131b2e]/80 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-slate-700/60 shadow-glass flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
          <Filter className="w-3.5 h-3.5 text-sky-500" />
          <span>Filter:</span>
        </div>

        {/* Date From */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
          <span className="text-[11px] text-slate-400 dark:text-slate-400">From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="bg-transparent border-none text-slate-800 dark:text-slate-100 text-xs focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
          <span className="text-[11px] text-slate-400 dark:text-slate-400">To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="bg-transparent border-none text-slate-800 dark:text-slate-100 text-xs focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        {/* Toggle: Discrepancies Only */}
        <button
          onClick={onToggleAnomaly}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            isAnomaly
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 shadow-xs font-semibold'
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/70'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${isAnomaly ? 'text-rose-500' : 'text-slate-400 dark:text-slate-400'}`} />
          <span>Discrepancies Only</span>
        </button>

        {/* Toggle: Delayed Only */}
        <button
          onClick={onToggleLate}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            isLate
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-xs font-semibold'
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/70'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isLate ? 'text-amber-500' : 'text-slate-400 dark:text-slate-400'}`} />
          <span>Delayed Only</span>
        </button>

        {/* Reset */}
        {(fromDate || toDate || isAnomaly || isLate) && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
        Filtered Results: <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount?.toLocaleString() ?? '—'}</span>
      </div>
    </div>
  )
}

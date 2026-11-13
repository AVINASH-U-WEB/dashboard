import React from 'react'
import { ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { useStats } from './useStats'

export const StatsBar: React.FC = () => {
  const { data: stats } = useStats()

  const deliveredCount = stats?.by_status?.delivered ?? 96478
  const inTransitCount = stats?.by_status?.shipped ?? 1107
  const exceptionsCount = stats?.anomalies ?? 4424

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Pink Card — Delivered */}
      <div className="bg-[#fbcfe8] rounded-3xl p-5 border border-pink-200/60 shadow-sm relative overflow-hidden transition-transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-pink-400/30 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-pink-900" />
            </div>
            <span className="text-xs font-bold text-pink-950">Delivered orders</span>
          </div>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-pink-800 bg-white/70 px-2 py-0.5 rounded-full shadow-xs">
            <ArrowUpRight className="w-3 h-3" /> +13%
          </span>
        </div>

        <p className="text-2xl font-black text-pink-950 tracking-tight">
          {deliveredCount.toLocaleString()}
        </p>

        <p className="text-[11px] text-pink-900/70 font-medium mt-1">
          Total successfully fulfilled orders
        </p>
      </div>

      {/* 2. Blue Card — In-Transit */}
      <div className="bg-[#bfdbfe] rounded-3xl p-5 border border-blue-200/60 shadow-sm relative overflow-hidden transition-transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-400/30 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-blue-900" />
            </div>
            <span className="text-xs font-bold text-blue-950">In-transit shipments</span>
          </div>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-800 bg-white/70 px-2 py-0.5 rounded-full shadow-xs">
            <ArrowDownRight className="w-3 h-3" /> -6%
          </span>
        </div>

        <p className="text-2xl font-black text-blue-950 tracking-tight">
          {inTransitCount.toLocaleString()}
        </p>

        <p className="text-[11px] text-blue-900/70 font-medium mt-1">
          Active parcels currently on route
        </p>
      </div>

      {/* 3. Yellow/Amber Card — Exceptions & Anomalies */}
      <div className="bg-[#fef08a] rounded-3xl p-5 border border-yellow-200/60 shadow-sm relative overflow-hidden transition-transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-yellow-400/40 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-950" />
            </div>
            <span className="text-xs font-bold text-yellow-950">Flagged discrepancies</span>
          </div>

          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-yellow-800 bg-white/70 px-2 py-0.5 rounded-full shadow-xs">
            <ArrowDownRight className="w-3 h-3" /> -17%
          </span>
        </div>

        <p className="text-2xl font-black text-yellow-950 tracking-tight">
          {exceptionsCount.toLocaleString()}
        </p>

        <p className="text-[11px] text-yellow-900/70 font-medium mt-1">
          Orders with irregular category delivery lag
        </p>
      </div>
    </div>
  )
}

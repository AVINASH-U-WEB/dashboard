import React from 'react'
import { ArrowUpRight, CheckCircle2, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { useStats } from './useStats'
import { MiniBarChart } from './MiniBarChart'

export const StatsBar: React.FC = () => {
  const { data: stats } = useStats()

  const deliveredPct = stats ? (stats.by_status?.delivered ? ((stats.by_status.delivered / (stats.total || 1)) * 100).toFixed(2) : '97.00') : '97.00'
  const latePct = stats ? stats.late_pct.toFixed(2) : '7.90'
  const onTimePct = (100 - parseFloat(latePct)).toFixed(2)
  const anomalyPct = stats ? stats.anomaly_pct.toFixed(2) : '4.45'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Delivery Fulfillment */}
      <div className="bg-white/70 dark:bg-[#131b2e]/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 dark:border-slate-700/60 shadow-glass hover:shadow-glass-lg transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">Fulfillment Rate</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">Delivered shipments</p>
            </div>
          </div>
          <button className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{deliveredPct}%</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Delivered</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{stats?.by_status?.delivered?.toLocaleString() ?? '96,478'}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">In-Transit</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{stats?.by_status?.shipped?.toLocaleString() ?? '1,107'}</span>
          </div>
        </div>

        <div className="mt-2">
          <MiniBarChart variant="green" barCount={16} />
        </div>
      </div>

      {/* Card 2: On-Time Deliveries */}
      <div className="bg-white/70 dark:bg-[#131b2e]/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 dark:border-slate-700/60 shadow-glass hover:shadow-glass-lg transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">On-Time Rate</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">Ahead of estimate</p>
            </div>
          </div>
          <button className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{onTimePct}%</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">On Schedule</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{(stats?.total ? stats.total - (stats.late_deliveries || 0) : 91580).toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Delayed</span>
            <span className="font-semibold text-rose-500">{stats?.late_deliveries?.toLocaleString() ?? '7,861'}</span>
          </div>
        </div>

        <div className="mt-2">
          <MiniBarChart variant="blue" barCount={16} />
        </div>
      </div>

      {/* Card 3: Transit Discrepancies */}
      <div className="bg-white/70 dark:bg-[#131b2e]/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 dark:border-slate-700/60 shadow-glass hover:shadow-glass-lg transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">Discrepancies</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">Irregular transit times</p>
            </div>
          </div>
          <button className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{anomalyPct}%</span>
          <span className="w-2 h-2 rounded-full bg-rose-500" />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Flagged</span>
            <span className="font-semibold text-rose-500">{stats?.anomalies?.toLocaleString() ?? '4,424'}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Standard</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{(stats?.total ? stats.total - (stats.anomalies || 0) : 95017).toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-2">
          <MiniBarChart variant="red" barCount={16} />
        </div>
      </div>

      {/* Card 4: Merchant Delay Rate */}
      <div className="bg-white/70 dark:bg-[#131b2e]/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 dark:border-slate-700/60 shadow-glass hover:shadow-glass-lg transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">Merchant Delay</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">Recent seller late rate</p>
            </div>
          </div>
          <button className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{latePct}%</span>
          <span className="w-2 h-2 rounded-full bg-amber-500" />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Merchants</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">3,095</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">High Delay</span>
            <span className="font-semibold text-amber-500">238</span>
          </div>
        </div>

        <div className="mt-2">
          <MiniBarChart variant="mixed" barCount={16} />
        </div>
      </div>
    </div>
  )
}

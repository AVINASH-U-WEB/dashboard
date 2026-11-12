import React from 'react'
import { Package, Truck, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react'
import { useStats } from './useStats'

interface StatusTabBarProps {
  selectedStatus: string
  onSelectStatus: (status: string) => void
}

export const StatusTabBar: React.FC<StatusTabBarProps> = ({
  selectedStatus,
  onSelectStatus,
}) => {
  const { data: stats } = useStats()

  const tabs = [
    { id: 'all', label: 'All Orders', icon: Package, count: stats?.total ?? 99441 },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2, count: stats?.by_status?.delivered ?? 96478 },
    { id: 'shipped', label: 'Shipped', icon: Truck, count: stats?.by_status?.shipped ?? 1107 },
    { id: 'canceled', label: 'Canceled', icon: XCircle, count: stats?.by_status?.canceled ?? 625 },
    { id: 'processing', label: 'Processing', icon: Clock, count: stats?.by_status?.processing ?? 301 },
    { id: 'invoiced', label: 'Invoiced', icon: FileText, count: stats?.by_status?.invoiced ?? 314 },
  ]

  return (
    <div className="px-6 py-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = selectedStatus === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onSelectStatus(tab.id)}
              className={`group relative p-3.5 rounded-2xl text-left transition-all duration-200 border ${
                isActive
                  ? 'bg-white dark:bg-[#162035] shadow-md shadow-sky-500/10 border-sky-300/80 dark:border-sky-500/60 text-slate-900 dark:text-white -translate-y-0.5'
                  : 'bg-white/65 dark:bg-[#131b2e]/70 hover:bg-white/85 dark:hover:bg-[#1a253e] border-white/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-glass'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-sky-500 text-white'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>

              <div className="text-xs font-semibold tracking-tight">{tab.label}</div>
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-0.5">
                {tab.count.toLocaleString()} orders
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

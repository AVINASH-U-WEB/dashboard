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
    <div className="px-6 py-1">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = selectedStatus === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onSelectStatus(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border ${
                isActive
                  ? 'bg-[#1a1a2e] text-white border-[#1a1a2e] shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:shadow-sm'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab.count.toLocaleString()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

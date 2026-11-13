import React from 'react'
import { Package, Truck, Users, Activity, CheckCircle2 } from 'lucide-react'
import { useStats } from '../features/orders/useStats'

export const HeroSection: React.FC = () => {
  const { data: stats } = useStats()
  const total = stats?.total ?? 99441
  const deliveredCount = stats?.by_status?.delivered ?? 96478
  const deliveredPct = ((deliveredCount / total) * 100).toFixed(1)

  return (
    <div className="pt-6 pb-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-bold text-gray-700 shadow-xs mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Olist E-Commerce Operations Ledger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#14141f]">
            Good morning, Avinash
          </h1>
          <p className="mt-1 text-xs md:text-sm text-gray-500 max-w-2xl font-normal leading-relaxed">
            Centralized monitoring for 99,441 orders. Track delivery timelines, identify shipment delays, and inspect category fulfillment lag.
          </p>
        </div>

        {/* Live metric summary pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-800">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Total Orders</p>
              <p className="text-xs font-black text-[#14141f] mt-0.5">{total.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-800">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Fulfillment</p>
              <p className="text-xs font-black text-[#14141f] mt-0.5">{deliveredPct}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Merchants</p>
              <p className="text-xs font-black text-[#14141f] mt-0.5">3,095</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

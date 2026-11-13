import React from 'react'
import { Package, Truck, Clock, ArrowUpRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { useStats } from '../features/orders/useStats'

export const HeroSection: React.FC = () => {
  const { data: stats } = useStats()
  const total = stats?.total ?? 99441
  const totalFormatted = (total / 1000).toFixed(1).replace('.', ',') + 'k'

  return (
    <div className="px-8 pt-6 pb-2">
      {/* Title */}
      <h1 className="text-[1.85rem] md:text-[2.2rem] font-bold tracking-tight text-[#1a1a2e] leading-none mb-6">
        Your orders fulfillment &amp; ledger
      </h1>

      {/* Top dashboard section: Donut + Waiting for shipment + Latest transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch mb-2">
        {/* 1. Donut Ring Widget (Col 1-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overall Volume</span>
            <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full transition-colors">
              <span>All time</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-center my-3 relative">
            {/* Donut SVG */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                {/* Background Track */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="13" />
                {/* Segment 1: Yellow - Delivered (~75%) */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#fde047"
                  strokeWidth="13"
                  strokeDasharray="301.59"
                  strokeDashoffset="75"
                  strokeLinecap="round"
                />
                {/* Segment 2: Pink - In-Transit (~15%) */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#f472b6"
                  strokeWidth="13"
                  strokeDasharray="301.59"
                  strokeDashoffset="240"
                  strokeLinecap="round"
                />
                {/* Segment 3: Blue - Processing (~10%) */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="13"
                  strokeDasharray="301.59"
                  strokeDashoffset="280"
                  strokeLinecap="round"
                />
              </svg>

              {/* Little floating badges on the ring */}
              <div className="absolute -top-1 left-7 w-6 h-6 rounded-full bg-[#fde047] flex items-center justify-center text-[10px] font-bold text-gray-900 shadow-sm">
                $
              </div>
              <div className="absolute top-2 right-4 w-6 h-6 rounded-full bg-[#f472b6] flex items-center justify-center text-[10px] text-white shadow-sm">
                ♥
              </div>
              <div className="absolute bottom-3 left-4 w-6 h-6 rounded-full bg-[#60a5fa] flex items-center justify-center text-[10px] text-white shadow-sm">
                ∞
              </div>

              {/* Center text */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-[#1a1a2e] tracking-tight">{totalFormatted}</span>
                <span className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase">Orders</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-around text-[11px] text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fde047]" />
              <span>Delivered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6]" />
              <span>On-Time</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* 2. Top Right: Waiting for dispatch + Latest transactions (Col 5-12) */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-4">
          {/* Waiting for dispatch */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Priority review shipments
              </h2>
              <span className="text-[11px] font-semibold text-gray-400">2 pending inspection</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Review Card 1 */}
              <div className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">São Paulo Logistics Hub</p>
                    <p className="text-[10px] text-gray-400">Order #e481f51a · SP</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                    09:15 AM
                  </span>
                  <button className="text-[10px] font-bold text-white bg-[#1a1a2e] hover:bg-black px-2.5 py-1 rounded-lg transition-colors">
                    Review order
                  </button>
                </div>
              </div>

              {/* Review Card 2 */}
              <div className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">Curitiba Express Transit</p>
                    <p className="text-[10px] text-gray-400">Order #53cdb2fc · PR</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
                    09:45 AM
                  </span>
                  <button className="text-[10px] font-bold text-white bg-[#1a1a2e] hover:bg-black px-2.5 py-1 rounded-lg transition-colors">
                    Track parcel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Transactions Strip */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Recent delivered transactions
              </h2>
              <span className="text-[11px] font-semibold text-gray-400">Real-time ledger feed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tx 1 */}
              <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-400 truncate max-w-[90px]">Belo Horizonte</span>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-[#bbf7d0] px-2 py-0.5 rounded-md">
                    + R$ 568.56
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-50">
                  <span className="font-mono text-gray-700 font-semibold">#3586895</span>
                  <span>15 min ago</span>
                </div>
              </div>

              {/* Tx 2 */}
              <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-400 truncate max-w-[90px]">Rio de Janeiro</span>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-[#bbf7d0] px-2 py-0.5 rounded-md">
                    + R$ 465.40
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-50">
                  <span className="font-mono text-gray-700 font-semibold">#1244657</span>
                  <span>16 min ago</span>
                </div>
              </div>

              {/* Tx 3 */}
              <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-400 truncate max-w-[90px]">Porto Alegre</span>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-[#bbf7d0] px-2 py-0.5 rounded-md">
                    + R$ 210.00
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-50">
                  <span className="font-mono text-gray-700 font-semibold">#5476856</span>
                  <span>18 min ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

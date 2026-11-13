import React from 'react'
import { Package, Truck, Users } from 'lucide-react'

export const HeroSection: React.FC = () => {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-6 pt-5 pb-2">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1a1a2e] leading-tight">
        {greeting}, Avinash
      </h1>
      <p className="mt-1.5 text-sm text-gray-500 font-normal leading-relaxed max-w-2xl">
        Here's your order operations summary. 99,441 orders loaded and ready.
      </p>

      {/* Inline stat badges */}
      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-medium">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm">
          <Package className="w-3.5 h-3.5 text-[#1a1a2e]" />
          99,441 Total Orders
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm">
          <Truck className="w-3.5 h-3.5 text-emerald-500" />
          92.1% On-Time
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm">
          <Users className="w-3.5 h-3.5 text-indigo-500" />
          3,095 Merchants
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Data
        </span>
      </div>
    </div>
  )
}

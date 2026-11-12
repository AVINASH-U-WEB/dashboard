import React from 'react'
import { Activity, Package, Users, Truck } from 'lucide-react'

export const HeroSection: React.FC = () => {
  return (
    <div className="relative px-6 pt-5 pb-3 overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute right-12 top-0 pointer-events-none opacity-40 dark:opacity-20 hidden lg:block">
        <div className="w-72 h-72 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-[#131b2e]/80 backdrop-blur-md border border-white/60 dark:border-slate-700/60 text-xs font-semibold text-sky-700 dark:text-sky-300 shadow-glass mb-3">
          <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Operational Dashboard</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Order Ledger & Fulfillment
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
          Centralized monitoring for 99,441 Brazilian e-commerce orders. Track delivery timelines, identify shipment delays, and inspect regional fulfillment performance.
        </p>

        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mt-4 text-xs font-medium text-slate-700 dark:text-slate-200">
          <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#131b2e]/80 border border-white/60 dark:border-slate-700/60 shadow-glass flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-sky-500" />
            <span>99,441 Total Orders</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#131b2e]/80 border border-white/60 dark:border-slate-700/60 shadow-glass flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-500" />
            <span>92.1% On-Time Fulfillment</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#131b2e]/80 border border-white/60 dark:border-slate-700/60 shadow-glass flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>3,095 Active Merchants</span>
          </span>
        </div>
      </div>
    </div>
  )
}

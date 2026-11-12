import React from 'react'
import {
  Bell,
  Layers,
  Clock,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react'

export const Navbar: React.FC = () => {
  return (
    <header className="w-full select-none">
      {/* 1. Top Simulated Browser Navigation Pill (Clerio Style) */}
      <div className="flex items-center justify-between px-6 py-2 bg-white/50 backdrop-blur-md border-b border-white/60 text-xs text-slate-500">
        {/* Left: macOS Window Controls & Navigation Chevrons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400 hover:opacity-80 transition-opacity cursor-pointer shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-amber-400 hover:opacity-80 transition-opacity cursor-pointer shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 hover:opacity-80 transition-opacity cursor-pointer shadow-xs" />
          </div>

          <div className="flex items-center gap-1 text-slate-400 ml-1">
            <button className="p-1 rounded-md hover:bg-black/5 transition-colors" title="Back">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded-md hover:bg-black/5 transition-colors" title="Forward">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Browser URL Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white/80 shadow-xs font-mono text-[11px] text-slate-600">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>olist.com/orders</span>
          </div>
        </div>

        {/* Center: Live Sync Status Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 shadow-xs border border-white/80 text-slate-700 font-medium text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>99,441 Orders Synced</span>
        </div>

        {/* Right: Version / Engine */}
        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span className="hidden sm:inline">v1.0.0</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span className="font-semibold text-slate-600">Production</span>
        </div>
      </div>

      {/* 2. Main Glass Navbar */}
      <div className="flex items-center justify-between px-6 md:px-8 py-3.5">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 font-bold text-lg tracking-wide">
            ✦
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Olist Explorer
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
              Brazilian E-Commerce Ledger
            </p>
          </div>
        </div>

        {/* Central Icon Dock (Clerio Floating Island) */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-glass">
          <button
            title="Order Ledger"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white shadow-xs text-xs font-semibold transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Orders</span>
          </button>
          <button
            title="Fulfillment"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors text-xs font-medium"
          >
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Fulfillment</span>
          </button>
          <button
            title="Merchants"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors text-xs font-medium"
          >
            <Users className="w-4 h-4 text-slate-400" />
            <span>Merchants</span>
          </button>
          <button
            title="Discrepancies"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors text-xs font-medium"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Exceptions</span>
          </button>
        </div>

        {/* Right User & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Button */}
          <button
            aria-label="Notifications"
            className="relative p-2.5 rounded-2xl bg-white/75 hover:bg-white text-slate-600 border border-white/80 shadow-glass transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-white/80 shadow-glass">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              AU
            </div>
            <div className="text-left text-xs leading-tight">
              <p className="font-semibold text-slate-800">Avinash</p>
              <p className="text-[10px] text-emerald-600 font-medium">Slice 1 Lead</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

import React from 'react'
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Users,
  AlertTriangle,
  Settings,
  Database,
  CheckCircle2,
} from 'lucide-react'

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

const NavItem: React.FC<{
  icon: React.ElementType
  label: string
  count?: string | number
  active: boolean
  onClick: () => void
}> = ({ icon: Icon, label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
      active
        ? 'bg-white/15 text-white font-semibold shadow-xs'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-3 min-w-0">
      <Icon
        className={`w-4 h-4 shrink-0 transition-colors ${
          active ? 'text-yellow-400' : 'text-gray-400'
        }`}
      />
      <span className="truncate">{label}</span>
    </div>
    {count && (
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
          active ? 'bg-yellow-400/20 text-yellow-300' : 'bg-white/5 text-gray-500'
        }`}
      >
        {count}
      </span>
    )}
  </button>
)

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-[#14141f] text-white border-r border-black/30 select-none z-30">
      {/* Brand logo: Intelly style */}
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center shadow-md">
              <span className="text-[#14141f] font-black text-sm">O</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight">olist</span>
                <span className="w-2 h-2 rounded-full bg-pink-400 inline-block" />
              </div>
              <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
                Order Ledger
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Menu — ONLY required & relevant sections */}
      <div className="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Operations
          </p>
          <div className="space-y-1">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={activePage === 'dashboard' || activePage === 'orders'}
              onClick={() => onNavigate('dashboard')}
            />
            <NavItem
              icon={ShoppingBag}
              label="Orders Ledger"
              count="99.4k"
              active={activePage === 'ledger'}
              onClick={() => onNavigate('dashboard')}
            />
            <NavItem
              icon={Truck}
              label="Fulfillment & Transit"
              active={activePage === 'fulfillment'}
              onClick={() => onNavigate('dashboard')}
            />
            <NavItem
              icon={Users}
              label="Merchant Delay"
              count="3,095"
              active={activePage === 'merchants'}
              onClick={() => onNavigate('dashboard')}
            />
            <NavItem
              icon={AlertTriangle}
              label="Flagged Exceptions"
              count="4,424"
              active={activePage === 'exceptions'}
              onClick={() => onNavigate('dashboard')}
            />
          </div>
        </div>

        <div>
          <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            System
          </p>
          <div className="space-y-1">
            <NavItem
              icon={Database}
              label="SQLite Database"
              active={false}
              onClick={() => {}}
            />
            <NavItem
              icon={Settings}
              label="Settings"
              active={activePage === 'settings'}
              onClick={() => onNavigate('settings')}
            />
          </div>
        </div>
      </div>

      {/* Bottom Status Card */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* Sync indicator */}
        <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-gray-300 font-medium text-[11px]">99,441 Synced</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">
            Live DB
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-[#14141f] font-bold text-xs shadow-sm shrink-0">
            AU
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-200 truncate leading-tight">
              Avinash Uvarajan
            </p>
            <p className="text-[10px] text-gray-500 font-medium truncate">
              Lead Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

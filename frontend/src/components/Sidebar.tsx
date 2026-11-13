import React from 'react'
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Users,
  AlertTriangle,
  Settings,
  Database,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const NavItem: React.FC<{
  icon: React.ElementType
  label: string
  count?: string | number
  active: boolean
  collapsed: boolean
  onClick: () => void
}> = ({ icon: Icon, label, count, active, collapsed, onClick }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center ${
      collapsed ? 'justify-center px-0' : 'justify-between px-3.5'
    } py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
      active
        ? 'bg-white/15 text-white font-semibold shadow-xs'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
    }`}
  >
    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} min-w-0`}>
      <Icon
        className={`w-4 h-4 shrink-0 transition-colors ${
          active ? 'text-yellow-400' : 'text-gray-400'
        }`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </div>
    {!collapsed && count && (
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

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } shrink-0 h-screen sticky top-0 flex flex-col bg-[#14141f] text-white border-r border-black/30 select-none z-30 transition-all duration-300 ease-in-out`}
    >
      {/* Brand logo & Collapse Toggle */}
      <div className="px-4 pt-6 pb-5 border-b border-white/5 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center shadow-md shrink-0">
              <span className="text-[#14141f] font-black text-sm">O</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight">olist</span>
                <span className="w-2 h-2 rounded-full bg-pink-400 inline-block" />
              </div>
              <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase truncate">
                Order Ledger
              </p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center shadow-md">
              <span className="text-[#14141f] font-black text-sm">O</span>
            </div>
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className={`${
            isCollapsed ? 'mt-3 mx-auto' : ''
          } w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all`}
          title={isCollapsed ? 'Expand sidebar' : 'Close / Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        <div>
          {!isCollapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              Operations
            </p>
          )}
          <div className="space-y-1">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={activePage === 'dashboard' || activePage === 'orders'}
              collapsed={isCollapsed}
              onClick={() => onNavigate('dashboard')}
            />
            <NavItem
              icon={ShoppingBag}
              label="Orders Ledger"
              count="99.4k"
              active={activePage === 'ledger'}
              collapsed={isCollapsed}
              onClick={() => onNavigate('dashboard')}
            />
            <NavItem
              icon={Truck}
              label="Fulfillment & Transit"
              active={activePage === 'fulfillment'}
              collapsed={isCollapsed}
              onClick={() => onNavigate('dashboard')}
            />
            <NavItem
              icon={Users}
              label="Merchant Delay"
              count="3,095"
              active={activePage === 'merchants'}
              collapsed={isCollapsed}
              onClick={() => onNavigate('dashboard')}
            />
            <NavItem
              icon={AlertTriangle}
              label="Flagged Exceptions"
              count="4,424"
              active={activePage === 'exceptions'}
              collapsed={isCollapsed}
              onClick={() => onNavigate('dashboard')}
            />
          </div>
        </div>

        <div>
          {!isCollapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              System
            </p>
          )}
          <div className="space-y-1">
            <NavItem
              icon={Database}
              label="SQLite Database"
              active={false}
              collapsed={isCollapsed}
              onClick={() => {}}
            />
            <NavItem
              icon={Settings}
              label="Settings"
              active={activePage === 'settings'}
              collapsed={isCollapsed}
              onClick={() => onNavigate('settings')}
            />
          </div>
        </div>
      </div>

      {/* Bottom Status & Profile */}
      <div className="p-3 border-t border-white/5 space-y-3">
        {/* Sync indicator */}
        {!isCollapsed ? (
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
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
        ) : (
          <div className="flex justify-center" title="99,441 Synced · Live DB">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
        )}

        {/* User Profile */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} px-1 pt-1`}>
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-[#14141f] font-bold text-xs shadow-sm shrink-0"
            title="Avinash Uvarajan"
          >
            AU
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-200 truncate leading-tight">
                Avinash Uvarajan
              </p>
              <p className="text-[10px] text-gray-500 font-medium truncate">
                Administrator
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

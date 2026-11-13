import React from 'react'
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Users,
  BarChart2,
  BookOpen,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  Settings,
  LogOut,
} from 'lucide-react'

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

const NavItem: React.FC<{
  icon: React.ElementType
  label: string
  id: string
  active: boolean
  onClick: () => void
}> = ({ icon: Icon, label, id, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
      active
        ? 'bg-white/15 text-white'
        : 'text-gray-400 hover:text-white hover:bg-white/8'
    }`}
  >
    <Icon
      className={`w-4 h-4 shrink-0 transition-colors ${
        active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
      }`}
    />
    <span>{label}</span>
    {active && (
      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400" />
    )}
  </button>
)

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  return (
    <div className="w-64 shrink-0 h-screen flex flex-col bg-[#1a1a2e] border-r border-white/5 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-[#1a1a2e] font-black text-sm">O</span>
          </div>
          <div>
            <h1 className="text-white font-extrabold text-sm tracking-tight leading-none">
              Olist Explorer
            </h1>
            <p className="text-gray-500 text-[10px] mt-0.5 font-medium tracking-wider uppercase">
              E-Commerce Ledger
            </p>
          </div>
        </div>
      </div>

      {/* Nav — General */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-4 pb-1 text-[10px] font-bold tracking-widest text-gray-600 uppercase">
          General
        </p>

        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          id="dashboard"
          active={activePage === 'dashboard' || activePage === 'orders'}
          onClick={() => onNavigate('orders')}
        />
        <NavItem
          icon={ShoppingBag}
          label="Orders"
          id="orders"
          active={activePage === 'orders-list'}
          onClick={() => onNavigate('orders-list')}
        />
        <NavItem
          icon={Truck}
          label="Fulfillment"
          id="fulfillment"
          active={activePage === 'fulfillment'}
          onClick={() => onNavigate('fulfillment')}
        />
        <NavItem
          icon={Users}
          label="Merchants"
          id="merchants"
          active={activePage === 'merchants'}
          onClick={() => onNavigate('merchants')}
        />
        <NavItem
          icon={BarChart2}
          label="Statistics & Reports"
          id="stats"
          active={activePage === 'stats'}
          onClick={() => onNavigate('stats')}
        />
        <NavItem
          icon={BookOpen}
          label="Education"
          id="education"
          active={activePage === 'education'}
          onClick={() => onNavigate('education')}
        />
        <NavItem
          icon={BookOpen}
          label="My Articles"
          id="articles"
          active={activePage === 'articles'}
          onClick={() => onNavigate('articles')}
        />

        {/* Tools Section */}
        <div className="pt-4">
          <p className="px-4 pb-1 text-[10px] font-bold tracking-widest text-gray-600 uppercase">
            Tools
          </p>
        </div>

        <NavItem
          icon={MessageSquare}
          label="Alerts"
          id="alerts"
          active={activePage === 'alerts'}
          onClick={() => onNavigate('alerts')}
        />
        <NavItem
          icon={CreditCard}
          label="Billing"
          id="billing"
          active={activePage === 'billing'}
          onClick={() => onNavigate('billing')}
        />
        <NavItem
          icon={AlertTriangle}
          label="Exceptions"
          id="exceptions"
          active={activePage === 'exceptions'}
          onClick={() => onNavigate('exceptions')}
        />
        <NavItem
          icon={Settings}
          label="Settings"
          id="settings"
          active={activePage === 'settings'}
          onClick={() => onNavigate('settings')}
        />
        <NavItem
          icon={LogOut}
          label="Log out"
          id="logout"
          active={false}
          onClick={() => {}}
        />
      </nav>

      {/* Bottom Status */}
      <div className="px-5 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-gray-400 font-medium">
            <span className="text-emerald-400 font-semibold">99,441</span> Synced
          </span>
        </div>
        <p className="text-gray-600 text-[10px] mt-1">Live · Olist Dataset</p>
      </div>
    </div>
  )
}

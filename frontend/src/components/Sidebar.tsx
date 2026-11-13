import React from 'react'
import {
  LayoutDashboard,
  Calendar,
  Truck,
  Users,
  BarChart2,
  BookOpen,
  FileText,
  MessageSquare,
  CreditCard,
  FolderLock,
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
}> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
      active
        ? 'bg-white/10 text-white font-semibold'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
    }`}
  >
    <Icon
      className={`w-4 h-4 shrink-0 ${
        active ? 'text-white' : 'text-gray-500'
      }`}
    />
    <span className="truncate">{label}</span>
  </button>
)

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  return (
    <div className="w-60 shrink-0 h-screen flex flex-col bg-[#14141f] text-white border-r border-black/20 select-none">
      {/* Brand logo: intelly style */}
      <div className="px-6 pt-7 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold tracking-tight lowercase font-sans">
            olist
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] inline-block mb-1" />
        </div>
        <button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <span className="text-xs">‹</span>
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-4 py-2 overflow-y-auto space-y-6">
        {/* General */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            General
          </p>
          <div className="space-y-1">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              id="dashboard"
              active={activePage === 'dashboard' || activePage === 'orders'}
              onClick={() => onNavigate('dashboard')}
            />
            <NavItem
              icon={Calendar}
              label="Schedule"
              id="schedule"
              active={activePage === 'schedule'}
              onClick={() => onNavigate('schedule')}
            />
            <NavItem
              icon={Truck}
              label="Fulfillment"
              id="fulfillment"
              active={activePage === 'fulfillment'}
              onClick={() => onNavigate('fulfillment')}
            />
            <NavItem
              icon={BarChart2}
              label="Statistics & reports"
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
              icon={FileText}
              label="My articles"
              id="articles"
              active={activePage === 'articles'}
              onClick={() => onNavigate('articles')}
            />
          </div>
        </div>

        {/* Tools */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Tools
          </p>
          <div className="space-y-1">
            <NavItem
              icon={MessageSquare}
              label="Chats & calls"
              id="chats"
              active={activePage === 'chats'}
              onClick={() => onNavigate('chats')}
            />
            <NavItem
              icon={CreditCard}
              label="Billing"
              id="billing"
              active={activePage === 'billing'}
              onClick={() => onNavigate('billing')}
            />
            <NavItem
              icon={FolderLock}
              label="Documents base"
              id="docs"
              active={activePage === 'docs'}
              onClick={() => onNavigate('docs')}
            />
            <NavItem
              icon={Settings}
              label="Settings"
              id="settings"
              active={activePage === 'settings'}
              onClick={() => onNavigate('settings')}
            />
          </div>
        </div>
      </div>

      {/* Log out link */}
      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium text-gray-400 hover:text-rose-400 hover:bg-white/5 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}

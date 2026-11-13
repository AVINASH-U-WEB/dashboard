import React, { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Search, Bell, Settings, PanelLeft, X } from 'lucide-react'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex h-screen bg-[#f5f5f0] overflow-hidden font-sans">
      {/* Collapsible Fixed Dark Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Bar with Functional Search and Sidebar Toggle */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto">
          <Dashboard
            activePage={activePage}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
          />
        </main>
      </div>
    </div>
  )
}

/* ─────────────────── Clean TopBar (No Unwanted In: Pills) ─────────────────── */
interface TopBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-8 py-3.5 bg-[#f5f5f0]/95 backdrop-blur-sm border-b border-gray-200/60">
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Sidebar Toggle Button (Click to Open / Close Sidebar) */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-white border border-gray-200/80 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-xs shrink-0"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Clean, Full Search Input (Unwanted In: pills removed!) */}
        <div className="flex items-center flex-1 gap-2.5 bg-white rounded-2xl px-4 py-2 border border-gray-200/80 shadow-xs">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order ID, city (e.g. sao paulo, SP), state, or category..."
            className="flex-1 text-xs md:text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400 min-w-0"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white" />
        </button>

        {/* Settings */}
        <button
          className="w-9 h-9 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="w-7 h-7 rounded-xl bg-[#14141f] text-yellow-400 font-black text-xs flex items-center justify-center">
            AU
          </div>
          <span className="text-xs font-bold text-gray-800 hidden sm:inline">
            Avinash Uvarajan
          </span>
        </div>
      </div>
    </header>
  )
}

import React, { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Search, Bell, Settings } from 'lucide-react'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="flex h-screen bg-[#f5f5f0] overflow-hidden font-sans">
      {/* Fixed Dark Sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

/* ─────────────────── Clean Intelly-style TopBar ─────────────────── */
const TopBar: React.FC = () => {
  const [search, setSearch] = useState('')
  const filters = ['All Orders', 'Delivered', 'In-Transit', 'Exceptions']
  const [activeFilter, setActiveFilter] = useState('All Orders')

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-8 py-3.5 bg-[#f5f5f0]/95 backdrop-blur-sm border-b border-gray-200/60">
      {/* Search Input with inline "In:" pills */}
      <div className="flex items-center flex-1 max-w-2xl gap-2.5 bg-white rounded-2xl px-4 py-2 border border-gray-200/80 shadow-xs">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search 99,441 orders, customers, cities..."
          className="flex-1 text-xs md:text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400 min-w-0"
        />

        <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-gray-200">
          <span className="text-[11px] text-gray-400 font-semibold px-1">In:</span>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                activeFilter === f
                  ? 'bg-[#14141f] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
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

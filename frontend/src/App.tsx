import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Customers } from './pages/Customers'
import { TopBar } from './layouts/TopBar'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex h-screen bg-[#f5f5f0] overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">

        {/* Top Bar */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">

          {activePage === 'customers' ? (
            <Customers />
          ) : (
            <Dashboard
              activePage={activePage}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          )}

        </main>
      </div>
    </div>
  )
}

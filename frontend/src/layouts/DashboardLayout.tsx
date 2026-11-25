import type { FC } from 'react'
import { useState } from 'react'
import { Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const HIDDEN_TOPBAR_ROUTES = new Set(['/sla', '/tickets', '/customers'])

export interface DashboardOutletContext {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function useDashboardContext() {
  return useOutletContext<DashboardOutletContext>()
}

export const DashboardLayout: FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { pathname } = useLocation()

  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const showTopBar = !HIDDEN_TOPBAR_ROUTES.has(normalizedPath)

  const contextValue: DashboardOutletContext = {
    searchQuery,
    onSearchChange: setSearchQuery,
  }

  return (
    <div className="flex h-screen bg-[#f5f5f0] overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Bar */}
        {showTopBar && (
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

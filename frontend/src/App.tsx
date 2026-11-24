import type { FC } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout, useDashboardContext } from './layouts/DashboardLayout'
import { Dashboard } from './pages/Dashboard'
import { Customers } from './pages/Customers'
import { TicketsPage } from './pages/TicketsPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

interface DashboardRouteProps {
  activePage: string
}

const DashboardRoute: FC<DashboardRouteProps> = ({ activePage }) => {
  const { searchQuery, onSearchChange } = useDashboardContext()
  return (
    <Dashboard
      activePage={activePage}
      searchQuery={searchQuery}
      onClearSearch={() => onSearchChange('')}
    />
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardRoute activePage="dashboard" />} />
        <Route path="/orders" element={<DashboardRoute activePage="ledger" />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/sla" element={<DashboardRoute activePage="sla_escalations" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

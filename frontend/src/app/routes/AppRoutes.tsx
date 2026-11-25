import type { FC } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout, useDashboardContext } from '../../layouts/DashboardLayout'
import { Dashboard } from '../../features/orders/pages/Dashboard'
import { Customers } from '../../features/customers/pages/Customers'
import { TicketsPage } from '../../features/tickets/pages/TicketsPage'
import { SLADashboard } from '../../features/sla/pages/SLADashboard'
import { SettingsPage } from '../../pages/SettingsPage'
import { NotFoundPage } from '../../pages/NotFoundPage'

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

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardRoute activePage="dashboard" />} />
        <Route path="/orders" element={<DashboardRoute activePage="ledger" />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/sla" element={<SLADashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

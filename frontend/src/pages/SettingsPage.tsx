import type { FC } from 'react'
import { Settings } from 'lucide-react'
import { EmptyState } from '../shared/components/ui/EmptyState'

export const SettingsPage: FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12">
        <EmptyState
          icon={<Settings className="w-6 h-6 text-gray-600" aria-hidden="true" />}
          title="System Settings"
          description="System configuration, alerting thresholds, team permissions, and API integrations are currently under development."
        />
      </div>
    </div>
  )
}

export default SettingsPage

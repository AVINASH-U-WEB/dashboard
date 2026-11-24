import type { FC } from 'react'
import { Ticket } from 'lucide-react'
import { EmptyState } from '../../../shared/components/ui/EmptyState'

export const TicketsPage: FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12">
        <EmptyState
          icon={<Ticket className="w-6 h-6 text-yellow-600" aria-hidden="true" />}
          title="Ticketing Module (Write Layer)"
          description="Customer support ticket creation, agent assignment, and resolution workflows are currently under development."
        />
      </div>
    </div>
  )
}

export default TicketsPage

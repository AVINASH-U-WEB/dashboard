import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Inbox,
  Ticket as TicketIcon,
} from 'lucide-react'
import { MiniBarChart } from '../../orders/components/MiniBarChart'
import { useTicketStats } from '../hooks/useTicketStats'
import type { Ticket } from '../types/ticket'

interface TicketStatsProps {
  tickets: Ticket[]
}

export default function TicketStats({ tickets }: TicketStatsProps) {
  const stats = useTicketStats(tickets)

  const cards = [
    {
      bg: 'bg-[#fef08a]',
      borderColor: 'border-yellow-300/60',
      icon: TicketIcon,
      label: 'Total Tickets',
      sub: 'All logged support cases',
      value: stats.total.toLocaleString(),
      stat1Label: 'Active',
      stat1Value: stats.active.toLocaleString(),
      stat2Label: 'Resolved',
      stat2Value: stats.resolved.toLocaleString(),
      chartVariant: 'mixed' as const,
    },
    {
      bg: 'bg-[#fbcfe8]',
      borderColor: 'border-pink-300/60',
      icon: Inbox,
      label: 'Open Queue',
      sub: 'Awaiting initial triage',
      value: stats.open.toLocaleString(),
      stat1Label: 'Queue Share',
      stat1Value: stats.openSharePct,
      stat2Label: 'High Priority',
      stat2Value: stats.highPriorityOpen.toLocaleString(),
      chartVariant: 'red' as const,
    },
    {
      bg: 'bg-[#bae6fd]',
      borderColor: 'border-sky-300/60',
      icon: Clock,
      label: 'In Progress',
      sub: 'Active agent investigation',
      value: stats.inProgress.toLocaleString(),
      stat1Label: 'High Priority',
      stat1Value: stats.inProgressHigh.toLocaleString(),
      stat2Label: 'Medium / Low',
      stat2Value: stats.inProgressOther.toLocaleString(),
      chartVariant: 'blue' as const,
    },
    {
      bg: 'bg-[#bbf7d0]',
      borderColor: 'border-green-300/60',
      icon: CheckCircle2,
      label: 'Resolution Rate',
      sub: 'Closed & verified cases',
      value: stats.resolutionRate,
      stat1Label: 'Resolved',
      stat1Value: stats.resolved.toLocaleString(),
      stat2Label: 'Remaining',
      stat2Value: stats.active.toLocaleString(),
      chartVariant: 'green' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`${card.bg} rounded-3xl p-5 border ${card.borderColor} shadow-xs relative overflow-hidden transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-black/10">
                  <Icon className="w-4 h-4 text-[#14141f]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#14141f] tracking-tight">
                    {card.label}
                  </h3>
                  <p className="text-[10px] text-black/60 font-medium">
                    {card.sub}
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-full bg-black/5">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#14141f]" />
              </div>
            </div>

            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-[#14141f]">
                {card.value}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] border-t border-black/10 pt-2.5">
              <div>
                <span className="text-black/50 block text-[10px] uppercase font-semibold">
                  {card.stat1Label}
                </span>
                <span className="font-extrabold text-[#14141f]">
                  {card.stat1Value}
                </span>
              </div>
              <div className="text-right">
                <span className="text-black/50 block text-[10px] uppercase font-semibold">
                  {card.stat2Label}
                </span>
                <span className="font-extrabold text-[#14141f]">
                  {card.stat2Value}
                </span>
              </div>
            </div>

            <div className="mt-2.5">
              <MiniBarChart variant={card.chartVariant} barCount={16} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

import React from 'react'
import { ArrowUpRight, CheckCircle2, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { useStats } from './useStats'
import { MiniBarChart } from './MiniBarChart'

export const StatsBar: React.FC = () => {
  const { data: stats } = useStats()

  const deliveredPct = stats
    ? (stats.by_status?.delivered
        ? ((stats.by_status.delivered / (stats.total || 1)) * 100).toFixed(2)
        : '97.00')
    : '97.00'
  const latePct = stats ? stats.late_pct.toFixed(2) : '7.90'
  const onTimePct = (100 - parseFloat(latePct)).toFixed(2)
  const anomalyPct = stats ? stats.anomaly_pct.toFixed(2) : '4.45'

  const cards = [
    {
      bg: 'bg-[#f5e642]',
      icon: CheckCircle2,
      iconColor: 'text-[#1a1a2e]',
      label: 'Fulfillment Rate',
      sub: 'Delivered shipments',
      value: `${deliveredPct}%`,
      dot: 'bg-emerald-600',
      stat1Label: 'Delivered',
      stat1Value: stats?.by_status?.delivered?.toLocaleString() ?? '96,478',
      stat1Color: 'text-[#1a1a2e]',
      stat2Label: 'In-Transit',
      stat2Value: stats?.by_status?.shipped?.toLocaleString() ?? '1,107',
      stat2Color: 'text-[#1a1a2e]',
      chartVariant: 'green' as const,
    },
    {
      bg: 'bg-[#f9a8d4]',
      icon: Clock,
      iconColor: 'text-[#1a1a2e]',
      label: 'On-Time Rate',
      sub: 'Ahead of estimate',
      value: `${onTimePct}%`,
      dot: 'bg-emerald-600',
      stat1Label: 'On Schedule',
      stat1Value: (stats?.total
        ? stats.total - (stats.late_deliveries || 0)
        : 91580
      ).toLocaleString(),
      stat1Color: 'text-[#1a1a2e]',
      stat2Label: 'Delayed',
      stat2Value: stats?.late_deliveries?.toLocaleString() ?? '7,861',
      stat2Color: 'text-rose-700',
      chartVariant: 'blue' as const,
    },
    {
      bg: 'bg-[#bbf7d0]',
      icon: AlertTriangle,
      iconColor: 'text-[#1a1a2e]',
      label: 'Discrepancies',
      sub: 'Irregular transit times',
      value: `${anomalyPct}%`,
      dot: 'bg-rose-600',
      stat1Label: 'Flagged',
      stat1Value: stats?.anomalies?.toLocaleString() ?? '4,424',
      stat1Color: 'text-rose-700',
      stat2Label: 'Standard',
      stat2Value: (stats?.total
        ? stats.total - (stats.anomalies || 0)
        : 95017
      ).toLocaleString(),
      stat2Color: 'text-[#1a1a2e]',
      chartVariant: 'red' as const,
    },
    {
      bg: 'bg-[#bae6fd]',
      icon: TrendingUp,
      iconColor: 'text-[#1a1a2e]',
      label: 'Merchant Delay',
      sub: 'Seller late rate',
      value: `${latePct}%`,
      dot: 'bg-amber-600',
      stat1Label: 'Merchants',
      stat1Value: '3,095',
      stat1Color: 'text-[#1a1a2e]',
      stat2Label: 'High Delay',
      stat2Value: '238',
      stat2Color: 'text-amber-700',
      chartVariant: 'mixed' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`${card.bg} rounded-2xl p-5 relative overflow-hidden group border border-black/5 shadow-sm hover:shadow-md transition-all`}
          >
            {/* Decorative shape */}
            <div className="absolute right-0 bottom-0 w-24 h-24 opacity-10 pointer-events-none">
              <div className="w-full h-full rounded-full border-[12px] border-black translate-x-6 translate-y-6" />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-black/10">
                    <Icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1a1a2e] tracking-tight">
                      {card.label}
                    </h3>
                    <p className="text-[10px] text-black/50 font-medium">{card.sub}</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#1a1a2e]" />
                </button>
              </div>

              {/* Value */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-[#1a1a2e]">
                  {card.value}
                </span>
                <span className={`w-2 h-2 rounded-full ${card.dot}`} />
              </div>

              {/* Sub-stats */}
              <div className="mt-3 flex items-center justify-between text-[11px] border-t border-black/10 pt-2.5">
                <div>
                  <span className="text-black/40 block text-[10px]">{card.stat1Label}</span>
                  <span className={`font-semibold ${card.stat1Color}`}>{card.stat1Value}</span>
                </div>
                <div className="text-right">
                  <span className="text-black/40 block text-[10px]">{card.stat2Label}</span>
                  <span className={`font-semibold ${card.stat2Color}`}>{card.stat2Value}</span>
                </div>
              </div>

              {/* Mini chart */}
              <div className="mt-2">
                <MiniBarChart variant={card.chartVariant} barCount={16} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

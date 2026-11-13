import React from 'react'
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react'
import { useStats } from './useStats'
import { MiniBarChart } from './MiniBarChart'

export const StatsBar: React.FC = () => {
  const { data: stats } = useStats()

  const total = stats?.total || 99441
  const deliveredCount = stats?.by_status?.delivered ?? 96478
  const deliveredPct = ((deliveredCount / total) * 100).toFixed(1)
  const latePct = stats ? stats.late_pct.toFixed(1) : '7.9'
  const onTimePct = (100 - parseFloat(latePct)).toFixed(1)
  const anomalyCount = stats?.anomalies ?? 4424
  const anomalyPct = stats ? stats.anomaly_pct.toFixed(2) : '4.45'

  const cards = [
    {
      bg: 'bg-[#fef08a]', // Soft Yellow
      borderColor: 'border-yellow-300/60',
      icon: CheckCircle2,
      label: 'Fulfillment Rate',
      sub: 'Delivered shipments',
      value: `${deliveredPct}%`,
      stat1Label: 'Delivered',
      stat1Value: deliveredCount.toLocaleString(),
      stat2Label: 'Shipped',
      stat2Value: (stats?.by_status?.shipped ?? 1107).toLocaleString(),
      chartVariant: 'green' as const,
    },
    {
      bg: 'bg-[#fbcfe8]', // Soft Pink
      borderColor: 'border-pink-300/60',
      icon: Clock,
      label: 'On-Time Rate',
      sub: 'Ahead of estimate',
      value: `${onTimePct}%`,
      stat1Label: 'On Schedule',
      stat1Value: (total - (stats?.late_deliveries || 7861)).toLocaleString(),
      stat2Label: 'Delayed',
      stat2Value: (stats?.late_deliveries ?? 7861).toLocaleString(),
      chartVariant: 'blue' as const,
    },
    {
      bg: 'bg-[#bae6fd]', // Soft Blue
      borderColor: 'border-sky-300/60',
      icon: TrendingUp,
      label: 'Sliding-Window Seller Rate',
      sub: 'Last 30 orders late rate',
      value: `${latePct}%`,
      stat1Label: 'Merchants',
      stat1Value: '3,095',
      stat2Label: 'High Delay',
      stat2Value: '238',
      chartVariant: 'mixed' as const,
    },
    {
      bg: 'bg-[#bbf7d0]', // Soft Green
      borderColor: 'border-green-300/60',
      icon: AlertTriangle,
      label: 'Category Lag Z-Score',
      sub: 'Statistical outliers (>2σ)',
      value: `${anomalyPct}%`,
      stat1Label: 'Flagged',
      stat1Value: anomalyCount.toLocaleString(),
      stat2Label: 'Standard',
      stat2Value: (total - anomalyCount).toLocaleString(),
      chartVariant: 'red' as const,
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
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-black/10">
                  <Icon className="w-4 h-4 text-[#14141f]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#14141f] tracking-tight">
                    {card.label}
                  </h3>
                  <p className="text-[10px] text-black/60 font-medium">{card.sub}</p>
                </div>
              </div>
              <div className="p-1 rounded-full bg-black/5">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#14141f]" />
              </div>
            </div>

            {/* Value */}
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-[#14141f]">
                {card.value}
              </span>
            </div>

            {/* Sub-stats */}
            <div className="mt-3 flex items-center justify-between text-[11px] border-t border-black/10 pt-2.5">
              <div>
                <span className="text-black/50 block text-[10px] uppercase font-semibold">{card.stat1Label}</span>
                <span className="font-extrabold text-[#14141f]">{card.stat1Value}</span>
              </div>
              <div className="text-right">
                <span className="text-black/50 block text-[10px] uppercase font-semibold">{card.stat2Label}</span>
                <span className="font-extrabold text-[#14141f]">{card.stat2Value}</span>
              </div>
            </div>

            {/* Mini chart */}
            <div className="mt-2.5">
              <MiniBarChart variant={card.chartVariant} barCount={16} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

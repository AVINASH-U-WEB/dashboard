import React from 'react'

interface MiniBarChartProps {
  variant?: 'green' | 'red' | 'blue' | 'mixed'
  height?: number
  barCount?: number
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  variant = 'green',
  height = 36,
  barCount = 18,
}) => {
  // Deterministic seed pattern for pleasing chart aesthetics
  const pattern = [25, 45, 60, 30, 80, 50, 95, 40, 70, 85, 35, 60, 90, 75, 40, 65, 80, 55]

  return (
    <div className="flex items-end gap-1 h-9 pt-1">
      {Array.from({ length: barCount }).map((_, i) => {
        const val = pattern[i % pattern.length]
        const barHeight = Math.max(6, Math.round((val / 100) * height))
        
        let color = 'bg-emerald-400/80'
        if (variant === 'red') {
          color = i % 3 === 0 ? 'bg-rose-400' : 'bg-rose-200'
        } else if (variant === 'blue') {
          color = 'bg-sky-400/80'
        } else if (variant === 'mixed') {
          color = val > 70 ? 'bg-rose-400' : 'bg-emerald-400'
        }

        return (
          <div
            key={i}
            className={`w-1 rounded-t-sm transition-all duration-300 hover:opacity-100 opacity-80 ${color}`}
            style={{ height: `${barHeight}px` }}
          />
        )
      })}
    </div>
  )
}


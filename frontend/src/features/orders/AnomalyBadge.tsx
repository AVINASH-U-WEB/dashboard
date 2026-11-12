import React from 'react'

interface AnomalyBadgeProps {
  isAnomaly: number | boolean
  zscore?: number | null
}

export const AnomalyBadge: React.FC<AnomalyBadgeProps> = ({ isAnomaly, zscore }) => {
  if (!isAnomaly) return null

  return (
    <span
      title={zscore ? `Z-Score: ${zscore.toFixed(2)}` : 'Delivery duration is atypical'}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 shadow-xs cursor-help"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
      <span>Exception</span>
    </span>
  )
}

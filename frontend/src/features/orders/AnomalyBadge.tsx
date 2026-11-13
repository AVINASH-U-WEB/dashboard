import React from 'react'

interface AnomalyBadgeProps {
  isAnomaly: number | boolean
  zscore?: number | null
}

export const AnomalyBadge: React.FC<AnomalyBadgeProps> = ({ isAnomaly, zscore }) => {
  if (!isAnomaly) return null

  return (
    <span
      title={zscore ? `Deviation factor: ${zscore.toFixed(2)}` : 'Delivery duration is atypical'}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 cursor-help"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      <span>Exception</span>
    </span>
  )
}

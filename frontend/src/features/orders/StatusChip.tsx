import React from 'react'
import { OrderStatus } from '../../types/order'

interface StatusChipProps {
  status: OrderStatus | string
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const norm = (status || '').toLowerCase()

  let style = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  let dotColor = 'bg-slate-400'

  if (norm === 'delivered') {
    style = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
    dotColor = 'bg-emerald-500'
  } else if (norm === 'shipped') {
    style = 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60'
    dotColor = 'bg-sky-500'
  } else if (norm === 'canceled') {
    style = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60'
    dotColor = 'bg-rose-500'
  } else if (norm === 'processing' || norm === 'invoiced') {
    style = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
    dotColor = 'bg-amber-500'
  } else if (norm === 'approved') {
    style = 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60'
    dotColor = 'bg-indigo-500'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{status}</span>
    </span>
  )
}

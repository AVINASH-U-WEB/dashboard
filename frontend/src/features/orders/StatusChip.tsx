import React from 'react'
import { OrderStatus } from '../../types/order'

interface StatusChipProps {
  status: OrderStatus | string
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const norm = (status || '').toLowerCase()

  let style = 'bg-gray-100 text-gray-700'
  let label = status

  if (norm === 'delivered') {
    style = 'bg-pink-100 text-pink-700'
    label = 'Delivered'
  } else if (norm === 'shipped') {
    style = 'bg-sky-100 text-sky-800'
    label = 'Shipped'
  } else if (norm === 'canceled') {
    style = 'bg-rose-100 text-rose-700'
    label = 'Canceled'
  } else if (norm === 'processing' || norm === 'invoiced') {
    style = 'bg-amber-100 text-amber-800'
    label = norm === 'processing' ? 'Processing' : 'Invoiced'
  } else if (norm === 'approved') {
    style = 'bg-emerald-100 text-emerald-700'
    label = 'Approved'
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-tight text-center ${style}`}>
      {label}
    </span>
  )
}

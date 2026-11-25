import React from 'react'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
  default: {
    badge: 'bg-gray-100 text-gray-700 border border-gray-200/80',
    dot: 'bg-gray-400',
  },
  success: {
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60',
    dot: 'bg-emerald-500',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-800 border border-amber-200/60',
    dot: 'bg-amber-500',
  },
  danger: {
    badge: 'bg-rose-100 text-rose-700 border border-rose-200/60',
    dot: 'bg-rose-500',
  },
  info: {
    badge: 'bg-sky-100 text-sky-800 border border-sky-200/60',
    dot: 'bg-sky-500',
  },
}

const sizeStyles: Record<BadgeSize, { badge: string; dot: string }> = {
  sm: {
    badge: 'text-[10px] px-2 py-0.5 gap-1',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    badge: 'text-[11px] px-2.5 py-1 gap-1.5',
    dot: 'w-1.5 h-1.5',
  },
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const selectedVariant = variantStyles[variant] || variantStyles.default
  const selectedSize = sizeStyles[size] || sizeStyles.md

  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight rounded-full transition-colors select-none ${selectedVariant.badge} ${selectedSize.badge} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span
          className={`rounded-full shrink-0 ${selectedVariant.dot} ${selectedSize.dot}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

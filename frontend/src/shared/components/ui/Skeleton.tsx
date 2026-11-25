import type { CSSProperties } from 'react'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
  count?: number
}

const roundedStyles = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  className = '',
  count = 1,
}: SkeletonProps) {
  const safeCount = Math.min(20, Math.max(1, Math.floor(count)))

  const style: CSSProperties = {
    width,
    height,
  }

  return (
    <div
      className={`flex flex-col gap-2 ${className}`.trim()}
      aria-hidden="true"
    >
      {Array.from({ length: safeCount }, (_, index) => (
        <div
          key={index}
          style={style}
          className={`animate-pulse bg-gray-200/80 ${roundedStyles[rounded]}`}
        />
      ))}
    </div>
  )
}

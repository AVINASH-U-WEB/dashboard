import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title = 'No results found',
  description = 'There is nothing to display right now.',
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <section
      role="status"
      className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`.trim()}
    >
     <div
  aria-hidden="true"
  className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 mb-4"
>
        {icon ?? <Inbox size={22} aria-hidden="true" />}
      </div>

      <h3 className="text-sm font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-gray-500">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </section>
  )
}

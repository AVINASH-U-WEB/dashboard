import type { FC } from 'react'
import { Pagination } from '../../../shared/components/ui/Pagination'
import type { SLAPaginationMeta } from '../types/sla'

export interface SLAPaginationFooterProps {
  meta: SLAPaginationMeta
  itemLabel: string
  onPageChange: (page: number) => void
  disabled?: boolean
}

export const SLAPaginationFooter: FC<SLAPaginationFooterProps> = ({
  meta,
  itemLabel,
  onPageChange,
  disabled = false,
}) => {
  return (
    <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-sm text-gray-500">
        Page {meta.page} of {Math.max(1, meta.total_pages).toLocaleString()}
        {' · '}
        Showing {meta.count.toLocaleString()} of {meta.total.toLocaleString()}{' '}
        {itemLabel}
      </p>

      <Pagination
        currentPage={meta.page}
        totalPages={meta.total_pages}
        onPageChange={onPageChange}
        disabled={disabled}
      />
    </div>
  )
}

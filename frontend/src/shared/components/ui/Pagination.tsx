import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className = '',
}: PaginationProps) {
  const safeTotalPages = Math.max(0, Math.floor(totalPages))
  const safeCurrentPage =
    safeTotalPages > 0
      ? Math.min(Math.max(1, Math.floor(currentPage)), safeTotalPages)
      : 0

  if (safeTotalPages <= 1) return null

  const isFirstPage = safeCurrentPage === 1
  const isLastPage = safeCurrentPage === safeTotalPages

  const getVisiblePages = () => {
    const pages = new Set<number>([1, safeTotalPages])

    for (
      let page = Math.max(2, safeCurrentPage - 1);
      page <= Math.min(safeTotalPages - 1, safeCurrentPage + 1);
      page++
    ) {
      pages.add(page)
    }

    return [...pages].sort((a, b) => a - b)
  }

  const visiblePages = getVisiblePages()

  const buttonBase =
    'inline-flex items-center justify-center min-w-9 h-9 rounded-xl text-sm font-medium transition-colors'

  const navigationButton = `${buttonBase} border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`

  const pageButton = `${buttonBase} border border-transparent text-gray-600 hover:bg-gray-100`

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1.5 ${className}`.trim()}
    >
      <button
        type="button"
        aria-label="Go to previous page"
        disabled={disabled || isFirstPage}
        onClick={() => onPageChange(safeCurrentPage - 1)}
        className={navigationButton}
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      {visiblePages.map((page, index) => {
        const previousPage = visiblePages[index - 1]
        const showEllipsis =
          previousPage !== undefined && page - previousPage > 1

        return (
          <span key={page} className="flex items-center gap-1.5">
            {showEllipsis && (
              <span aria-hidden="true" className="px-1 text-gray-400">
                ...
              </span>
            )}

            <button
              type="button"
              aria-label={`Go to page ${page}`}
              aria-current={page === safeCurrentPage ? 'page' : undefined}
              disabled={disabled}
              onClick={() => onPageChange(page)}
              className={
                page === safeCurrentPage
                  ? `${buttonBase} bg-[#14141f] text-white shadow-sm`
                  : pageButton
              }
            >
              {page}
            </button>
          </span>
        )
      })}

      <button
        type="button"
        aria-label="Go to next page"
        disabled={disabled || isLastPage}
        onClick={() => onPageChange(safeCurrentPage + 1)}
        className={navigationButton}
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}

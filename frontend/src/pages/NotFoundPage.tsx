import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { EmptyState } from '../shared/components/ui/EmptyState'

export const NotFoundPage: FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12">
        <EmptyState
          icon={<FileQuestion className="w-6 h-6 text-gray-500" aria-hidden="true" />}
          title="404 - Page Not Found"
          description="The page you are looking for does not exist or has been moved."
          action={
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-xs transition-colors"
            >
              Return to Dashboard
            </Link>
          }
        />
      </div>
    </div>
  )
}

export default NotFoundPage

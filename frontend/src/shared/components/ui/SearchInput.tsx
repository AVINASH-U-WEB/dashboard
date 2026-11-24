import type { FC, InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  showClearButton?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
  'aria-label'?: string
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  showClearButton = true,
  placeholder = 'Search...',
  disabled = false,
  className = '',
  inputClassName = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const handleClear = () => {
    onChange('')
    if (onClear) {
      onClear()
    }
  }

  const hasValue = Boolean(value && value.trim().length > 0)
  const canClear = showClearButton && hasValue && !disabled

  return (
    <div
      className={`flex items-center gap-2.5 bg-white rounded-2xl px-3.5 py-2 border border-gray-200/80 shadow-xs transition-colors focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-300/60 ${
        disabled ? 'opacity-60 bg-gray-50/80 cursor-not-allowed' : ''
      } ${className}`.trim()}
    >
      <Search
        className="w-4 h-4 text-gray-400 shrink-0 select-none"
        aria-hidden="true"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
        className={`flex-1 text-xs md:text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400 min-w-0 disabled:cursor-not-allowed ${inputClassName}`.trim()}
        {...props}
      />

      {canClear && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300"
          title="Clear search"
          aria-label="Clear search input"
        >
          <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

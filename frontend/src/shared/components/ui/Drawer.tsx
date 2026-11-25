import { useEffect, useRef, useId } from 'react'
import type { ReactNode, MouseEvent, SyntheticEvent } from 'react'
import { X } from 'lucide-react'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  side?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  side = 'right',
  size = 'md',
  className = '',
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const baseId = useId()
  const titleId = `${baseId}-title`
  const descriptionId = `${baseId}-description`

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return

    if (!dialog.open) {
      dialog.showModal()
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [open])

  if (!open) {
    return null
  }

  // Native Escape key cancellation handler
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault()
    onClose()
  }

  // Backdrop click handler
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const slideAnimationClass =
    side === 'right' ? 'drawer-slide-right ml-auto' : 'drawer-slide-left mr-auto'

  return (
    <>
      <dialog
        ref={dialogRef}
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/40 backdrop:backdrop-blur-xs hidden open:flex ${
          side === 'right' ? 'justify-end' : 'justify-start'
        } ${className}`.trim()}
      >
        <section
          className={`flex h-full w-full ${sizeStyles[size]} flex-col bg-white shadow-2xl ${slideAnimationClass}`}
        >
          <header className="flex items-center justify-between border-b border-gray-200/80 px-6 py-4">
            <div>
              <h2
                id={titleId}
                className="text-base font-bold text-gray-900 tracking-tight"
              >
                {title}
              </h2>

              {description && (
                <p
                  id={descriptionId}
                  className="mt-0.5 text-xs text-gray-500 font-normal"
                >
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </section>
      </dialog>
    </>
  )
}

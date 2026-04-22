import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  /** Prevent closing on overlay click */
  persistent?: boolean
  className?: string
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  persistent = false,
  className = '',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Trap focus & ESC key
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, persistent, onClose])

  if (!open) return null

  return createPortal(
    <ModalOverlay onClick={persistent ? undefined : onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        onClick={(e) => e.stopPropagation()}
        className={[
          'relative w-full bg-white border border-light-gray rounded-2xl shadow-modal',
          'animate-slide-up',
          sizeClasses[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Header */}
        {(title || !persistent) && (
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-light-gray">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-display font-semibold text-charcoal"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="text-xs font-body text-medium-gray mt-0.5"
                >
                  {description}
                </p>
              )}
            </div>
            {!persistent && (
              <button
                type="button"
                onClick={onClose}
                className="ml-4 p-1.5 rounded-lg text-medium-gray hover:bg-light-gray hover:text-charcoal transition-colors duration-250"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-5  flex items-center justify-end gap-2 border-t border-light-gray pt-4">
            {footer}
          </div>
        )}
      </div>
    </ModalOverlay>,
    document.body
  )
}

interface ModalOverlayProps {
  children: React.ReactNode
  onClick?: () => void
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ children, onClick }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-[2px] animate-fade-in"
    onClick={onClick}
  >
    {children}
  </div>
)
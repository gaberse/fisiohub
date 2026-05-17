import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  size?: ModalSize
  children: ReactNode
  footer?: ReactNode
  closeOnOverlay?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
  closeOnOverlay = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fh-modal-overlay"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        className={`fh-modal fh-modal-${size}`}
        onClick={e => e.stopPropagation()}
      >
        {(title || subtitle) && (
          <div className="fh-modal-header">
            <div>
              {title && (
                <h2 className="text-lg font-extrabold text-ink-900" style={{ letterSpacing: '-0.02em' }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm font-medium text-ink-400 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button className="fh-modal-close" onClick={onClose} aria-label="Cerrar">
              <X size={16} />
            </button>
          </div>
        )}

        {!(title || subtitle) && (
          <button
            className="fh-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
          >
            <X size={16} />
          </button>
        )}

        <div className="fh-modal-body">
          {children}
        </div>

        {footer && (
          <div className="fh-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

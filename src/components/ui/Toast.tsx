import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

type ToastVariant = 'success' | 'warning' | 'error' | 'info'

export interface ToastData {
  id: string
  variant: ToastVariant
  title: string
  message?: string
}

interface ToastItemProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

const variantConfig: Record<ToastVariant, {
  icon: ReactNode
  accent: string
  tint: string
}> = {
  success: {
    icon: <CheckCircle size={18} strokeWidth={2.5} />,
    accent: '#059669',
    tint: '#ecfdf5',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    accent: '#d97706',
    tint: '#fffbeb',
  },
  error: {
    icon: <XCircle size={18} strokeWidth={2.5} />,
    accent: '#dc2626',
    tint: '#fef2f2',
  },
  info: {
    icon: <Info size={18} />,
    accent: '#1e3a8a',
    tint: '#eff6ff',
  },
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const cfg = variantConfig[toast.variant]

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className="flex gap-3.5 p-4 bg-white rounded-xl"
      style={{
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 14px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)',
        alignItems: 'flex-start',
        minWidth: 300,
        maxWidth: 420,
      }}
      role="alert"
    >
      <div
        className="flex items-center justify-center flex-shrink-0 rounded-[10px]"
        style={{ width: 36, height: 36, background: cfg.tint, color: cfg.accent }}
      >
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold text-ink-900" style={{ letterSpacing: '-0.01em' }}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs font-medium text-ink-500 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-ink-400 hover:text-ink-700 transition-colors cursor-pointer p-1"
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  )
}

/* ── Toast container (place once in App root) ──────────── */

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

/* ── useToast hook ──────────────────────────────────────── */

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((variant: ToastVariant, title: string, message?: string) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, variant, title, message }])
  }, [])

  return { toasts, dismiss, toast }
}

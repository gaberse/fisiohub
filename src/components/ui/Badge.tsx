import type { ReactNode } from 'react'

type Variant = 'blue' | 'green' | 'amber' | 'red' | 'slate'

interface BadgeProps {
  variant?: Variant
  dot?: boolean
  children: ReactNode
  className?: string
}

const variantClass: Record<Variant, string> = {
  blue:  'fh-badge-blue',
  green: 'fh-badge-green',
  amber: 'fh-badge-amber',
  red:   'fh-badge-red',
  slate: 'fh-badge-slate',
}

const dotColor: Record<Variant, string> = {
  blue:  '#3b82f6',
  green: '#059669',
  amber: '#d97706',
  red:   '#dc2626',
  slate: '#94a3b8',
}

export function Badge({ variant = 'slate', dot = false, children, className = '' }: BadgeProps) {
  return (
    <span className={`fh-badge ${variantClass[variant]} ${className}`}>
      {dot && (
        <span className="fh-badge-dot" style={{ background: dotColor[variant] }} />
      )}
      {children}
    </span>
  )
}

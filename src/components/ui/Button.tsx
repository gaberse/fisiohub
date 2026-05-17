import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  iconOnly?: boolean
  children?: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary:   'fh-btn-primary',
  secondary: 'fh-btn-secondary',
  ghost:     'fh-btn-ghost',
  soft:      'fh-btn-soft',
  danger:    'fh-btn-danger',
}

const sizeClass: Record<Size, string> = {
  sm: 'fh-btn-sm',
  md: '',
  lg: 'fh-btn-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'fh-btn',
    variantClass[variant],
    sizeClass[size],
    iconOnly ? 'fh-btn-icon' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

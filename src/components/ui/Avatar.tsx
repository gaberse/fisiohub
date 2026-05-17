type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  initials: string
  size?: Size
  gradient?: boolean
  className?: string
}

const sizeMap: Record<Size, { dim: number; fontSize: number }> = {
  xs: { dim: 28, fontSize: 10 },
  sm: { dim: 36, fontSize: 12 },
  md: { dim: 44, fontSize: 14 },
  lg: { dim: 48, fontSize: 16 },
  xl: { dim: 56, fontSize: 18 },
}

export function Avatar({ initials, size = 'md', gradient = false, className = '' }: AvatarProps) {
  const { dim, fontSize } = sizeMap[size]
  return (
    <div
      className={`fh-avatar ${gradient ? 'fh-avatar-grad' : ''} ${className}`}
      style={{
        width: dim,
        height: dim,
        fontSize,
        ...(!gradient ? { background: '#0f172a' } : {}),
      }}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}

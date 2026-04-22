import React from 'react'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name?: string
  src?: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
  xl: 'w-14 h-14 text-base',
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  src,
  size = 'md',
  className = '',
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={[
          'rounded-full object-cover shrink-0',
          sizeClasses[size],
          className,
        ].join(' ')}
      />
    )
  }

  return (
    <div
      aria-label={name}
      className={[
        'rounded-full bg-forest flex items-center justify-center shrink-0',
        'font-display font-semibold text-off-white select-none',
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {getInitials(name)}
    </div>
  )
}
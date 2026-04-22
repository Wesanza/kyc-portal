import React from 'react'

// ─── Spinner ────────────────────────────────────────────────────────────────

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  /** Screen-reader label */
  label?: string
}

const spinnerSizes: Record<SpinnerSize, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 36,
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  label = 'Loading…',
}) => {
  const px = spinnerSizes[size]

  return (
    <span
      role="status"
      aria-label={label}
      className={['inline-flex items-center justify-center', className].join(' ')}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          className="opacity-20"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-forest"
        />
      </svg>
    </span>
  )
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string
  /** Rounded pill shape */
  rounded?: boolean
  /** Circle avatar shape */
  circle?: boolean
}

/**
 * Base skeleton element — shimmer animation on light-gray background.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  rounded = false,
  circle = false,
}) => (
  <div
    aria-hidden="true"
    className={[
      'bg-light-gray overflow-hidden relative',
      'before:absolute before:inset-0 before:bg-gradient-to-r',
      'before:from-transparent before:via-white/50 before:to-transparent',
      'before:animate-shimmer before:bg-[length:200%_100%]',
      circle ? 'rounded-full' : rounded ? 'rounded-full' : 'rounded-md',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  />
)

/**
 * Pre-composed skeleton for a text line.
 */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = '',
}) => (
  <div className={['flex flex-col gap-2', className].join(' ')}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={['h-3', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'].join(' ')}
      />
    ))}
  </div>
)

/**
 * Pre-composed skeleton for a card block.
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={[
      'bg-mint-surface border border-light-gray rounded-xl p-5 flex flex-col gap-3',
      className,
    ].join(' ')}
  >
    <div className="flex items-center gap-3">
      <Skeleton circle className="w-9 h-9 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
)

/** Convenience re-export */
export const SkeletonLoader = Skeleton
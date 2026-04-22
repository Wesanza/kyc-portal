import React from 'react'

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Mirrors Trato dashboard: forest header, clean white body, lime accents
// Fonts: Space Grotesk (display/headers), DM Sans (body)

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  as?: React.ElementType
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  /** Renders an action element to the far right */
  action?: React.ReactNode
  /** Badge/tag shown inline with the title (e.g. trend indicator) */
  badge?: React.ReactNode
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
  /** Remove default padding */
  flush?: boolean
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────
// Mirrors the ↓49.8% / ↑12% pill indicators on the dashboard stat cards
interface StatBadgeProps {
  value: string
  trend: 'up' | 'down' | 'neutral'
}

export const StatBadge: React.FC<StatBadgeProps> = ({ value, trend }) => {
  const colors = {
    up: 'bg-[#e8f5e2] text-[#2d7a1f]',
    down: 'bg-[#fde8e8] text-[#c0392b]',
    neutral: 'bg-[#f0f0f0] text-[#555]',
  }
  const arrow = { up: '↑', down: '↓', neutral: '–' }

  return (
    <span
      className={[
        'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide',
        colors[trend],
      ].join(' ')}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      <span>{arrow[trend]}</span>
      {value}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  as: Tag = 'div',
}) => {
  return (
    <Tag
      onClick={onClick}
      className={[
        // Structure
        'flex flex-col overflow-hidden',
        // Shape & shadow — matches dashboard card elevation
        'rounded-xl border border-[#e2e8e4]',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]',
        'bg-white',
        // Transition
        'transition-all duration-200 ease-out',
        hover || onClick
          ? 'hover:shadow-[0_4px_16px_rgba(26,61,46,0.12)] hover:-translate-y-0.5 cursor-pointer'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}

// ─── Card Header ──────────────────────────────────────────────────────────────
// Forest green background (#1a3d2e) with white label — exactly as in dashboard
export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  action,
  badge,
}) => {
  return (
    <div
      className={[
        'flex items-center justify-between px-4 py-3',
        'bg-[#1a3d2e]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Title */}
      <div
        className="flex items-center gap-2 flex-1 min-w-0"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#a8c4b0] truncate">
          {children}
        </span>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Action slot */}
      {action && (
        <div className="shrink-0 ml-3 text-[#7fd957]">{action}</div>
      )}
    </div>
  )
}

// ─── Card Body ────────────────────────────────────────────────────────────────
export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
  flush = false,
}) => {
  return (
    <div
      className={[
        'flex-1',
        flush ? '' : 'px-4 py-4',
        'text-[#1a1a1a]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {children}
    </div>
  )
}

// ─── Card Footer ──────────────────────────────────────────────────────────────
// Subtle off-white tint, top divider — matches dashboard's secondary row styling
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={[
        'px-4 py-2.5',
        'border-t border-[#e2e8e4] bg-[#f7f9f8]',
        'text-[12px] text-[#5a7264]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {children}
    </div>
  )
}


import React, { useRef, useState } from 'react'

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content: React.ReactNode
  placement?: TooltipPlacement
  children: React.ReactElement
  delay?: number
}

const placementClasses: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowClasses: Record<TooltipPlacement, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-charcoal border-l-transparent border-r-transparent border-b-transparent border-4',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-charcoal border-l-transparent border-r-transparent border-t-transparent border-4',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-charcoal border-t-transparent border-b-transparent border-r-transparent border-4',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-charcoal border-t-transparent border-b-transparent border-l-transparent border-4',
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  children,
  delay = 300,
}) => {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && (
        <span
          role="tooltip"
          className={[
            'absolute z-50 pointer-events-none',
            'px-2.5 py-1.5 rounded-md',
            'bg-charcoal text-off-white text-xs font-body',
            'whitespace-nowrap shadow-dropdown',
            'animate-fade-in',
            placementClasses[placement],
          ].join(' ')}
        >
          {content}
          {/* Arrow */}
          <span
            aria-hidden="true"
            className={['absolute w-0 h-0', arrowClasses[placement]].join(' ')}
          />
        </span>
      )}
    </span>
  )
}
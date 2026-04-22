import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  showPercent?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const sizeStyles = { sm: 'h-1', md: 'h-1.5', lg: 'h-2.5' };

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = false,
  className,
  size = 'md',
  animated = true,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs font-body font-medium text-charcoal">{label}</span>}
          {showPercent && (
            <span className="text-xs font-body font-semibold text-forest tabular-nums">{clamped}%</span>
          )}
        </div>
      )}
      <div
        className={cn('w-full bg-light-gray rounded-full overflow-hidden', sizeStyles[size])}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full bg-lime rounded-full',
            animated && 'transition-all duration-700 ease-out'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
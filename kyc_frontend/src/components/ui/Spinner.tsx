import React from 'react';
import { cn } from '../../utils/cn';

// ── Spinner ────────────────────────────────────────────────────────────────
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => (
  <div
    className={cn(
      'animate-spin rounded-full border-2 border-forest border-t-transparent',
      spinnerSizes[size],
      className
    )}
    role="status"
    aria-label="Loading"
  />
);

// ── SkeletonLoader ─────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={cn(
      'rounded-lg bg-gradient-to-r from-light-gray via-off-white to-light-gray bg-[length:200%_100%] animate-shimmer',
      className
    )}
  />
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-light-gray p-5 flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
    <Skeleton className="h-6 w-24 rounded-full" />
  </div>
);

export default Spinner;

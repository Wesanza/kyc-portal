import React from 'react';
import { cn } from '../../utils/cn';
import type { KycStatus } from '../../types/kyc';
import { STATUS_LABELS } from '../../utils/constants';

const statusStyles: Record<KycStatus, string> = {
  INCOMPLETE: 'bg-light-gray text-medium-gray border-gray-300',
  NOT_STARTED: 'bg-light-gray text-medium-gray border-gray-300',
  PENDING: 'bg-amber-50 text-warning border-amber-200',
  IN_REVIEW: 'bg-blue-50 text-info border-blue-200',
  APPROVED: 'bg-emerald-50 text-success border-emerald-200',
  REJECTED: 'bg-red-50 text-error border-red-200',
  REVISION_REQUESTED: 'bg-purple-50 text-purple-600 border-purple-200',
};

interface BadgeProps {
  status: KycStatus;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-semibold border',
      statusStyles[status],
      className
    )}
  >
    <span
      className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-medium-gray': status === 'NOT_STARTED' || status === 'INCOMPLETE',
        'bg-warning': status === 'PENDING',
        'bg-info': status === 'IN_REVIEW',
        'bg-success': status === 'APPROVED',
        'bg-error': status === 'REJECTED',
        'bg-purple-500': status === 'REVISION_REQUESTED',
      })}
    />
    {STATUS_LABELS[status]}
  </span>
);

export default StatusBadge;

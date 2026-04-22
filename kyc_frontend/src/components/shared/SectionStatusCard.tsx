import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import type { KycStatus } from '../../types/kyc';
import { cn } from '../../utils/cn';

interface SectionStatusCardProps {
  sectionKey: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: KycStatus;
  route: string;
  reviewerNotes?: string;
  index: number;
}

const STATUS_CONFIG: Record<KycStatus, { dot: string; badge: string; label: string }> = {
  NOT_STARTED: { dot: 'bg-light-gray', badge: 'bg-light-gray text-medium-gray', label: 'Not started' },
  PENDING: { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700', label: 'In progress' },
  IN_REVIEW: { dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-700', label: 'In review' },
  APPROVED: { dot: 'bg-success', badge: 'bg-emerald-50 text-success', label: 'Approved' },
  REJECTED: { dot: 'bg-error', badge: 'bg-red-50 text-error', label: 'Rejected' },
  REVISION_REQUESTED: { dot: 'bg-warning', badge: 'bg-amber-50 text-amber-700', label: 'Needs revision' },
  INCOMPLETE: {
    dot: '',
    badge: '',
    label: ''
  }
};

export const StatusBadge: React.FC<{ status: KycStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-[10px] font-body font-semibold uppercase tracking-wide px-2 py-1 rounded-full',
      cfg.badge
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
};

const SectionStatusCard: React.FC<SectionStatusCardProps> = ({
  label,
  description,
  icon: Icon,
  status,
  route,
  reviewerNotes,
  index,
}) => {
  const navigate = useNavigate();
  const isActionable = status !== 'APPROVED' && status !== 'IN_REVIEW';
  const hasIssue     = status === 'REJECTED' || status === 'REVISION_REQUESTED';
  const isApproved   = status === 'APPROVED';
  const isReview     = status === 'IN_REVIEW';

  const ctaLabel =
    status === 'NOT_STARTED'                                   ? 'Start'
    : status === 'REVISION_REQUESTED' || status === 'REJECTED' ? 'Revise'
    : status === 'PENDING'                                     ? 'Continue'
    : 'View';

  return (
    <div
      className={cn(
        'group relative bg-white rounded-xl border overflow-hidden transition-all duration-200',
        hasIssue
          ? status === 'REJECTED'
            ? 'border-l-[3px] border-l-error border-red-100'
            : 'border-l-[3px] border-l-warning border-amber-100'
          : isApproved
          ? 'border-emerald-200'
          : 'border-light-gray hover:border-forest/25 hover:shadow-sm',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {isApproved && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/40 to-transparent pointer-events-none" />
      )}

      <button
        type="button"
        onClick={() => navigate(route)}
        className="relative w-full text-left p-4 flex items-center gap-3.5"
      >
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
          isApproved  ? 'bg-emerald-100'
          : hasIssue  ? status === 'REJECTED' ? 'bg-red-100' : 'bg-amber-100'
          : 'bg-forest/8 group-hover:bg-forest/14'
        )}>
          {isApproved
            ? <CheckCircle2 className="w-5 h-5 text-success" />
            : <Icon className={cn('w-4.5 h-4.5',
                hasIssue ? status === 'REJECTED' ? 'text-error' : 'text-warning'
                : 'text-forest'
              )} />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-display font-semibold leading-tight',
            isApproved ? 'text-medium-gray' : 'text-charcoal'
          )}>
            {label}
          </p>
          <p className="text-xs font-body text-medium-gray truncate mt-0.5">{description}</p>
          {hasIssue && reviewerNotes && (
            <div className="mt-1.5 flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-warning" />
              <p className="text-xs font-body text-amber-700 line-clamp-1">{reviewerNotes}</p>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <StatusBadge status={status} />
          {isActionable && (
            <span className={cn(
              'flex items-center gap-1 text-[11px] font-body font-semibold px-2.5 py-1 rounded-lg',
              status === 'REJECTED'            ? 'bg-red-50 text-error'
              : status === 'REVISION_REQUESTED'  ? 'bg-amber-50 text-amber-700'
              : 'bg-forest text-off-white'
            )}>
              {ctaLabel} <ArrowRight className="w-3 h-3" />
            </span>
          )}
          {isReview && (
            <span className="flex items-center gap-1 text-[11px] font-body text-blue-500">
              <Clock className="w-3 h-3" /> Reviewing
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

export default SectionStatusCard;
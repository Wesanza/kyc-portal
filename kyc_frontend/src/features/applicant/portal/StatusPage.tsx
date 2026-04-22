import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, RefreshCw, MinusCircle, ArrowRight } from 'lucide-react';
import { useKycStatus } from '../../../hooks/useKycStatus';
import { KYC_SECTIONS } from '../../../utils/constants';
import StatusBadge from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Spinner';
import type { KycStatus } from '../../../types/kyc';
import { cn } from '../../../utils/cn';

const statusIcons: Record<KycStatus, React.ElementType> = {
    NOT_STARTED: MinusCircle,
    PENDING: Clock,
    IN_REVIEW: Clock,
    APPROVED: CheckCircle2,
    REJECTED: XCircle,
    REVISION_REQUESTED: RefreshCw,
    INCOMPLETE: 'symbol'
};

const StatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useKycStatus();

  const overall = data?.overall_status ?? 'INCOMPLETE';

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24 sm:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-forest">Status Overview</h1>
        <p className="text-sm font-body text-medium-gray mt-1">
          Track the review progress of each section
        </p>
      </div>

      {/* Overall status banner */}
      <div
        className={cn(
          'rounded-2xl p-5 mb-6 border',
          overall === 'APPROVED'
            ? 'bg-emerald-50 border-emerald-200'
            : overall === 'REJECTED'
            ? 'bg-red-50 border-red-200'
            : overall === 'REVISION_REQUESTED'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-light-gray'
        )}
      >
        <p className="text-xs font-body text-medium-gray uppercase tracking-wider mb-1">
          Overall Status
        </p>
        <p className="text-xl font-display font-bold text-forest">
          {overall === 'APPROVED'
            ? 'Fully Approved ✓'
            : overall === 'INCOMPLETE'
            ? 'Incomplete — Some sections missing'
            : overall === 'IN_REVIEW'
            ? 'Under Review'
            : overall === 'REVISION_REQUESTED'
            ? 'Revisions Needed'
            : overall === 'REJECTED'
            ? 'Rejected'
            : overall}
        </p>
        {data?.completion_percentage !== undefined && (
          <p className="text-sm font-body text-medium-gray mt-1">
            {data.completion_percentage}% complete
          </p>
        )}
      </div>

      {/* Section list */}
      <div className="flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))
          : KYC_SECTIONS.map((section) => {
              const sec = data?.sections.find((s) => s.section === section.key);
              const status: KycStatus = sec?.status ?? 'NOT_STARTED';
              const Icon = statusIcons[status];
              const isActionable =
                status === 'REVISION_REQUESTED' || status === 'REJECTED' || status === 'NOT_STARTED';

              return (
                <div
                  key={section.key}
                  className="bg-white rounded-xl border border-light-gray p-4 flex items-center gap-4"
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      status === 'APPROVED'
                        ? 'text-success'
                        : status === 'REJECTED'
                        ? 'text-error'
                        : status === 'REVISION_REQUESTED'
                        ? 'text-warning'
                        : 'text-medium-gray'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-charcoal">{section.label}</p>
                    {sec?.reviewer_notes && (
                      <p className="text-xs font-body text-medium-gray truncate mt-0.5">
                        {sec.reviewer_notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    {isActionable && (
                      <button
                        type="button"
                        onClick={() => navigate(section.route)}
                        className="p-1.5 rounded-lg hover:bg-mint-surface transition-colors"
                      >
                        <ArrowRight className="w-4 h-4 text-forest" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default StatusPage;

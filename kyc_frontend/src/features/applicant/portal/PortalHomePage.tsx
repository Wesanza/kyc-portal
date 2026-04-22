import React from 'react';
import { CheckCircle2,  ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKycStatus } from '../../../hooks/useKycStatus';
import { KYC_SECTIONS } from '../../../utils/constants';
import { SkeletonCard } from '../../../components/ui/Spinner';
import type { KycStatus } from '../../../types/kyc';
import { cn } from '../../../utils/cn';

// ─── Keyframes ────────────────────────────────────────────────────────────────
const AnimStyles = () => (
  <style>{`
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fillBar {
      from { width: 0%; }
    }
    .anim-slide-up { animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
    .fill-bar { animation: fillBar 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) both; }
    .card-stagger { animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  `}</style>
);

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<KycStatus, {
  dot: string;
  badge: string;
  label: string;
}> = {
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

const StatusBadge: React.FC<{ status: KycStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[10px] font-body font-semibold uppercase tracking-wide px-2 py-1 rounded-full', cfg.badge)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
};

// ─── Section row card ─────────────────────────────────────────────────────────
const SectionRow: React.FC<{
  sectionKey: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: KycStatus;
  route: string;
  reviewerNotes?: string;
  index: number;
  isNext: boolean;
}> = ({ label, description, icon: Icon, status, route, reviewerNotes, index, isNext }) => {
  const navigate = useNavigate();
  const isActionable = status !== 'APPROVED' && status !== 'IN_REVIEW';
  const hasIssue = status === 'REJECTED' || status === 'REVISION_REQUESTED';
  const isApproved = status === 'APPROVED';
  const isReview = status === 'IN_REVIEW';

  const ctaLabel =
    status === 'NOT_STARTED'        ? 'Start'
    : status === 'REVISION_REQUESTED' || status === 'REJECTED' ? 'Revise'
    : status === 'PENDING'           ? 'Continue'
    : 'View';

  return (
    <div
      className={cn(
        'group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden',
        hasIssue
          ? status === 'REJECTED'
            ? 'border-l-[3px] border-l-error border-t-red-100 border-r-red-100 border-b-red-100'
            : 'border-l-[3px] border-l-warning border-t-amber-100 border-r-amber-100 border-b-amber-100'
          : isApproved
          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/30 to-white'
          : isNext
          ? 'border-forest shadow-sm shadow-forest/10'
          : 'border-light-gray hover:border-forest/30',
        'card-stagger'
      )}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <button
        type="button"
        onClick={() => navigate(route)}
        className="w-full text-left p-4 flex items-center gap-4"
        aria-label={`${label} — ${STATUS_CONFIG[status].label}`}
      >
        {/* Step number + icon */}
        <div className="flex-shrink-0 relative">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              isApproved
                ? 'bg-emerald-100'
                : hasIssue
                ? status === 'REJECTED' ? 'bg-red-100' : 'bg-amber-100'
                : isNext
                ? 'bg-forest text-off-white'
                : 'bg-forest/8 group-hover:bg-forest/12'
            )}
          >
            {isApproved ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Icon
                className={cn(
                  'w-4.5 h-4.5',
                  isNext           ? 'text-off-white'
                  : hasIssue       ? status === 'REJECTED' ? 'text-error' : 'text-warning'
                  : 'text-forest'
                )}
              />
            )}
          </div>
          {/* Step index bubble */}
          <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-light-gray flex items-center justify-center">
            <span className="text-[8px] font-body font-bold text-medium-gray">{index + 1}</span>
          </span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={cn('text-sm font-display font-semibold', isApproved ? 'text-medium-gray line-through decoration-success/40' : 'text-charcoal')}>
              {label}
            </span>
            {isNext && (
              <span className="text-[9px] font-body font-bold uppercase tracking-widest text-lime bg-forest px-1.5 py-0.5 rounded-full">
                Up next
              </span>
            )}
          </div>
          <p className="text-xs font-body text-medium-gray truncate">{description}</p>

          {/* Reviewer notes inline */}
          {hasIssue && reviewerNotes && (
            <div className="mt-2 flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-warning" />
              <p className="text-xs font-body text-amber-700 line-clamp-1">{reviewerNotes}</p>
            </div>
          )}
        </div>

        {/* Right: badge + CTA */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <StatusBadge status={status} />
          {isActionable && (
            <span
              className={cn(
                'flex items-center gap-1 text-[11px] font-body font-semibold px-2.5 py-1 rounded-lg transition-all',
                status === 'REJECTED'           ? 'bg-red-100 text-red-700'
                : status === 'REVISION_REQUESTED' ? 'bg-amber-100 text-amber-700'
                : isNext                          ? 'bg-forest text-off-white'
                : 'bg-forest/8 text-forest group-hover:bg-forest/15'
              )}
            >
              {ctaLabel}
              <ArrowRight className="w-3 h-3" />
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

// ─── Main page ────────────────────────────────────────────────────────────────
const PortalHomePage: React.FC = () => {
  const { data, isLoading, isError } = useKycStatus();

  const getSectionStatus = (key: string): { status: KycStatus; notes?: string } => {
    const sec = data?.sections.find((s) => s.section === key);
    return { status: sec?.status ?? 'NOT_STARTED', notes: sec?.reviewer_notes };
  };

  const completionPercent = data?.completion_percentage ?? 0;
  const allApproved = data?.overall_status === 'APPROVED';
  const approvedCount = data?.sections.filter((s) => s.status === 'APPROVED').length ?? 0;
  const totalSections = KYC_SECTIONS.length;

  // Find the first actionable section (next up)
  const nextSectionKey = !isLoading && data
    ? KYC_SECTIONS.find((s) => {
        const { status } = getSectionStatus(s.key);
        return status === 'NOT_STARTED' || status === 'PENDING' || status === 'REVISION_REQUESTED' || status === 'REJECTED';
      })?.key
    : undefined;

  return (
    <>
      <AnimStyles />
      <div className="max-w-lg mx-auto w-full px-4 pt-5 pb-24 sm:pb-10 flex flex-col gap-4">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="anim-slide-up">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-charcoal">
            KYC Submission
          </h1>
          <p className="text-xs sm:text-sm font-body text-medium-gray mt-0.5">
            Complete all {totalSections} sections to finish your onboarding
          </p>
        </div>

        {/* ── Progress card ─────────────────────────────────────────────────── */}
        {!isLoading && (
          <div
            className="anim-slide-up bg-white rounded-2xl border border-light-gray shadow-card p-4 sm:p-5"
            style={{ animationDelay: '60ms' }}
          >
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs font-body text-medium-gray mb-0.5">Overall progress</p>
                <p className="text-2xl font-display font-bold text-charcoal leading-none">
                  {approvedCount}
                  <span className="text-base font-body font-normal text-medium-gray">
                    /{totalSections}
                  </span>
                </p>
              </div>
              <span className="text-3xl font-display font-bold text-forest tabular-nums">
                {completionPercent}%
              </span>
            </div>

            {/* Track */}
            <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden">
              <div
                className="fill-bar h-full bg-lime rounded-full"
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            {/* Section dots */}
            <div className="mt-3 flex gap-1.5">
              {KYC_SECTIONS.map((s) => {
                const { status } = getSectionStatus(s.key);
                const cfg = STATUS_CONFIG[status];
                return (
                  <div
                    key={s.key}
                    title={s.label}
                    className={cn('flex-1 h-1 rounded-full transition-colors', cfg.dot)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── All-approved banner ───────────────────────────────────────────── */}
        {allApproved && (
          <div
            className="anim-slide-up bg-forest rounded-2xl p-5 flex items-start gap-4"
            style={{ animationDelay: '100ms' }}
          >
            <div className="w-11 h-11 rounded-xl bg-lime flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-forest" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-off-white mb-0.5">
                KYC Complete! 🎉
              </h2>
              <p className="text-xs sm:text-sm font-body text-off-white/75">
                All sections reviewed and approved. HR will be in touch shortly.
              </p>
            </div>
          </div>
        )}

        {/* ── Section list ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-sm font-body text-error">
              Failed to load status. Please refresh the page.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {KYC_SECTIONS.map((section, i) => {
              const { status, notes } = getSectionStatus(section.key);
              return (
                <SectionRow
                  key={section.key}
                  sectionKey={section.key}
                  label={section.label}
                  description={section.description}
                  icon={section.icon}
                  status={status}
                  route={section.route}
                  reviewerNotes={notes}
                  index={i}
                  isNext={section.key === nextSectionKey}
                />
              );
            })}
          </div>
        )}

        {/* ── Bottom hint ───────────────────────────────────────────────────── */}
        {!isLoading && !allApproved && (
          <p className="text-center text-[11px] font-body text-medium-gray/70 pb-2">
            You can save progress and return at any time using your invite link
          </p>
        )}
      </div>
    </>
  );
};

export default PortalHomePage;
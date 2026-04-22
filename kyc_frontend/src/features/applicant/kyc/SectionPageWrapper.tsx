import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useKycStatus } from '../../../hooks/useKycStatus';
import type { KycSectionKey, KycStatus } from '../../../types/kyc';
import { KYC_SECTIONS } from '../../../utils/constants';
import { cn } from '../../../utils/cn';

interface SectionPageWrapperProps {
  sectionKey: KycSectionKey;
  children: React.ReactNode;
}

// ─── Keyframes ────────────────────────────────────────────────────────────────
const AnimStyles = () => (
  <style>{`
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .anim-content { animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
    .anim-header  { animation: slideDown 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  `}</style>
);

// ─── Status pill shown in the section header ──────────────────────────────────
const SectionStatusPill: React.FC<{ status: KycStatus }> = ({ status }) => {
  if (status === 'NOT_STARTED' || status === 'PENDING') return null;

  const cfg: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    APPROVED:           { icon: <CheckCircle2 className="w-3 h-3" />, className: 'bg-emerald-50 text-success border-emerald-200',    label: 'Approved'      },
    IN_REVIEW:          { icon: <Clock className="w-3 h-3" />,        className: 'bg-blue-50 text-blue-600 border-blue-200',          label: 'In review'     },
    REJECTED:           { icon: <AlertCircle className="w-3 h-3" />,  className: 'bg-red-50 text-error border-red-200',               label: 'Rejected'      },
    REVISION_REQUESTED: { icon: <AlertCircle className="w-3 h-3" />,  className: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'Needs revision'},
  };

  const c = cfg[status];
  if (!c) return null;

  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-body font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border', c.className)}>
      {c.icon}
      {c.label}
    </span>
  );
};

// ─── Reviewer notes banner ────────────────────────────────────────────────────
const ReviewerNotesBanner: React.FC<{ status: KycStatus; notes?: string }> = ({ status, notes }) => {
  if (!notes) return null;
  const isRejected = status === 'REJECTED';
  return (
    <div
      className={cn(
        'rounded-xl p-4 flex items-start gap-3 border',
        isRejected
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-amber-50 border-amber-200 text-amber-700'
      )}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-body font-semibold mb-0.5">
          {isRejected ? 'Section rejected' : 'Revision requested'}
        </p>
        <p className="text-xs font-body leading-relaxed">{notes}</p>
      </div>
    </div>
  );
};

// ─── Mini stepper dots ────────────────────────────────────────────────────────
const StepperDots: React.FC<{
  sections: typeof KYC_SECTIONS;
  currentIndex: number;
  getStatus: (key: string) => KycStatus;
}> = ({ sections, currentIndex, getStatus }) => (
  <div className="flex items-center gap-1">
    {sections.map((s, i) => {
      const status = getStatus(s.key);
      const isCurrent = i === currentIndex;
      const isApproved = status === 'APPROVED';
      return (
        <div
          key={s.key}
          className={cn(
            'rounded-full transition-all duration-200',
            isCurrent  ? 'w-5 h-1.5 bg-forest'
            : isApproved ? 'w-1.5 h-1.5 bg-success'
            : 'w-1.5 h-1.5 bg-light-gray'
          )}
        />
      );
    })}
  </div>
);

// ─── Main wrapper ─────────────────────────────────────────────────────────────
const SectionPageWrapper: React.FC<SectionPageWrapperProps> = ({ sectionKey, children }) => {
  const navigate = useNavigate();
  const { data } = useKycStatus();

  const sectionIndex = KYC_SECTIONS.findIndex((s) => s.key === sectionKey);
  const sectionMeta  = KYC_SECTIONS[sectionIndex];
  const sectionData  = data?.sections.find((s) => s.section === sectionKey);
  const status: KycStatus = sectionData?.status ?? 'NOT_STARTED';
  const notes = sectionData?.reviewer_notes;

  const prevSection = sectionIndex > 0 ? KYC_SECTIONS[sectionIndex - 1] : null;
  const nextSection = sectionIndex < KYC_SECTIONS.length - 1 ? KYC_SECTIONS[sectionIndex + 1] : null;

  const getStatus = (key: string): KycStatus =>
    data?.sections.find((s) => s.section === key)?.status ?? 'NOT_STARTED';

  return (
    <>
      <AnimStyles />

      {/* ── Sticky section header ─────────────────────────────────────────── */}
      {/* sits below the TopBar (h-14) so top-14 */}
      <div className="anim-header sticky   bg-white border-b border-light-gray shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">

          {/* Back to home */}
          <button
            type="button"
            onClick={() => navigate('/portal/home')}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-medium-gray hover:text-charcoal hover:bg-light-gray/60 transition-colors"
            aria-label="Back to overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Section title + status */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-sm font-display font-semibold text-charcoal truncate">
              {sectionMeta?.label}
            </span>
            <SectionStatusPill status={status} />
          </div>

          {/* Stepper dots */}
          <StepperDots
            sections={KYC_SECTIONS}
            currentIndex={sectionIndex}
            getStatus={getStatus}
          />

          {/* Step counter */}
          <span className="flex-shrink-0 text-[11px] font-body text-medium-gray tabular-nums">
            {sectionIndex + 1}/{KYC_SECTIONS.length}
          </span>
        </div>
      </div>

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto w-full px-4 py-5 pb-8 flex flex-col gap-4 anim-content">

        {/* Reviewer notes */}
        {(status === 'REVISION_REQUESTED' || status === 'REJECTED') && (
          <ReviewerNotesBanner status={status} notes={notes} />
        )}

        {/* Page content */}
        {children}

        {/* ── Prev / Next navigation ────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          {prevSection ? (
            <button
              type="button"
              onClick={() => navigate(prevSection.route)}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-light-gray text-xs font-body font-medium text-medium-gray hover:border-forest/30 hover:text-charcoal transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {prevSection.label}
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {nextSection ? (
            <button
              type="button"
              onClick={() => navigate(nextSection.route)}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-forest/6 border border-forest/15 text-xs font-body font-medium text-forest hover:bg-forest/10 transition-all"
            >
              {nextSection.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/portal/home')}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-forest text-xs font-body font-semibold text-off-white hover:bg-forest-mid transition-all"
            >
              Back to overview
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </>
  );
};

export default SectionPageWrapper;
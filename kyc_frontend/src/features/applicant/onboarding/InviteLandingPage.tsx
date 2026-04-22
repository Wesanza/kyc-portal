import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  CreditCard,
  MapPin,
  Users,
  Fingerprint,
  Briefcase,
} from 'lucide-react';
import { validateInvite } from '../../../api/auth';
import { useApplicantStore } from '../../../store/useApplicantStore';
import Button from '../../../components/ui/Button';
import type { ApplicantInviteValidateResponse } from '../../../types/auth';

type PageState = 'loading' | 'valid' | 'expired' | 'used' | 'error';

// ─── Document requirement steps shown in the valid state ────────────────────
const STEPS = [
  { icon: Briefcase,   label: 'Employment contract & payslips' },
  { icon: Fingerprint, label: 'KRA PIN & National ID' },
  { icon: MapPin,      label: 'Home & office address' },
  { icon: Users,       label: 'Next of kin & contacts' },
  { icon: CreditCard,  label: 'Banking details' },
  { icon: FileText,    label: 'Social & supplementary docs' },
];

// ─── Shared card wrapper ─────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`bg-white rounded-2xl border border-light-gray shadow-card overflow-hidden ${className}`}
    style={{ animation: 'slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both' }}
  >
    {children}
  </div>
);

// ─── Keyframe injection ──────────────────────────────────────────────────────
const AnimStyles = () => (
  <style>{`
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 0.6; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes stepIn {
      from { opacity: 0; transform: translateX(-8px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .step-item { animation: stepIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
  `}</style>
);

// ────────────────────────────────────────────────────────────────────────────
const InviteLandingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setApplicant = useApplicantStore((s) => s.setApplicant);

  const [pageState, setPageState] = useState<PageState>('loading');
  const [applicantData, setApplicantData] = useState<ApplicantInviteValidateResponse | null>(null);
  const [beginning, setBeginning] = useState(false);

  useEffect(() => {
    if (!token) { setPageState('error'); return; }

    validateInvite(token)
      .then((data) => {
        if (data.kyc_status === 'APPROVED') { setPageState('used'); return; }
        setApplicantData(data);
        setApplicant({
          applicantId: data.applicant_id,
          token: data.session_token,
          fullName: data.full_name,
          email: data.email,
        });
        setPageState('valid');
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 410) setPageState('expired');
        else if (status === 409) setPageState('used');
        else setPageState('error');
      });
  }, [token, setApplicant]);

  const handleBegin = () => {
    setBeginning(true);
    navigate('/portal/home');
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (pageState === 'loading') {
    return (
      <>
        <AnimStyles />
        <div className="flex flex-col items-center justify-center gap-5 py-20">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl bg-forest"
              style={{ animation: 'pulse-ring 1.4s ease-out infinite' }}
            />
            <div className="relative w-14 h-14 rounded-2xl bg-forest flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-lime animate-spin" />
            </div>
          </div>
          <p className="text-sm font-body text-medium-gray tracking-wide">
            Validating your invite…
          </p>
        </div>
      </>
    );
  }

  // ── Expired ────────────────────────────────────────────────────────────────
  if (pageState === 'expired') {
    return (
      <>
        <AnimStyles />
        <Card>
          {/* Thin accent bar */}
          <div className="h-1 w-full bg-error" />
          <div className="p-8 flex flex-col items-center gap-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="text-xs font-body font-semibold text-error uppercase tracking-widest mb-2">
                Link Expired
              </p>
              <h1 className="text-xl font-display font-bold text-charcoal mb-2">
                This invite is no longer active
              </h1>
              <p className="text-sm font-body text-medium-gray leading-relaxed max-w-xs mx-auto">
                Invite links expire for security reasons. Reach out to your HR contact and
                ask them to resend a fresh link.
              </p>
            </div>
            <div className="w-full rounded-xl bg-red-50 border border-red-100 p-4 text-left">
              <p className="text-xs font-body font-semibold text-red-700 mb-1">Next step</p>
              <p className="text-xs font-body text-red-500 leading-relaxed">
                Contact HR and request a new onboarding invite link — it only takes a moment
                on their end.
              </p>
            </div>
          </div>
        </Card>
      </>
    );
  }

  // ── Already completed ──────────────────────────────────────────────────────
  if (pageState === 'used') {
    return (
      <>
        <AnimStyles />
        <Card>
          <div className="h-1 w-full bg-success" />
          <div className="p-8 flex flex-col items-center gap-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs font-body font-semibold text-success uppercase tracking-widest mb-2">
                All Done
              </p>
              <h1 className="text-xl font-display font-bold text-charcoal mb-2">
                KYC already submitted
              </h1>
              <p className="text-sm font-body text-medium-gray leading-relaxed max-w-xs mx-auto">
                Your documents are with the team. HR will be in touch if anything further
                is needed — sit tight!
              </p>
            </div>
          </div>
        </Card>
      </>
    );
  }

  // ── Generic error ──────────────────────────────────────────────────────────
  if (pageState === 'error') {
    return (
      <>
        <AnimStyles />
        <Card>
          <div className="h-1 w-full bg-warning" />
          <div className="p-8 flex flex-col items-center gap-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-xs font-body font-semibold text-warning uppercase tracking-widest mb-2">
                Invalid Link
              </p>
              <h1 className="text-xl font-display font-bold text-charcoal mb-2">
                We couldn't validate this invite
              </h1>
              <p className="text-sm font-body text-medium-gray leading-relaxed max-w-xs mx-auto">
                The link may be malformed or already used. Check the email you received or
                ask HR for a new one.
              </p>
            </div>
          </div>
        </Card>
      </>
    );
  }

  // ── Valid — main welcome flow ──────────────────────────────────────────────
  const firstName = applicantData?.full_name?.split(' ')[0] ?? 'there';

  return (
    <>
      <AnimStyles />
      <div className="flex flex-col gap-3">

        {/* ── Hero card ──────────────────────────────────────────────────── */}
        <Card>
          {/* Forest header */}
          <div className="bg-forest px-6 pt-8 pb-10 relative overflow-hidden">
          

            <h1 className="text-2xl font-display font-bold text-off-white leading-tight mb-1">
              Welcome, {firstName} 👋
            </h1>
            <p className="text-off-white/60 text-sm font-body">{applicantData?.email}</p>

           
          </div>

          {/* Body */}
          <div className="px-6 pt-8 pb-6 flex flex-col gap-6">
            <div>
              <h2 className="text-base font-display font-semibold text-charcoal mb-1.5">
                Complete your KYC submission
              </h2>
              <p className="text-sm font-body text-medium-gray leading-relaxed">
                We need to verify your identity and employment details before you start.
                You can save and return at any time using this link.
              </p>
            </div>

            {/* Step list */}
            <div className="flex flex-col gap-1" role="list" aria-label="Required documents">
              {STEPS.map(({ icon: Icon, label }, i) => (
                <div
                  key={label}
                  role="listitem"
                  className="step-item flex items-center gap-3 py-2.5 border-b border-light-gray last:border-0"
                  style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                >
                  {/* Step number */}
                  <span className="w-5 h-5 rounded-full bg-mint-surface border border-forest-light/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-body font-bold text-forest">{i + 1}</span>
                  </span>
                  <Icon className="w-4 h-4 text-forest/60 flex-shrink-0" />
                  <span className="text-sm font-body text-charcoal">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              variant="primary"
              size="lg"
              loading={beginning}
              onClick={handleBegin}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              Begin KYC Submission
            </Button>
          </div>
        </Card>

        {/* ── Security footnote ──────────────────────────────────────────── */}
        {/* <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ animation: 'slideUp 0.5s 0.25s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-forest/50 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-body text-medium-gray leading-relaxed">
            All documents are end-to-end encrypted. Only authorised HR personnel can access
            your submission.
          </p>
        </div> */}

      </div>
    </>
  );
};

export default InviteLandingPage;
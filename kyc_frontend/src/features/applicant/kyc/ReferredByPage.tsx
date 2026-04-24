import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, User, Phone, Mail } from 'lucide-react';
import SectionPageWrapper from './SectionPageWrapper';
import { Input, Textarea } from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { submitReferredBy } from '../../../api/kyc';
import { useInvalidateKycStatus } from '../../../hooks/useKycStatus';
import { validateKenyanPhone } from '../../../utils/formatters';

interface Errors {
  referrer_name?: string;
  referrer_relationship?: string;
  referrer_phone?: string;
  referrer_email?: string;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'Current Employee',    label: 'Current Employee' },
  { value: 'Former Colleague',    label: 'Former Colleague' },
  { value: 'Manager / Supervisor', label: 'Manager / Supervisor' },
  { value: 'Friend',              label: 'Friend' },
  { value: 'Family Member',       label: 'Family Member' },
  { value: 'Recruitment Agency',  label: 'Recruitment Agency' },
  { value: 'Job Board / Online',  label: 'Job Board / Online' },
  { value: 'Other',               label: 'Other' },
];

const normalizePhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length >= 12) return `+${digits}`;
  if (digits.startsWith('07') || digits.startsWith('01')) return `+254${digits.slice(1)}`;
  if (digits.startsWith('7') || digits.startsWith('1')) return `+254${digits}`;
  return raw;
};

const validateEmail = (email: string): string | null => {
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
};

const ReferredByPage: React.FC = () => {
  const [referrerName, setReferrerName]                 = useState('');
  const [referrerRelationship, setReferrerRelationship] = useState('');
  const [customRelationship, setCustomRelationship]     = useState('');
  const [referrerPhone, setReferrerPhone]               = useState('');
  const [referrerEmail, setReferrerEmail]               = useState('');
  const [notes, setNotes]                               = useState('');
  const [errors, setErrors]                             = useState<Errors>({});
  const [success, setSuccess]                           = useState(false);
  const invalidate = useInvalidateKycStatus();

  const finalRelationship =
    referrerRelationship === 'Other' ? customRelationship : referrerRelationship;

  const validate = (): boolean => {
    const errs: Errors = {};

    if (!referrerName.trim()) errs.referrer_name = 'Referrer name is required';
    if (!finalRelationship.trim()) errs.referrer_relationship = 'Relationship is required';

    if (referrerPhone) {
      const norm = normalizePhone(referrerPhone);
      const phoneErr = validateKenyanPhone(norm);
      if (phoneErr) errs.referrer_phone = phoneErr;
    }

    const emailErr = validateEmail(referrerEmail);
    if (emailErr) errs.referrer_email = emailErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () =>
      submitReferredBy({
        referrer_name: referrerName.trim(),
        referrer_relationship: finalRelationship.trim(),
        ...(referrerPhone ? { referrer_phone: normalizePhone(referrerPhone) } : {}),
        ...(referrerEmail ? { referrer_email: referrerEmail.trim() } : {}),
        ...(notes ? { notes: notes.trim() } : {}),
      }),
    onSuccess: () => {
      setSuccess(true);
      invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  const canSubmit = referrerName && finalRelationship;

  return (
    <SectionPageWrapper sectionKey="referred_by">
      {success && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Referral details submitted successfully.
          </div>
        </Alert>
      )}

      {mutation.isError && (
        <Alert variant="error" onDismiss={() => mutation.reset()}>
          Submission failed. Please try again.
        </Alert>
      )}

      <div className="bg-white rounded-2xl border border-light-gray shadow-card p-5">
        <h2 className="text-base font-display font-semibold text-charcoal mb-1">
          Referred By
        </h2>
        <p className="text-sm font-body text-medium-gray mb-5">
          Let us know who referred you or how you heard about this opportunity.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Referrer name */}
          <Input
            label="Referrer's Full Name"
            required
            placeholder="e.g. John Kamau"
            value={referrerName}
            onChange={(e) => {
              setReferrerName(e.target.value);
              if (errors.referrer_name) setErrors((p) => ({ ...p, referrer_name: undefined }));
            }}
            error={errors.referrer_name}
            leftAddon={<User className="w-4 h-4" />}
            helper="Full name of the person or organisation that referred you"
          />

          {/* Relationship */}
          <Select
            label="Their Relationship to You"
            required
            placeholder="Select relationship..."
            options={RELATIONSHIP_OPTIONS}
            value={referrerRelationship}
            onChange={(e) => {
              setReferrerRelationship(e.target.value);
              if (errors.referrer_relationship)
                setErrors((p) => ({ ...p, referrer_relationship: undefined }));
            }}
            error={referrerRelationship !== 'Other' ? errors.referrer_relationship : undefined}
          />

          {referrerRelationship === 'Other' && (
            <Input
              label="Specify Relationship"
              required
              placeholder="e.g. Mentor, University contact"
              value={customRelationship}
              onChange={(e) => {
                setCustomRelationship(e.target.value);
                if (errors.referrer_relationship)
                  setErrors((p) => ({ ...p, referrer_relationship: undefined }));
              }}
              error={errors.referrer_relationship}
            />
          )}

          {/* Contact details (optional) */}
          <div className="border-t border-light-gray pt-5 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-display font-semibold text-charcoal">
                Referrer Contact <span className="text-medium-gray font-normal">(optional)</span>
              </h3>
              <p className="text-xs font-body text-medium-gray mt-0.5">
                Providing contact details helps us verify the referral if needed.
              </p>
            </div>

            <Input
              label="Phone Number"
              placeholder="0712 345 678"
              type="tel"
              inputMode="tel"
              value={referrerPhone}
              onChange={(e) => {
                setReferrerPhone(e.target.value);
                if (errors.referrer_phone) setErrors((p) => ({ ...p, referrer_phone: undefined }));
              }}
              onBlur={(e) => {
                if (e.target.value) setReferrerPhone(normalizePhone(e.target.value));
              }}
              error={errors.referrer_phone}
              helper="Kenyan number: +254XXXXXXXXX or 07XXXXXXXX"
              leftAddon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              placeholder="referrer@example.com"
              type="email"
              inputMode="email"
              value={referrerEmail}
              onChange={(e) => {
                setReferrerEmail(e.target.value);
                if (errors.referrer_email) setErrors((p) => ({ ...p, referrer_email: undefined }));
              }}
              error={errors.referrer_email}
              leftAddon={<Mail className="w-4 h-4" />}
            />
          </div>

          {/* Additional notes */}
          <Textarea
            label="Additional Notes"
            placeholder="e.g. Met at a career fair, saw a LinkedIn post, internal job board..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            helper="Optional — any extra context about how you found out about this role"
          />

          {/* Info nudge */}
          <div className="bg-mint-surface rounded-xl p-3 border border-forest-light/40">
            <p className="text-xs font-body text-forest font-medium">
              ℹ️ Only the referrer's name and relationship are required. Contact details and notes
              are optional but appreciated.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={mutation.isPending}
            disabled={!canSubmit}
            className="w-full"
          >
            Submit Referral Details
          </Button>
        </form>
      </div>
    </SectionPageWrapper>
  );
};

export default ReferredByPage;
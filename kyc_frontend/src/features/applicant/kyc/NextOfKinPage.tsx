import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Phone, User } from 'lucide-react';
import SectionPageWrapper from './SectionPageWrapper';
import { Input } from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { submitNextOfKin } from '../../../api/kyc';
import { useInvalidateKycStatus } from '../../../hooks/useKycStatus';
import { validateKenyanPhone } from '../../../utils/formatters';

interface Errors {
  full_name?: string;
  relationship?: string;
  phone_primary?: string;
  phone_secondary?: string;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Child', label: 'Child' },
  { value: 'Other', label: 'Other' },
];

const normalizePhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length >= 12) return `+${digits}`;
  if (digits.startsWith('07') || digits.startsWith('01')) return `+254${digits.slice(1)}`;
  if (digits.startsWith('7') || digits.startsWith('1')) return `+254${digits}`;
  return raw;
};

const NextOfKinPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [customRelationship, setCustomRelationship] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const invalidate = useInvalidateKycStatus();

  const finalRelationship =
    relationship === 'Other' ? customRelationship : relationship;

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!fullName.trim()) errs.full_name = 'Full name is required';
    if (!finalRelationship.trim()) errs.relationship = 'Relationship is required';

    const primaryNorm = normalizePhone(primaryPhone);
    const primaryErr = validateKenyanPhone(primaryNorm);
    if (primaryErr) errs.phone_primary = primaryErr;

    if (secondaryPhone) {
      const secNorm = normalizePhone(secondaryPhone);
      const secErr = validateKenyanPhone(secNorm);
      if (secErr) errs.phone_secondary = secErr;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () => {
      const data: {
        full_name: string;
        relationship: string;
        phone_primary: string;
        phone_secondary?: string;
      } = {
        full_name: fullName.trim(),
        relationship: finalRelationship.trim(),
        phone_primary: normalizePhone(primaryPhone),
      };
      if (secondaryPhone) data.phone_secondary = normalizePhone(secondaryPhone);
      return submitNextOfKin(data);
    },
    onSuccess: () => {
      setSuccess(true);
      invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  const canSubmit = fullName && finalRelationship && primaryPhone;

  return (
    <SectionPageWrapper sectionKey="next_of_kin">
      {success && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Next of kin details submitted successfully.
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
          Next of Kin
        </h2>
        <p className="text-sm font-body text-medium-gray mb-5">
          Provide emergency contact details for your next of kin.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Full Name"
            required
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.full_name) setErrors((p) => ({ ...p, full_name: undefined }));
            }}
            error={errors.full_name}
            leftAddon={<User className="w-4 h-4" />}
          />

          <Select
            label="Relationship"
            required
            placeholder="Select relationship..."
            options={RELATIONSHIP_OPTIONS}
            value={relationship}
            onChange={(e) => {
              setRelationship(e.target.value);
              if (errors.relationship) setErrors((p) => ({ ...p, relationship: undefined }));
            }}
            error={relationship !== 'Other' ? errors.relationship : undefined}
          />

          {relationship === 'Other' && (
            <Input
              label="Specify Relationship"
              required
              placeholder="e.g. Guardian, Aunt, Uncle"
              value={customRelationship}
              onChange={(e) => {
                setCustomRelationship(e.target.value);
                if (errors.relationship) setErrors((p) => ({ ...p, relationship: undefined }));
              }}
              error={errors.relationship}
            />
          )}

          <div className="border-t border-light-gray pt-5 flex flex-col gap-4">
            <h3 className="text-sm font-display font-semibold text-charcoal">Contact Numbers</h3>

            <Input
              label="Primary Phone"
              required
              placeholder="0712 345 678"
              type="tel"
              inputMode="tel"
              value={primaryPhone}
              onChange={(e) => {
                setPrimaryPhone(e.target.value);
                if (errors.phone_primary) setErrors((p) => ({ ...p, phone_primary: undefined }));
              }}
              onBlur={(e) => {
                const norm = normalizePhone(e.target.value);
                setPrimaryPhone(norm);
              }}
              error={errors.phone_primary}
              helper="Kenyan number: +254XXXXXXXXX or 07XXXXXXXX"
              leftAddon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Secondary Phone"
              placeholder="0712 345 678 (optional)"
              type="tel"
              inputMode="tel"
              value={secondaryPhone}
              onChange={(e) => {
                setSecondaryPhone(e.target.value);
                if (errors.phone_secondary) setErrors((p) => ({ ...p, phone_secondary: undefined }));
              }}
              onBlur={(e) => {
  if (e.target.value) setSecondaryPhone(normalizePhone(e.target.value));
}}
              error={errors.phone_secondary}
              helper="Optional"
              leftAddon={<Phone className="w-4 h-4" />}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={mutation.isPending}
            disabled={!canSubmit}
            className="w-full"
          >
            Submit Next of Kin
          </Button>
        </form>
      </div>
    </SectionPageWrapper>
  );
};

export default NextOfKinPage;

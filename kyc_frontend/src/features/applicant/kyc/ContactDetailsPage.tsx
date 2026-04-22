import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Phone } from 'lucide-react';
import SectionPageWrapper from './SectionPageWrapper';
import { Input } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { submitContactDetails } from '../../../api/kyc';
import { useInvalidateKycStatus } from '../../../hooks/useKycStatus';
import { validateKenyanPhone } from '../../../utils/formatters';

interface Errors {
  phone_primary?: string;
  phone_secondary?: string;
}

const normalizePhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length >= 12) return `+${digits}`;
  if (digits.startsWith('07') || digits.startsWith('01')) return `+254${digits.slice(1)}`;
  if (digits.startsWith('7') || digits.startsWith('1')) return `+254${digits}`;
  return raw;
};

const ContactDetailsPage: React.FC = () => {
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const invalidate = useInvalidateKycStatus();

  const handlePhoneChange = (
    val: string,
    setter: (v: string) => void,
    field: keyof Errors
  ) => {
    setter(val);
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handlePhoneBlur = (
    val: string,
    setter: (v: string) => void,
    field: keyof Errors,
    required: boolean
  ) => {
    if (!val && !required) return;
    const normalized = normalizePhone(val);
    setter(normalized);
    const err = required ? validateKenyanPhone(normalized) : val ? validateKenyanPhone(normalized) : null;
    if (err) setErrors((p) => ({ ...p, [field]: err }));
  };

  const validate = (): boolean => {
    const errs: Errors = {};
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
      const data: { phone_primary: string; phone_secondary?: string } = {
        phone_primary: normalizePhone(primaryPhone),
      };
      if (secondaryPhone) data.phone_secondary = normalizePhone(secondaryPhone);
      return submitContactDetails(data);
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

  return (
    <SectionPageWrapper sectionKey="contact_details">
      {success && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Contact details submitted successfully.
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
          Contact Details
        </h2>
        <p className="text-sm font-body text-medium-gray mb-5">
          Provide your Kenyan phone number(s). Numbers will be formatted automatically.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Primary Phone Number"
            required
            placeholder="0712 345 678"
            type="tel"
            inputMode="tel"
            value={primaryPhone}
            onChange={(e) => handlePhoneChange(e.target.value, setPrimaryPhone, 'phone_primary')}
            onBlur={(e) => handlePhoneBlur(e.target.value, setPrimaryPhone, 'phone_primary', true)}
            error={errors.phone_primary}
            helper="Kenyan number: +254XXXXXXXXX or 07XXXXXXXX"
            leftAddon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Secondary Phone Number"
            placeholder="0712 345 678 (optional)"
            type="tel"
            inputMode="tel"
            value={secondaryPhone}
            onChange={(e) =>
              handlePhoneChange(e.target.value, setSecondaryPhone, 'phone_secondary')
            }
            onBlur={(e) =>
              handlePhoneBlur(e.target.value, setSecondaryPhone, 'phone_secondary', false)
            }
            error={errors.phone_secondary}
            helper="Optional secondary contact number"
            leftAddon={<Phone className="w-4 h-4" />}
          />

          <div className="bg-mint-surface rounded-xl p-3 border border-forest-light/40">
            <p className="text-xs font-body text-forest">
              <span className="font-semibold">Auto-format:</span> Numbers like{' '}
              <span className="font-mono">0712345678</span> will be formatted to{' '}
              <span className="font-mono">+254712345678</span>
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={mutation.isPending}
            disabled={!primaryPhone}
            className="w-full"
          >
            Submit Contact Details
          </Button>
        </form>
      </div>
    </SectionPageWrapper>
  );
};

export default ContactDetailsPage;

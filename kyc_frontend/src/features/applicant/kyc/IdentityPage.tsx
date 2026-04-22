import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import SectionPageWrapper from './SectionPageWrapper';
import FileUpload from '../../../components/ui/FileUpload';
import { Input } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { submitIdentity } from '../../../api/kyc';
import { useInvalidateKycStatus } from '../../../hooks/useKycStatus';
import { validateKraPin } from '../../../utils/formatters';

interface FormState {
  kra_pin_file: File | null;
  national_id_file: File | null;
  kra_pin_number: string;
  id_number: string;
}

interface Errors {
  kra_pin_number?: string;
  id_number?: string;
}

const IdentityPage: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    kra_pin_file: null,
    national_id_file: null,
    kra_pin_number: '',
    id_number: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const invalidate = useInvalidateKycStatus();

  const set = (key: keyof FormState, value: string | File | null) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const errs: Errors = {};
    const kraErr = validateKraPin(form.kra_pin_number);
    if (kraErr) errs.kra_pin_number = kraErr;
    if (!form.id_number || !/^\d{7,8}$/.test(form.id_number)) {
      errs.id_number = 'ID number must be 7–8 digits';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () => {
      if (!form.kra_pin_file || !form.national_id_file) throw new Error('Files missing');
      return submitIdentity({
        kra_pin_file: form.kra_pin_file,
        national_id_file: form.national_id_file,
        kra_pin_number: form.kra_pin_number.toUpperCase(),
        id_number: form.id_number,
      });
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

  const canSubmit =
    form.kra_pin_file && form.national_id_file && form.kra_pin_number && form.id_number;

  return (
    <SectionPageWrapper sectionKey="identity">
      {success && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Identity documents submitted successfully.
          </div>
        </Alert>
      )}

      {mutation.isError && (
        <Alert variant="error" onDismiss={() => mutation.reset()}>
          Submission failed. Please try again.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* KRA Section */}
        <div className="bg-white rounded-2xl border border-light-gray shadow-card p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-base font-display font-semibold text-charcoal">
              KRA PIN Certificate
            </h2>
            <p className="text-xs font-body text-medium-gray mt-0.5">
              Upload a clear scan or photo of your KRA PIN certificate
            </p>
          </div>

          <FileUpload
            label="KRA PIN Certificate"
            required
            value={form.kra_pin_file}
            onChange={(f) => set('kra_pin_file', f)}
          />

          <Input
            label="KRA PIN Number"
            required
            placeholder="A000000000A"
            value={form.kra_pin_number}
            onChange={(e) => {
              set('kra_pin_number', e.target.value.toUpperCase());
              if (errors.kra_pin_number) setErrors((p) => ({ ...p, kra_pin_number: undefined }));
            }}
            error={errors.kra_pin_number}
            helper="Format: A000000000A (letter, 9 digits, letter)"
            className="font-mono uppercase"
            maxLength={11}
          />
        </div>

        {/* National ID Section */}
        <div className="bg-white rounded-2xl border border-light-gray shadow-card p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-base font-display font-semibold text-charcoal">
              National ID
            </h2>
            <p className="text-xs font-body text-medium-gray mt-0.5">
              Upload a clear scan or photo of both sides of your national ID
            </p>
          </div>

          <FileUpload
            label="National ID (front & back)"
            required
            value={form.national_id_file}
            onChange={(f) => set('national_id_file', f)}
            helper="Upload a combined PDF or a single image showing both sides"
          />

          <Input
            label="ID Number"
            required
            placeholder="12345678"
            value={form.id_number}
            onChange={(e) => {
              set('id_number', e.target.value.replace(/\D/g, ''));
              if (errors.id_number) setErrors((p) => ({ ...p, id_number: undefined }));
            }}
            error={errors.id_number}
            helper="7 or 8 digit national ID number"
            inputMode="numeric"
            maxLength={8}
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
          Submit Identity Documents
        </Button>
      </form>
    </SectionPageWrapper>
  );
};

export default IdentityPage;

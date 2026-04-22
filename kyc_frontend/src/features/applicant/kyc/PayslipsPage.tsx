import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Info } from 'lucide-react';
import SectionPageWrapper from './SectionPageWrapper';
import FileUpload from '../../../components/ui/FileUpload';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { submitPayslips } from '../../../api/kyc';
import { useInvalidateKycStatus } from '../../../hooks/useKycStatus';
import { cn } from '../../../utils/cn';

interface PayslipSlot {
  file: File | null;
  month_label: string;
  is_certified: boolean;
}

const EMPTY_SLOT: PayslipSlot = { file: null, month_label: '', is_certified: false };

const MONTH_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  const label = d.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
  return { value: label, label };
});

const SLOT_LABELS = ['Most Recent Payslip', 'Previous Month', 'Two Months Ago'];

const PayslipsPage: React.FC = () => {
  const [slots, setSlots] = useState<PayslipSlot[]>([
    { ...EMPTY_SLOT },
    { ...EMPTY_SLOT },
    { ...EMPTY_SLOT },
  ]);
  const [success, setSuccess] = useState(false);
  const invalidate = useInvalidateKycStatus();

  const updateSlot = (index: number, update: Partial<PayslipSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...update } : s)));
  };

  const isSlotComplete = (slot: PayslipSlot) =>
    slot.file !== null && slot.month_label !== '' && slot.is_certified;

  const completedCount = slots.filter(isSlotComplete).length;
  const canSubmit = completedCount === 3;

  const mutation = useMutation({
    mutationFn: () => {
      const payslips = slots.map((s) => ({
        file: s.file!,
        month_label: s.month_label,
        is_certified: s.is_certified,
      }));
      return submitPayslips(payslips);
    },
    onSuccess: () => {
      setSuccess(true);
      invalidate();
    },
  });

  return (
    <SectionPageWrapper sectionKey="payslips">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
        <p className="text-xs font-body text-blue-700">
          All 3 payslips must be uploaded, assigned a month, and marked as certified copies before
          submission.
        </p>
      </div>

      {success && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            All 3 payslips submitted successfully.
          </div>
        </Alert>
      )}

      {mutation.isError && (
        <Alert variant="error" onDismiss={() => mutation.reset()}>
          Submission failed. Please try again.
        </Alert>
      )}

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-body font-medium text-charcoal">Upload Progress</span>
          <span className="text-sm font-display font-semibold text-forest">{completedCount}/3</span>
        </div>
        <div className="flex gap-2">
          {slots.map((slot, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-2 rounded-full transition-colors duration-300',
                isSlotComplete(slot) ? 'bg-lime' : 'bg-light-gray'
              )}
            />
          ))}
        </div>
      </div>

      {/* Slots */}
      {slots.map((slot, index) => (
        <div
          key={index}
          className={cn(
            'bg-white rounded-2xl border shadow-card p-5 flex flex-col gap-4 transition-all duration-250',
            isSlotComplete(slot)
              ? 'border-success ring-1 ring-success/20'
              : 'border-light-gray'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-display font-semibold text-charcoal">
                Payslip {index + 1}
              </h3>
              <p className="text-xs font-body text-medium-gray">{SLOT_LABELS[index]}</p>
            </div>
            {isSlotComplete(slot) && (
              <div className="flex items-center gap-1.5 text-xs font-body font-semibold text-success">
                <CheckCircle2 className="w-4 h-4" />
                Complete
              </div>
            )}
          </div>

          <FileUpload
            value={slot.file}
            onChange={(f) => updateSlot(index, { file: f })}
            accept=".pdf,.jpg,.jpeg,.png"
          />

          <Select
            label="Month"
            required
            placeholder="Select month..."
            options={MONTH_OPTIONS}
            value={slot.month_label}
            onChange={(e) => updateSlot(index, { month_label: e.target.value })}
          />

          {/* Certified checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={slot.is_certified}
                onChange={(e) => updateSlot(index, { is_certified: e.target.checked })}
              />
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  slot.is_certified
                    ? 'bg-forest border-forest'
                    : 'bg-white border-light-gray group-hover:border-forest-light'
                )}
              >
                {slot.is_certified && (
                  <svg className="w-3 h-3 text-lime" fill="none" viewBox="0 0 12 12">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-body font-medium text-charcoal">
                This is a certified copy
              </p>
              <p className="text-xs font-body text-medium-gray mt-0.5">
                Confirm this payslip is a certified/official copy
              </p>
            </div>
          </label>
        </div>
      ))}

      <Button
        variant="primary"
        size="lg"
        loading={mutation.isPending}
        disabled={!canSubmit}
        onClick={() => mutation.mutate()}
        className="w-full"
      >
        Submit All Payslips
      </Button>
      {!canSubmit && (
        <p className="text-xs font-body text-medium-gray text-center">
          All 3 payslips must be uploaded, assigned a month, and certified
        </p>
      )}
    </SectionPageWrapper>
  );
};

export default PayslipsPage;

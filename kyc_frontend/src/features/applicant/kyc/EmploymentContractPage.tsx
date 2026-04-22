import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import SectionPageWrapper from './SectionPageWrapper';
import FileUpload from '../../../components/ui/FileUpload';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { submitEmploymentContract } from '../../../api/kyc';
import { useInvalidateKycStatus } from '../../../hooks/useKycStatus';

const EmploymentContractPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const invalidate = useInvalidateKycStatus();

  const mutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file selected');
      return submitEmploymentContract(file);
    },
    onSuccess: () => {
      setSuccess(true);
      invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <SectionPageWrapper sectionKey="employment_contract">
      <div className="bg-white rounded-2xl border border-light-gray shadow-card p-6">
        <h2 className="text-lg font-display font-semibold text-charcoal mb-1">
          Upload Employment Contract
        </h2>
        <p className="text-sm font-body text-medium-gray mb-6">
          Upload your signed employment contract. PDF format is preferred. Max 10MB.
        </p>

        {success && (
          <Alert variant="success" className="mb-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Contract submitted successfully. Your reviewer will be notified.
            </div>
          </Alert>
        )}

        {mutation.isError && (
          <Alert variant="error" className="mb-5" onDismiss={() => mutation.reset()}>
            Submission failed. Please try again.
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FileUpload
            label="Employment Contract"
            required
            value={file}
            onChange={setFile}
            accept=".pdf,.jpg,.jpeg,.png"
            helper="PDF, JPG or PNG — max 10MB"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={mutation.isPending}
            disabled={!file}
            className="w-full"
          >
            Submit Contract
          </Button>
        </form>
      </div>
    </SectionPageWrapper>
  );
};

export default EmploymentContractPage;

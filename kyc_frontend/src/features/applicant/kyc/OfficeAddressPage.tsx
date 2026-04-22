import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, MapPin, ExternalLink, Copy } from 'lucide-react';
import SectionPageWrapper from './SectionPageWrapper';
import { Input, Textarea } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { submitOfficeAddress } from '../../../api/kyc';
import { useInvalidateKycStatus } from '../../../hooks/useKycStatus';
import { validateGoogleMapsUrl } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

interface Errors {
  address_text?: string;
  google_maps_pin_url?: string;
}

interface HomeData {
  address_text?: string;
  google_maps_pin_url?: string;
}

const OfficeAddressPage: React.FC = () => {
  const [addressText, setAddressText] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const [urlValid, setUrlValid] = useState(false);
  const [copiedFromHome, setCopiedFromHome] = useState(false);
  const invalidate = useInvalidateKycStatus();

  // In a real app, this would come from the applicant store / cache
  const homeData: HomeData = {};

  const handleMapsUrlChange = (val: string) => {
    setMapsUrl(val);
    const err = validateGoogleMapsUrl(val);
    setUrlValid(!err);
    if (errors.google_maps_pin_url) setErrors((p) => ({ ...p, google_maps_pin_url: undefined }));
  };

  const copyFromHome = () => {
    if (homeData.address_text) setAddressText(homeData.address_text);
    if (homeData.google_maps_pin_url) {
      handleMapsUrlChange(homeData.google_maps_pin_url);
    }
    setCopiedFromHome(true);
  };

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!addressText.trim()) errs.address_text = 'Address is required';
    const mapsErr = validateGoogleMapsUrl(mapsUrl);
    if (mapsErr) errs.google_maps_pin_url = mapsErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () =>
      submitOfficeAddress({ address_text: addressText.trim(), google_maps_pin_url: mapsUrl }),
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
    <SectionPageWrapper sectionKey="office_address">
      {success && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Office address submitted successfully.
          </div>
        </Alert>
      )}

      {mutation.isError && (
        <Alert variant="error" onDismiss={() => mutation.reset()}>
          Submission failed. Please try again.
        </Alert>
      )}

      <div className="bg-white rounded-2xl border border-light-gray shadow-card p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-display font-semibold text-charcoal mb-0.5">
              Office / Work Address
            </h2>
            <p className="text-sm font-body text-medium-gray">
              Enter your primary workplace address and pin.
            </p>
          </div>

          {/* Copy from home toggle */}
          <button
            type="button"
            onClick={copyFromHome}
            disabled={!homeData.address_text}
            className={cn(
              'flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-lg border transition-all',
              homeData.address_text
                ? 'border-forest text-forest hover:bg-mint-surface'
                : 'border-light-gray text-medium-gray cursor-not-allowed opacity-50'
            )}
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedFromHome ? 'Copied!' : 'Same as Home'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Textarea
            label="Full Office Address"
            required
            placeholder="e.g. 5th Floor, Westlands Commercial Centre, Westlands, Nairobi"
            value={addressText}
            onChange={(e) => {
              setAddressText(e.target.value);
              if (errors.address_text) setErrors((p) => ({ ...p, address_text: undefined }));
            }}
            error={errors.address_text}
            rows={3}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-body font-medium text-charcoal">
              Google Maps Pin URL <span className="text-error">*</span>
            </label>
            <Input
              placeholder="https://maps.app.goo.gl/..."
              value={mapsUrl}
              onChange={(e) => handleMapsUrlChange(e.target.value)}
              error={errors.google_maps_pin_url}
              leftAddon={<MapPin className="w-4 h-4" />}
              rightAddon={
                urlValid ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : undefined
              }
            />
            {urlValid && (
              <div className="flex items-center gap-2 text-xs font-body text-success animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pin URL received ✓
              </div>
            )}
            <p className="text-xs font-body text-medium-gray">
              Open Google Maps → navigate to your office → tap & hold → Share → Copy Link
            </p>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-body text-forest hover:text-forest-mid transition-colors w-fit"
            >
              Open Google Maps
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={mutation.isPending}
            disabled={!addressText || !mapsUrl}
            className="w-full"
          >
            Submit Office Address
          </Button>
        </form>
      </div>
    </SectionPageWrapper>
  );
};

export default OfficeAddressPage;

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, MapPin, ExternalLink } from 'lucide-react';
import SectionPageWrapper from './SectionPageWrapper';
import { Input, Textarea } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { submitHomeAddress } from '../../../api/kyc';
import { useInvalidateKycStatus } from '../../../hooks/useKycStatus';
import { validateGoogleMapsUrl } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

interface Errors {
  address_text?: string;
  google_maps_pin_url?: string;
}

const HomeAddressPage: React.FC = () => {
  const [addressText, setAddressText] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const [urlValid, setUrlValid] = useState(false);
  const invalidate = useInvalidateKycStatus();

  const handleMapsUrlChange = (val: string) => {
    setMapsUrl(val);
    const err = validateGoogleMapsUrl(val);
    setUrlValid(!err);
    if (errors.google_maps_pin_url) setErrors((p) => ({ ...p, google_maps_pin_url: undefined }));
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
      submitHomeAddress({ address_text: addressText.trim(), google_maps_pin_url: mapsUrl }),
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
    <SectionPageWrapper sectionKey="home_address">
      {success && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Home address submitted successfully.
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
          Residential Address
        </h2>
        <p className="text-sm font-body text-medium-gray mb-5">
          Enter your full residential address and share a Google Maps pin.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Textarea
            label="Full Home Address"
            required
            placeholder="e.g. 123 Kiambu Road, Ruaka, Kiambu County"
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
            <div className="relative">
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
            </div>
            {urlValid && (
              <div className="flex items-center gap-2 text-xs font-body text-success animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pin URL received ✓
              </div>
            )}
            <p className="text-xs font-body text-medium-gray">
              Open Google Maps → tap & hold your home location → tap the coordinates → Share → Copy
              Link
            </p>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-body text-forest hover:text-forest-mid transition-colors w-fit'
              )}
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
            Submit Home Address
          </Button>
        </form>
      </div>
    </SectionPageWrapper>
  );
};

export default HomeAddressPage;

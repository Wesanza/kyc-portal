import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Facebook, Instagram, AlertCircle } from 'lucide-react';
import SectionPageWrapper from './SectionPageWrapper';
import { Input } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { submitSocialMedia } from '../../../api/kyc';
import { useInvalidateKycStatus } from '../../../hooks/useKycStatus';

interface Errors {
  facebook_url?: string;
  instagram_url?: string;
  general?: string;
}

const validateFacebook = (url: string): string | null => {
  if (!url) return null;
  if (!/^https?:\/\/(www\.)?facebook\.com\/.+/.test(url)) {
    return 'Must be a valid Facebook profile URL (facebook.com/...)';
  }
  return null;
};

const validateInstagram = (url: string): string | null => {
  if (!url) return null;
  if (!/^https?:\/\/(www\.)?instagram\.com\/.+/.test(url)) {
    return 'Must be a valid Instagram profile URL (instagram.com/...)';
  }
  return null;
};

const SocialMediaPage: React.FC = () => {
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const invalidate = useInvalidateKycStatus();

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!facebookUrl && !instagramUrl) {
      errs.general = 'At least one social media profile is required';
    }
    const fbErr = validateFacebook(facebookUrl);
    if (fbErr) errs.facebook_url = fbErr;
    const igErr = validateInstagram(instagramUrl);
    if (igErr) errs.instagram_url = igErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () =>
      submitSocialMedia({
        ...(facebookUrl ? { facebook_url: facebookUrl } : {}),
        ...(instagramUrl ? { instagram_url: instagramUrl } : {}),
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

  return (
    <SectionPageWrapper sectionKey="social_media">
      {success && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Social media profiles submitted successfully.
          </div>
        </Alert>
      )}

      {mutation.isError && (
        <Alert variant="error" onDismiss={() => mutation.reset()}>
          Submission failed. Please try again.
        </Alert>
      )}

      {errors.general && (
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.general}
          </div>
        </Alert>
      )}

      <div className="bg-white rounded-2xl border border-light-gray shadow-card p-5">
        <h2 className="text-base font-display font-semibold text-charcoal mb-1">
          Social Media Profiles
        </h2>
        <p className="text-sm font-body text-medium-gray mb-5">
          Provide at least one social media profile link. Paste the full URL from your browser.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Facebook Profile URL"
            placeholder="https://www.facebook.com/yourname"
            value={facebookUrl}
            onChange={(e) => {
              setFacebookUrl(e.target.value);
              if (errors.facebook_url) setErrors((p) => ({ ...p, facebook_url: undefined, general: undefined }));
            }}
            error={errors.facebook_url}
            leftAddon={<Facebook className="w-4 h-4 text-blue-600" />}
            helper="Optional if Instagram is provided"
          />

          <Input
            label="Instagram Profile URL"
            placeholder="https://www.instagram.com/yourhandle"
            value={instagramUrl}
            onChange={(e) => {
              setInstagramUrl(e.target.value);
              if (errors.instagram_url) setErrors((p) => ({ ...p, instagram_url: undefined, general: undefined }));
            }}
            error={errors.instagram_url}
            leftAddon={<Instagram className="w-4 h-4 text-pink-600" />}
            helper="Optional if Facebook is provided"
          />

          <div className="bg-mint-surface rounded-xl p-3 border border-forest-light/40">
            <p className="text-xs font-body text-forest font-medium">
              ℹ️ At least one profile URL is required. Both are welcome.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={mutation.isPending}
            disabled={!facebookUrl && !instagramUrl}
            className="w-full"
          >
            Submit Social Media
          </Button>
        </form>
      </div>
    </SectionPageWrapper>
  );
};

export default SocialMediaPage;

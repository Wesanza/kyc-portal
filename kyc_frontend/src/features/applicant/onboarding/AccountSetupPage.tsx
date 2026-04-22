import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import Alert from '../../../components/ui/Alert';

const AccountSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    try {
      // POST to /api/applicant/setup-pin/ (future implementation)
      await new Promise((r) => setTimeout(r, 600));
      navigate('/portal/home');
    } catch {
      setError('Failed to set PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => navigate('/portal/home');

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <div className="bg-white rounded-2xl border border-light-gray shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-forest px-6 py-7 text-center">
          <div className="w-12 h-12 rounded-xl bg-lime flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-forest" />
          </div>
          <h1 className="text-xl font-display font-bold text-off-white">Set Up Your PIN</h1>
          <p className="text-off-white/70 text-sm font-body mt-1">
            Optional — you can skip this step
          </p>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <p className="text-sm font-body text-medium-gray leading-relaxed">
            Create a 4-digit PIN for quick access when returning to complete your KYC. This is
            optional — you can also re-use your invite link each time.
          </p>

          {error && (
            <Alert variant="error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Create PIN"
              required
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="\d*"
              maxLength={8}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="text-medium-gray hover:text-charcoal transition-colors"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Input
              label="Confirm PIN"
              required
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="\d*"
              maxLength={8}
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!pin || !confirmPin}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              Set PIN &amp; Continue
            </Button>
          </form>

          <button
            type="button"
            onClick={handleSkip}
            className="text-sm font-body text-medium-gray hover:text-forest transition-colors text-center w-full"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSetupPage;

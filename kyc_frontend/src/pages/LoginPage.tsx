import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import { login as loginApi } from '../api/auth';

import { useAdminAuth } from '../hooks/useAdminAuth';

const LoginPage: React.FC = () => {
  // const navigate = useNavigate();
  // const location = useLocation();
  // const setAuth = useAdminStore((s) => s.setAuth);
  const { login } = useAdminAuth(); 


  // const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin/dashboard';


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Email and password are required'); return; }

    setLoading(true);
    try {
      const data = await loginApi({ email, password });
      localStorage.setItem('admin_access_token', data.access);
      login({
        userId: data.user.id,
        role: data.user.role,
        accessToken: data.access,
        refreshToken: data.refresh,
        user: data.user,
      });
      // navigate is handled inside login(), remove the manual call
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status;
      setError(status === 401 ? 'Invalid email or password.' : 'Login failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mint-surface flex flex-col">
      {/* Dark forest header */}
      <div className="bg-forest-dark h-2 w-full" />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center shadow-lg mb-4">
              <ShieldCheck className="w-7 h-7 text-lime" />
            </div>
            <h1 className="text-2xl font-display font-bold text-forest">KYC Portal</h1>
            <p className="text-sm font-body text-medium-gray mt-1">Admin & HR Access</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-card p-7">
            <h2 className="text-lg font-display font-semibold text-charcoal mb-5">Sign In</h2>

            {error && (
              <Alert variant="error" className="mb-5" onDismiss={() => setError(null)}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email Address"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftAddon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftAddon={<Lock className="w-4 h-4" />}
                rightAddon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-medium-gray hover:text-charcoal transition-colors pointer-events-auto"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-1"
              >
                Sign In
              </Button>
            </form>
          </div>

          <p className="text-center text-xs font-body text-medium-gray mt-6">
            Applicant? Use your invite link sent by HR.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

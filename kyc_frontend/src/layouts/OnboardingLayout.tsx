import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const OnboardingLayout: React.FC = () => (
  <div className="min-h-screen bg-mint-surface flex flex-col">
    {/* Minimal header - brand only */}
    <header className="h-16 flex items-center px-6 border-b border-forest-light/20 bg-forest">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-forest" />
        </div>
        <span className="font-display font-bold text-off-white text-base">KYC Portal</span>
      </div>
    </header>

    {/* Centered card content */}
    <main className="flex-1 flex items-start justify-center px-4 pt-12 pb-16">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </main>

    {/* Footer */}
    <footer className="py-6 text-center">
      <p className="text-xs font-body text-medium-gray">
        Secure document submission portal &mdash; all data is encrypted in transit
      </p>
    </footer>
  </div>
);

export default OnboardingLayout;

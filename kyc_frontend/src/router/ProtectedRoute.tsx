import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '../components/ui';
import { useAdminStore } from '../hooks/useAdminAuth';
import { useApplicantStore } from '../store/useApplicantStore';

interface RouteProps {
  children: React.ReactNode;
}

const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-mint-surface flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm font-body text-medium-gray">Loading…</p>
    </div>
  </div>
);

export const AdminRoute: React.FC<RouteProps> = ({ children }) => {
  const { accessToken, _hasHydrated } = useAdminStore();
  const location = useLocation();

  if (!_hasHydrated) return <PageLoader />;

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const ApplicantRoute: React.FC<RouteProps> = ({ children }) => {
  const { token, _hasHydrated } = useApplicantStore();
  const location = useLocation();

  if (!_hasHydrated) return <PageLoader />;

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
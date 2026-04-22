import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// import { Spinner } from '../components/ui';
import { useAdminStore } from '../hooks/useAdminAuth';
import { useApplicantStore } from '../store/useApplicantStore';

interface RouteProps {
  children: React.ReactNode;
}

// const PageLoader: React.FC = () => (
//   <div className="min-h-screen bg-mint-surface flex items-center justify-center">
//     <div className="flex flex-col items-center gap-3">
//       <Spinner size="lg" />
//       <p className="text-sm font-body text-medium-gray">Loading…</p>
//     </div>
//   </div>
// );

// Read raw token from localStorage — bypasses Zustand rehydration timing
function getApplicantTokenFromStorage(): string | null {
  try {
    const raw = localStorage.getItem('applicant-session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

function getAdminTokenFromStorage(): string | null {
  try {
    const raw = localStorage.getItem('admin-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

export const AdminRoute: React.FC<RouteProps> = ({ children }) => {
  const accessTokenFromStore = useAdminStore((s) => s.accessToken);
  const location = useLocation();

  // Use store value if available, fall back to localStorage for first-render
  const accessToken = accessTokenFromStore ?? getAdminTokenFromStorage();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const ApplicantRoute: React.FC<RouteProps> = ({ children }) => {
  const tokenFromStore = useApplicantStore((s) => s.token);
  const location = useLocation();

  // Use store value if available, fall back to localStorage for first-render
  const token = tokenFromStore ?? getApplicantTokenFromStorage();

  if (!token) {
    return <Navigate to="/no-session" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
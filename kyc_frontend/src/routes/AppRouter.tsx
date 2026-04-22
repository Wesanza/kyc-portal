import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Spinner } from '../components/ui';
import ApplicantPortalLayout from '../layouts/ApplicantPortalLayout';
import OnboardingLayout from '../layouts/OnboardingLayout';
import { AdminRoute, ApplicantRoute } from './ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';

// ── Pages ──────────────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('../pages/LoginPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
import DashboardPage      from "@/features/admin/dashboard/DashboardPage";
import ApplicantListPage  from "@/features/admin/applicants/ApplicantListPage";
import ApplicantDetailPage from "@/features/admin/applicants/ApplicantDetailPage";
import SettingsPage       from "@/features/admin/settings/SettingsPage";


// ── Onboarding (FE-02) ─────────────────────────────────────────────────────
const InviteLandingPage = lazy(() =>
  import('../features/applicant/onboarding').then((m) => ({ default: m.InviteLandingPage }))
);
const AccountSetupPage = lazy(() =>
  import('../features/applicant/onboarding').then((m) => ({ default: m.AccountSetupPage }))
);

// ── Applicant portal pages (FE-03) ─────────────────────────────────────────
const PortalHomePage = lazy(() =>
  import('../features/applicant/portal').then((m) => ({ default: m.PortalHomePage }))
);
const StatusPage = lazy(() =>
  import('../features/applicant/portal').then((m) => ({ default: m.StatusPage }))
);
const NotificationsPage = lazy(() =>
  import('../features/applicant/portal').then((m) => ({ default: m.NotificationsPage }))
);

// ── KYC section pages (FE-03) ──────────────────────────────────────────────
const EmploymentContractPage = lazy(() =>
  import('../features/applicant/kyc').then((m) => ({ default: m.EmploymentContractPage }))
);
const PayslipsPage = lazy(() =>
  import('../features/applicant/kyc').then((m) => ({ default: m.PayslipsPage }))
);
const IdentityPage = lazy(() =>
  import('../features/applicant/kyc').then((m) => ({ default: m.IdentityPage }))
);
const HomeAddressPage = lazy(() =>
  import('../features/applicant/kyc').then((m) => ({ default: m.HomeAddressPage }))
);
const OfficeAddressPage = lazy(() =>
  import('../features/applicant/kyc').then((m) => ({ default: m.OfficeAddressPage }))
);
const SocialMediaPage = lazy(() =>
  import('../features/applicant/kyc').then((m) => ({ default: m.SocialMediaPage }))
);
const ContactDetailsPage = lazy(() =>
  import('../features/applicant/kyc').then((m) => ({ default: m.ContactDetailsPage }))
);
const NextOfKinPage = lazy(() =>
  import('../features/applicant/kyc').then((m) => ({ default: m.NextOfKinPage }))
);

// ── Loading fallback ────────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-mint-surface flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm font-body text-medium-gray">Loading…</p>
    </div>
  </div>
);

// ── Router definition ───────────────────────────────────────────────────────
const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  // Admin / HR login — FE-04-01
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Applicant onboarding (invite flow) — FE-02
  {
    path: '/onboard',
    element: <OnboardingLayout />,
    children: [
      // /onboard/:token — invite landing & validation
      {
        path: ':token',
        element: <InviteLandingPage />,
      },
      // /onboard/:token/setup — optional PIN setup after token validated
      {
        path: ':token/setup',
        element: (
          <ApplicantRoute>
            <AccountSetupPage />
          </ApplicantRoute>
        ),
      },
    ],
  },

  // Applicant portal — FE-03 (guarded)
  {
    path: '/portal',
    element: (
      <ApplicantRoute>
        <ApplicantPortalLayout />
      </ApplicantRoute>
    ),
    children: [
      // Default redirect to home
      { index: true, element: <Navigate to="/portal/home" replace /> },

      // FE-03-01: section overview grid
      { path: 'home', element: <PortalHomePage /> },

      // Status read-only view
      { path: 'status', element: <StatusPage /> },

      // FE-05-02: notification centre
      { path: 'notifications', element: <NotificationsPage /> },

      // FE-03-02 through FE-03-09: KYC section submission pages
      { path: 'kyc/employment-contract', element: <EmploymentContractPage /> },
      { path: 'kyc/payslips', element: <PayslipsPage /> },
      { path: 'kyc/identity', element: <IdentityPage /> },
      { path: 'kyc/home-address', element: <HomeAddressPage /> },
      { path: 'kyc/office-address', element: <OfficeAddressPage /> },
      { path: 'kyc/social-media', element: <SocialMediaPage /> },
      { path: 'kyc/contact-details', element: <ContactDetailsPage /> },
      { path: 'kyc/next-of-kin', element: <NextOfKinPage /> },
    ],
  },

  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true,              element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard",        element: <DashboardPage /> },
      { path: "applicants",       element: <ApplicantListPage /> },
      { path: "applicants/:id",   element: <ApplicantDetailPage /> },
      { path: "settings",         element: <SettingsPage /> },
    ],
  },
{
  path: '/no-session',
  element: (
    <div className="min-h-screen bg-mint-surface flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-light-gray shadow-card p-8 max-w-sm w-full text-center">
        <h1 className="text-xl font-display font-bold text-charcoal mb-2">Session Expired</h1>
        <p className="text-sm font-body text-medium-gray leading-relaxed">
          Please use the invite link sent to your email to access the portal.
        </p>
      </div>
    </div>
  ),
},
  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

// ── App router component ────────────────────────────────────────────────────
const AppRouter: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <RouterProvider router={router} />
  </Suspense>
);

export default AppRouter;

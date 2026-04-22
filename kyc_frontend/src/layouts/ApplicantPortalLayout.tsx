import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Bell, LogOut, ShieldCheck, BarChart2 } from 'lucide-react';
import { cn } from '../utils/cn';
// import { useKycStatus } from '../hooks/useKycStatus';
import { useNotifications } from '../hooks/useNotifications';

const ApplicantPortalLayout: React.FC = () => {
  const navigate = useNavigate();
  // const { data: kycData } = useKycStatus();
  const { data: notifData } = useNotifications();

  // const completionPercent = kycData?.completion_percentage ?? 0;

  const unreadCount = notifData?.unread_count ?? 0;

  const handleLogout = () => {
    localStorage.removeItem('applicant_token');
    localStorage.removeItem('applicant-session');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-mint-surface flex flex-col">
      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <header className="h-header bg-forest sticky top-0 z-20 flex items-center px-4 gap-3 shadow-md">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-forest" />
          </div>
          <span className="font-display font-bold text-off-white text-base hidden sm:block">
            KYC Portal
          </span>
        </div>

        {/* Live progress pill */}
        {/* <div className="flex items-center gap-2 bg-forest-mid rounded-full px-3 py-1.5 select-none">
          <div className="w-20 h-1.5 bg-forest-light rounded-full overflow-hidden">
            <div
              className="h-full bg-lime rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="text-xs font-body font-semibold text-lime tabular-nums">
            {completionPercent}%
          </span>
        </div> */}

        {/* Nav icons */}
        <nav className="flex items-center gap-1">
          <NavLink
            to="/portal/notifications"
            className={({ isActive }) =>
              cn(
                'relative p-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-forest-mid text-lime'
                  : 'text-off-white/70 hover:text-off-white hover:bg-forest-mid'
              )
            }
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-lime text-forest text-[10px] font-display font-bold rounded-full flex items-center justify-center px-1 tabular-nums">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg text-off-white/70 hover:text-off-white hover:bg-forest-mid transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </nav>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* ── Bottom nav (mobile only) ───────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-light-gray flex z-20">
        <NavLink
          to="/portal/home"
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-body font-medium transition-colors',
              isActive ? 'text-forest' : 'text-medium-gray'
            )
          }
        >
          <Home className="w-5 h-5" />
          Home
        </NavLink>
        <NavLink
          to="/portal/status"
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-body font-medium transition-colors',
              isActive ? 'text-forest' : 'text-medium-gray'
            )
          }
        >
          <BarChart2 className="w-5 h-5" />
          Status
        </NavLink>
        <NavLink
          to="/portal/notifications"
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-body font-medium transition-colors relative',
              isActive ? 'text-forest' : 'text-medium-gray'
            )
          }
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-lime text-forest text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          Alerts
        </NavLink>
      </nav>
    </div>
  );
};

export default ApplicantPortalLayout;

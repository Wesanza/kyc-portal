import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Settings, LogOut,
   ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import NotificationPopover from "@/components/shared/NotificationPopover";

const navItems = [
  { to: "/admin/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/applicants", icon: Users,            label: "Applicants" },
  { to: "/admin/settings",   icon: Settings,         label: "Settings" },
];

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      localStorage.setItem("sidebar-collapsed", String(!c));
      return !c;
    });

  return (
    <div className="flex h-screen bg-mint-surface overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`
          relative flex flex-col bg-forest-dark flex-shrink-0
          transition-all duration-250 ease-in-out
          ${collapsed ? "w-16" : "w-sidebar"}
        `}
      >
        {/* Brand */}
        <div className="h-header flex items-center px-4 border-b border-forest-light flex-shrink-0 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-forest-mid flex items-center justify-center flex-shrink-0">
            <span className="text-lime font-display font-bold text-sm">K</span>
          </div>
          <span
            className={`
              ml-3 font-display font-bold text-off-white text-base tracking-tight whitespace-nowrap
              transition-all duration-250
              ${collapsed ? "opacity-0 w-0 ml-0 overflow-hidden" : "opacity-100"}
            `}
          >
            KYC Portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `relative group flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-body
                 transition-all duration-250 overflow-hidden
                 ${isActive
                   ? "bg-forest text-lime font-semibold"
                   : "text-off-white/60 hover:bg-forest hover:text-off-white"
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active pill when collapsed */}
                  {collapsed && isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-lime" />
                  )}
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="flex-shrink-0"
                  />
                  <span
                    className={`
                      whitespace-nowrap transition-all duration-250
                      ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
                    `}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Sign out */}
        <div className="px-2 pb-4 border-t border-forest-light pt-3 space-y-1 overflow-hidden">
          {/* User info */}
          <div className="flex items-center gap-3 px-2.5 py-2">
            <div className="w-7 h-7 rounded-full bg-forest-mid flex items-center justify-center flex-shrink-0">
              <span className="text-lime font-display font-bold text-xs uppercase">
                {user?.full_name?.[0] ?? "A"}
              </span>
            </div>
            <div
              className={`
                transition-all duration-250 overflow-hidden
                ${collapsed ? "opacity-0 w-0" : "opacity-100"}
              `}
            >
              <p className="text-xs font-body font-semibold text-off-white leading-tight whitespace-nowrap">
                {user?.full_name ?? "Admin"}
              </p>
              <p className="text-[10px] font-body text-off-white/50 capitalize leading-tight whitespace-nowrap">
                {user?.role ?? "Administrator"}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={async () => { await logout(); navigate("/login"); }}
            title={collapsed ? "Sign Out" : undefined}
            className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-body
                       text-off-white/60 hover:bg-forest hover:text-off-white transition-colors duration-250"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span
              className={`
                whitespace-nowrap transition-all duration-250
                ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
              `}
            >
              Sign Out
            </span>
          </button>
        </div>

        {/* Collapse toggle — floats on the right edge */}
        <button
          onClick={toggleCollapsed}
          className="
            absolute -right-3 top-20
            w-6 h-6 rounded-full
            bg-forest-dark border border-forest-light
            flex items-center justify-center
            text-off-white/70 hover:text-lime hover:border-lime
            transition-all duration-250 z-10 shadow-card
          "
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight size={12} strokeWidth={2.5} />
            : <ChevronLeft  size={12} strokeWidth={2.5} />
          }
        </button>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-header bg-white border-b border-light-gray flex items-center px-6 justify-end flex-shrink-0 gap-2">
          {/* <button className="w-9 h-9 rounded-lg flex items-center justify-center text-medium-gray hover:bg-mint-surface hover:text-forest transition-colors duration-250">
            <Search size={16} />
          </button> */}
          <NotificationPopover />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
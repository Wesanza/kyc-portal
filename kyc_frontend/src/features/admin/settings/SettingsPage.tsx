import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Bell, Link2, Shield, Save, Check, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  updateProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
  getInviteSettings,
  updateInviteSettings,
  changePassword,
  type NotificationPreferences,
  type InviteSettings,
} from '@/api/settings';
import { AdminUser } from '@/types/auth';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'notifications' | 'invites' | 'security';

interface TabDef {
  id: Tab;
  label: string;
  icon: React.ElementType;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS: TabDef[] = [
  { id: 'profile',       label: 'Profile',       icon: User   },
  { id: 'notifications', label: 'Notifications', icon: Bell   },
  { id: 'invites',       label: 'Invite Config', icon: Link2  },
  { id: 'security',      label: 'Security',      icon: Shield },
];

// ── Shared primitives ─────────────────────────────────────────────────────────

interface SaveButtonProps {
  saved: boolean;
  loading: boolean;
}

function SaveButton({ saved, loading }: SaveButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 bg-lime text-forest font-display font-semibold px-4 py-2 rounded-lg
        hover:bg-lime-bright transition-colors duration-250 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : saved ? (
        <Check size={15} />
      ) : (
        <Save size={15} />
      )}
      {loading ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
    </button>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-display font-semibold text-charcoal">{title}</h2>
      <p className="text-sm font-body text-medium-gray mt-0.5">{description}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-body font-medium text-charcoal mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs font-body text-medium-gray mt-1">{hint}</p>}
    </div>
  );
}

function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 rounded-lg border border-light-gray bg-off-white text-sm font-body text-charcoal
        focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-all
        placeholder:text-medium-gray disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

function PasswordInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className="w-full px-3 py-2 pr-10 rounded-lg border border-light-gray bg-off-white text-sm font-body text-charcoal
          focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-all
          placeholder:text-medium-gray disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-medium-gray hover:text-charcoal transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm font-body text-charcoal group-hover:text-forest transition-colors">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-250
          focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 ${
            checked ? 'bg-forest' : 'bg-light-gray'
          }`}
      >
        <span
          className={`inline-block w-4 h-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-250 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm font-body text-error">
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

// ── Tab panels ────────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, setUser } = useAdminAuth();
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name ?? '');

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      setUser(data as unknown as AdminUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ full_name: fullName });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionHeader
        title="Your Profile"
        description="Update your display name. Email and role are managed by your system administrator."
      />

      {mutation.isError && (
        <ErrorBanner message="Failed to update profile. Please try again." />
      )}

      <div className="flex items-center gap-4 p-4 bg-mint-surface rounded-xl border border-light-gray">
        <div className="w-14 h-14 rounded-full bg-forest flex items-center justify-center text-off-white font-display font-bold text-xl flex-shrink-0">
          {fullName.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="text-sm font-display font-semibold text-charcoal">
            {fullName || '—'}
          </p>
          <p className="text-xs font-body text-medium-gray">{user?.email}</p>
          <span className="inline-block mt-1 text-xs font-mono font-medium text-forest bg-forest/10 px-2 py-0.5 rounded-md">
            {user?.role ?? '—'}
          </span>
        </div>
      </div>

      <Field label="Full Name">
        <InputField
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          required
        />
      </Field>

      <Field
        label="Email Address"
        hint="Contact your administrator to change your email."
      >
        <InputField value={user?.email ?? ''} disabled />
      </Field>

      <div className="pt-2 flex justify-end">
        <SaveButton saved={saved} loading={mutation.isPending} />
      </div>
    </form>
  );
}

function NotificationsTab() {
  const [saved, setSaved] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: getNotificationPreferences,
  });

  const [prefs, setPrefs] = useState<NotificationPreferences>({
    on_submission: true,
    on_kyc_complete: true,
    on_revision: false,
    digest_email: false,
  });

  // Sync remote data into local state once loaded
  const [synced, setSynced] = useState(false);
  if (data && !synced) {
    setPrefs(data);
    setSynced(true);
  }

  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const toggle = (key: keyof NotificationPreferences) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(prefs);
  };

  const rows: { key: keyof NotificationPreferences; label: string }[] = [
    { key: 'on_submission',  label: 'Applicant submits a KYC section'           },
    { key: 'on_kyc_complete',label: 'Applicant completes all KYC sections'      },
    { key: 'on_revision',   label: 'Applicant resubmits after revision request' },
    { key: 'digest_email',  label: 'Daily digest email (9 AM summary)'          },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionHeader
        title="Notification Preferences"
        description="Choose which events trigger email notifications to your inbox."
      />

      {isError && (
        <ErrorBanner message="Failed to load notification settings." />
      )}

      {mutation.isError && (
        <ErrorBanner message="Failed to save preferences. Please try again." />
      )}

      <div className="divide-y divide-light-gray border border-light-gray rounded-xl overflow-hidden">
        {rows.map(({ key, label }) => (
          <div
            key={key}
            className={`px-4 py-3 bg-white ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Toggle
              label={label}
              checked={prefs[key]}
              onChange={() => toggle(key)}
            />
          </div>
        ))}
      </div>

      <div className="pt-2 flex justify-end">
        <SaveButton saved={saved} loading={mutation.isPending} />
      </div>
    </form>
  );
}

function InvitesTab() {
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings', 'invites'],
    queryFn: getInviteSettings,
  });

  const [settings, setSettings] = useState<InviteSettings>({
    expiry_days: 30,
    require_pin: false,
    portal_base_url: window.location.origin,
  });

  const [synced, setSynced] = useState(false);
  if (data && !synced) {
    setSettings(data);
    setSynced(true);
  }

  const mutation = useMutation({
    mutationFn: updateInviteSettings,
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings', 'invites'], updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionHeader
        title="Invite Configuration"
        description="Control how invite links behave when sent to applicants."
      />

      {isError && (
        <ErrorBanner message="Failed to load invite settings." />
      )}

      {mutation.isError && (
        <ErrorBanner message="Failed to save settings. Please try again." />
      )}

      <fieldset disabled={isLoading} className="space-y-5 disabled:opacity-60">
        <Field
          label="Invite Link Expiry (days)"
          hint="Applicants who open the link after this period will see an expiry message and be asked to contact HR."
        >
          <InputField
            type="number"
            min={1}
            max={90}
            value={settings.expiry_days}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                expiry_days: parseInt(e.target.value, 10) || 1,
              }))
            }
          />
        </Field>

        <Field
          label="Portal Base URL"
          hint="Used when generating invite links. Should match your deployed frontend domain."
        >
          <InputField
            value={settings.portal_base_url}
            onChange={(e) =>
              setSettings((s) => ({ ...s, portal_base_url: e.target.value }))
            }
            placeholder="https://kyc.yourcompany.com"
          />
        </Field>

        <div className="border border-light-gray rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-white">
            <Toggle
              label="Require applicants to set a PIN on first access"
              checked={settings.require_pin}
              onChange={(v) => setSettings((s) => ({ ...s, require_pin: v }))}
            />
          </div>
        </div>
      </fieldset>

      <div className="p-3 bg-mint-surface border border-forest/20 rounded-lg">
        <p className="text-xs font-body text-forest">
          <strong className="font-medium">Preview:</strong>{' '}
          <span className="font-mono">
            {settings.portal_base_url}/onboard/{'<invite_token>'}
          </span>
        </p>
      </div>

      <div className="pt-2 flex justify-end">
        <SaveButton saved={saved} loading={mutation.isPending} />
      </div>
    </form>
  );
}

function SecurityTab() {
  const [saved, setSaved] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setSaved(true);
      setCurrent('');
      setNext('');
      setConfirm('');
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (next.length < 8) {
      setClientError('Password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      setClientError('Passwords do not match.');
      return;
    }

    mutation.mutate({ current_password: current, new_password: next });
  };

  const serverError =
    mutation.isError && mutation.error instanceof Error
      ? mutation.error.message
      : mutation.isError
      ? 'Failed to change password. Please check your current password and try again.'
      : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionHeader
        title="Change Password"
        description="Use a strong password that you don't use anywhere else."
      />

      {(clientError || serverError) && (
        <ErrorBanner message={clientError ?? serverError!} />
      )}

      <Field label="Current Password">
        <PasswordInput
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </Field>

      <Field label="New Password" hint="Minimum 8 characters.">
        <PasswordInput
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
      </Field>

      <Field label="Confirm New Password">
        <PasswordInput
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
      </Field>

      <div className="pt-2 flex justify-end">
        <SaveButton saved={saved} loading={mutation.isPending} />
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<Tab>('profile');

  const panels: Record<Tab, React.ReactNode> = {
    profile:       <ProfileTab />,
    notifications: <NotificationsTab />,
    invites:       <InvitesTab />,
    security:      <SecurityTab />,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-forest mb-6">
        Settings
      </h1>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="w-44 flex-shrink-0 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-body transition-colors duration-250 ${
                active === id
                  ? 'bg-forest text-off-white font-medium'
                  : 'text-medium-gray hover:bg-mint-surface hover:text-charcoal'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="flex-1 bg-white rounded-xl border border-light-gray shadow-card p-6">
          {panels[active]}
        </div>
      </div>
    </div>
  );
}
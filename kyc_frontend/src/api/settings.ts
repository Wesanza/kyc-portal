import apiClient from './client';

// ── Types ────────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  full_name: string;
}

export interface UpdateProfileResponse {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface NotificationPreferences {
  on_submission: boolean;
  on_kyc_complete: boolean;
  on_revision: boolean;
  digest_email: boolean;
}

export interface InviteSettings {
  expiry_days: number;
  require_pin: boolean;
  portal_base_url: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
  const { data } = await apiClient.patch<UpdateProfileResponse>(
    '/auth/me/',
    payload
  );
  return data;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } =
    await apiClient.get<NotificationPreferences>(
      '/auth/admin/settings/notifications/'
    );
  return data;
}

export async function updateNotificationPreferences(
  payload: NotificationPreferences
): Promise<NotificationPreferences> {
  const { data } = await apiClient.patch<NotificationPreferences>(
    '/auth/admin/settings/notifications/',
    payload
  );
  return data;
}

export async function getInviteSettings(): Promise<InviteSettings> {
  const { data } =
    await apiClient.get<InviteSettings>('/auth/admin/settings/invites/');
  return data;
}

export async function updateInviteSettings(
  payload: InviteSettings
): Promise<InviteSettings> {
  const { data } = await apiClient.patch<InviteSettings>(
    '/auth/admin/settings/invites/',
    payload
  );
  return data;
}

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<void> {
  await apiClient.post('/auth/change-password/', payload);
}
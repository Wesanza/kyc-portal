export type UserRole = 'ADMIN' | 'HR';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AdminUser;
}

export interface RefreshResponse {
  access: string;
}

export interface ApplicantInviteValidateResponse {
  applicant_id: string;
  full_name: string;
  email: string;
  token: string;
  session_token: string;
  invite_expires_at: string;
  kyc_status: string;
}

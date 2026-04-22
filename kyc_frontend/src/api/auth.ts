import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  ApplicantInviteValidateResponse,
} from '../types/auth';

export const login = (data: LoginRequest): Promise<LoginResponse> =>
  apiClient.post('/auth/login/', data).then((r) => r.data);

export const logout = (refresh: string): Promise<void> =>
  apiClient.post('/auth/logout/', { refresh }).then(() => undefined);

export const refreshToken = (refresh: string): Promise<RefreshResponse> =>
  apiClient.post('/auth/refresh/', { refresh }).then((r) => r.data);

export const validateInvite = (token: string): Promise<ApplicantInviteValidateResponse> =>
  apiClient.get(`/applicant/invite/${token}/validate/`).then((r) => r.data);

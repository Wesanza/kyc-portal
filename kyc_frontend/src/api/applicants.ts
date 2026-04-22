import apiClient from './client';
import type {
  Applicant,
  ApplicantListResponse,
  ApplicantKycSummary,
  CreateApplicantPayload,
} from '../types/applicant';

export const listApplicants = (params?: {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<ApplicantListResponse> =>
  apiClient.get('/admin/applicants/', { params }).then((r) => r.data);

export const getApplicant = (id: string): Promise<Applicant> =>
  apiClient.get(`/admin/applicants/${id}/`).then((r) => r.data);

export const createApplicant = (data: CreateApplicantPayload): Promise<Applicant> =>
  apiClient.post('/admin/applicants/', data).then((r) => r.data);

export const updateApplicant = (
  id: string,
  data: Partial<CreateApplicantPayload>
): Promise<Applicant> =>
  apiClient.patch(`/admin/applicants/${id}/`, data).then((r) => r.data);

export const deleteApplicant = (id: string): Promise<void> =>
  apiClient.delete(`/admin/applicants/${id}/`).then(() => undefined);

export const getKycSummary = (id: string): Promise<ApplicantKycSummary> =>
  apiClient.get(`/admin/applicants/${id}/kyc-summary/`).then((r) => r.data);

export const resendInvite = (id: string): Promise<void> =>
  apiClient.post(`/admin/applicants/${id}/resend-invite/`).then(() => undefined);

export const regenerateInvite = (id: string): Promise<{ invite_token: string }> =>
  apiClient.post(`/admin/applicants/${id}/regenerate-invite/`).then((r) => r.data);

export const getKycSections = (id: string): Promise<any> =>
  apiClient.get(`/admin/kyc/${id}/sections/`).then((r) => r.data);

export const reviewSection = (
  applicantId: string,
  section: string,
  data: { status: string; reviewer_notes: string }
): Promise<any> =>
  apiClient.patch(`/admin/kyc/${applicantId}/${section}/review/`, data).then((r) => r.data);

export const getReviewLog = (id: string): Promise<any> =>
  apiClient.get(`/admin/kyc/${id}/review-log/`).then((r) => r.data);

export const getApplicantSectionData = (applicantId: string): Promise<any> =>
  apiClient.get(`/admin/kyc/${applicantId}/sections/`).then((r) => r.data);
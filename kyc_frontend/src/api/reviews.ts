import apiClient from './client';
import type { ReviewActionPayload, ReviewLogListResponse } from '../types/review';
import type { KycSectionKey } from '../types/kyc';

const SECTION_TO_ENDPOINT: Record<KycSectionKey, string> = {
  employment_contract: 'employment-contract',
  payslips: 'payslips',
  identity: 'identity',
  home_address: 'home-address',
  office_address: 'office-address',
  social_media: 'social-media',
  contact_details: 'contact-details',
  next_of_kin: 'next-of-kin',
};

export const reviewSection = (
  applicantId: string,
  section: KycSectionKey,
  data: ReviewActionPayload
): Promise<void> => {
  const endpoint = SECTION_TO_ENDPOINT[section];
  return apiClient
    .patch(`/admin/kyc/${applicantId}/${endpoint}/review/`, data)
    .then(() => undefined);
};

export const getReviewLog = (applicantId: string): Promise<ReviewLogListResponse> =>
  apiClient.get(`/admin/applicants/${applicantId}/review-log/`).then((r) => r.data);

export const getAllSections = (applicantId: string) =>
  apiClient.get(`/admin/kyc/${applicantId}/sections/`).then((r) => r.data);

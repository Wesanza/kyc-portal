import type { KycStatus, KycSectionKey } from './kyc';
import type { AdminUser } from './auth';

export type ReviewAction = 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';

export interface ReviewActionPayload {
  status: ReviewAction;
  reviewer_notes?: string;
}

export interface ReviewLog {
  id: string;
  applicant: string;
  section_name: KycSectionKey;
  reviewer: AdminUser;
  old_status: KycStatus;
  new_status: KycStatus;
  notes?: string;
  created_at: string;
}

export interface ReviewLogListResponse {
  results: ReviewLog[];
  count: number;
}

import type { KycStatus } from './kyc';

export interface Applicant {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_by: string;
  invite_token: string;
  invite_used: boolean;
  invite_url: string; 
  invite_expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  kyc_status: 'INCOMPLETE' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  completion_percentage: number;
}

export interface ApplicantKycSummary {
  overall_status: Applicant['kyc_status'];
  completion_percentage: number;
  last_activity: string | null;
  sections: Array<{
    section: string;
    status: KycStatus;
    reviewer_notes?: string;
    updated_at?: string;
  }>;
}

export interface CreateApplicantPayload {
  full_name: string;
  email: string;
  phone?: string;
}

export interface ApplicantListResponse {
  results: Applicant[];
  count: number;
  next: string | null;
  previous: string | null;
}

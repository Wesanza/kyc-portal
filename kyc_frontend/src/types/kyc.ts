export type KycStatus =
  | 'INCOMPLETE'
  | 'NOT_STARTED'
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_REQUESTED';

export type KycSectionKey =
  | 'employment_contract'
  | 'payslips'
  | 'identity'
  | 'home_address'
  | 'office_address'
  | 'social_media'
  | 'contact_details'
  | 'next_of_kin'
  | 'referred_by';

export interface SectionStatus {
  section: KycSectionKey;
  status: KycStatus;
  reviewer_notes?: string;
  updated_at?: string;
}

export interface KycStatusResponse {
  sections: SectionStatus[];
  completion_percentage: number;
  overall_status: 'INCOMPLETE' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
}

export interface SectionSubmitResponse {
  section: KycSectionKey;
  status: KycStatus;
  data: Record<string, unknown>;
  message: string;
}

// Section-specific payloads
export interface EmploymentContractPayload {
  file: File;
}

export interface PayslipEntry {
  file: File;
  month_label: string;
  is_certified: boolean;
}

export interface PayslipsPayload {
  payslips: PayslipEntry[];
}

export interface IdentityPayload {
  kra_pin_file: File;
  national_id_file: File;
  kra_pin_number: string;
  id_number: string;
}

export interface AddressPayload {
  address_text: string;
  google_maps_pin_url: string;
}

export interface SocialMediaPayload {
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
}

export interface ContactDetailsPayload {
  phone_primary: string;
  phone_secondary?: string;
}

export interface NextOfKinPayload {
  full_name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary?: string;
}

export interface ReferredByPayload {
  referrer_name: string;
  referrer_relationship: string;
  referrer_phone?: string;
  referrer_email?: string;
  notes?: string;
}
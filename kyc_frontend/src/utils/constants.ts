import {
  FileText,
  Receipt,
  CreditCard,
  Home,
  Building2,
  Share2,
  Phone,
  Users,
} from 'lucide-react';
import type { KycSectionKey, KycStatus } from '../types/kyc';

export const KYC_SECTIONS: Array<{
  key: KycSectionKey;
  label: string;
  description: string;
  icon: typeof FileText;
  route: string;
  required_docs?: string;
}> = [
  {
    key: 'employment_contract',
    label: 'Employment Contract',
    description: 'Upload your signed employment contract',
    icon: FileText,
    route: '/portal/kyc/employment-contract',
    required_docs: 'PDF preferred',
  },
  {
    key: 'payslips',
    label: 'Payslips',
    description: '3 recent certified payslips with month labels',
    icon: Receipt,
    route: '/portal/kyc/payslips',
    required_docs: 'Each must be certified',
  },
  {
    key: 'identity',
    label: 'KRA PIN & National ID',
    description: 'KRA certificate, national ID, and reference numbers',
    icon: CreditCard,
    route: '/portal/kyc/identity',
    required_docs: 'KRA PIN and ID files required',
  },
  {
    key: 'home_address',
    label: 'Home Address',
    description: 'Your residential address with Google Maps pin',
    icon: Home,
    route: '/portal/kyc/home-address',
  },
  {
    key: 'office_address',
    label: 'Office Address',
    description: 'Your work address with Google Maps pin',
    icon: Building2,
    route: '/portal/kyc/office-address',
  },
  {
    key: 'social_media',
    label: 'Social Media',
    description: 'Facebook and Instagram profile links',
    icon: Share2,
    route: '/portal/kyc/social-media',
    required_docs: 'At least one required',
  },
  {
    key: 'contact_details',
    label: 'Contact Details',
    description: 'Primary and optional secondary phone numbers',
    icon: Phone,
    route: '/portal/kyc/contact-details',
  },
  {
    key: 'next_of_kin',
    label: 'Next of Kin',
    description: 'Emergency contact details and relationship',
    icon: Users,
    route: '/portal/kyc/next-of-kin',
  },
];

export const STATUS_LABELS: Record<KycStatus, string> = {
  NOT_STARTED: 'Not Started',
    INCOMPLETE: 'Incomplete',

  PENDING: 'Under Review',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVISION_REQUESTED: 'Revision Needed',
};

export const KENYAN_PHONE_REGEX = /^(\+254|0)[17]\d{8}$/;
export const KRA_PIN_REGEX = /^[A-Z]\d{9}[A-Z]$/;
export const GOOGLE_MAPS_REGEX =
  /^https?:\/\/(maps\.app\.goo\.gl|www\.google\.com\/maps|goo\.gl\/maps)\/.+/;

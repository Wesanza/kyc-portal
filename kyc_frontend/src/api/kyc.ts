import apiClient from './client';
import type {
  KycStatusResponse,
  SectionSubmitResponse,
  AddressPayload,
  SocialMediaPayload,
  ContactDetailsPayload,
  NextOfKinPayload,
} from '../types/kyc';

export const getSectionStatus = (): Promise<KycStatusResponse> =>
  apiClient.get('/applicant/kyc/status/').then((r) => r.data);

export const submitEmploymentContract = (file: File): Promise<SectionSubmitResponse> => {
  const fd = new FormData();
  fd.append('file', file);
  return apiClient
    .post('/applicant/kyc/employment-contract/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const submitPayslips = (
  payslips: Array<{ file: File; month_label: string; is_certified: boolean }>
): Promise<SectionSubmitResponse> => {
  const fd = new FormData();
  payslips.forEach((p, i) => {
    fd.append(`payslips[${i}][file]`, p.file);
    fd.append(`payslips[${i}][month_label]`, p.month_label);
    fd.append(`payslips[${i}][is_certified]`, String(p.is_certified));
  });
  return apiClient
    .post('/applicant/kyc/payslips/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const submitIdentity = (data: {
  kra_pin_file: File;
  national_id_file: File;
  kra_pin_number: string;
  id_number: string;
}): Promise<SectionSubmitResponse> => {
  const fd = new FormData();
  fd.append('kra_pin_file', data.kra_pin_file);
  fd.append('national_id_file', data.national_id_file);
  fd.append('kra_pin_number', data.kra_pin_number.toUpperCase());
  fd.append('id_number', data.id_number);
  return apiClient
    .post('/applicant/kyc/identity/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const submitHomeAddress = (data: AddressPayload): Promise<SectionSubmitResponse> =>
  apiClient.post('/applicant/kyc/home-address/', data).then((r) => r.data);

export const submitOfficeAddress = (data: AddressPayload): Promise<SectionSubmitResponse> =>
  apiClient.post('/applicant/kyc/office-address/', data).then((r) => r.data);

export const submitSocialMedia = (data: SocialMediaPayload): Promise<SectionSubmitResponse> =>
  apiClient.post('/applicant/kyc/social-media/', data).then((r) => r.data);

export const submitContactDetails = (
  data: ContactDetailsPayload
): Promise<SectionSubmitResponse> =>
  apiClient.post('/applicant/kyc/contact-details/', data).then((r) => r.data);

export const submitNextOfKin = (data: NextOfKinPayload): Promise<SectionSubmitResponse> =>
  apiClient.post('/applicant/kyc/next-of-kin/', data).then((r) => r.data);

import apiClient from './client';

export interface SecureFileResponse {
  url: string;
  expires_at: string;
  filename: string;
  content_type: string;
}

export const getSecureFileUrl = (fileToken: string): Promise<SecureFileResponse> =>
  apiClient.get(`/files/${fileToken}/`).then((r) => r.data);

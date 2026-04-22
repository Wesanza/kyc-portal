export type RecipientType = 'ADMIN' | 'APPLICANT';

export interface Notification {
  id: string;
  recipient_type: RecipientType;
  recipient_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  section?: string;
  action_url?: string;
}

export interface NotificationListResponse {
  results: Notification[];
  unread_count: number;
}

import apiClient from './client';
import type { NotificationListResponse } from '../types/notification';

export const listNotifications = (): Promise<NotificationListResponse> =>
  apiClient.get('/applicant/notifications/').then((r) => r.data);

export const markNotificationRead = (id: string): Promise<void> =>
  apiClient.patch(`/applicant/notifications/${id}/read/`).then(() => undefined);

export const markAllNotificationsRead = (): Promise<void> =>
  apiClient.post('/applicant/notifications/mark-all-read/').then(() => undefined);

import { apiClient } from "@/lib/api/client";

export interface NotificationDto {
  id: string;
  receiver_id: string;
  channel: string;
  template: string;
  data: Record<string, unknown>;
  read_at?: string | null;
  created_at?: string;
}

export interface ListNotificationsResponse {
  notifications: NotificationDto[];
  count: number;
  offset: number;
  limit: number;
}

export const notificationsApiService = {
  listNotifications: (params?: { limit?: number; offset?: number; is_read?: boolean }) =>
    apiClient.get<ListNotificationsResponse>("/store/notifications", { params }),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>("/store/notifications/unread-count"),

  markAllAsRead: () =>
    apiClient.post<{ success: boolean }>("/store/notifications/read-all"),

  markSingleAsRead: (id: string) =>
    apiClient.post<{ notification: NotificationDto }>(`/store/notifications/${id}/read`),
};

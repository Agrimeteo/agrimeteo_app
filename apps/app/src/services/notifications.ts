import api from './api';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'weather';
  read: boolean;
  created_at: string;
}

export const fetchNotifications = async (read?: boolean) => {
  const response = await api.get('/profile/notifications', {
    params: typeof read === 'boolean' ? { read } : undefined,
  });

  return (response.data?.data ?? []) as AppNotification[];
};

export const fetchUnreadNotificationsCount = async () => {
  const response = await api.get('/profile/notifications/count');
  return Number(response.data?.data?.unread ?? 0);
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.patch(`/profile/notifications/${notificationId}/read`);
  return response.data?.data as AppNotification;
};

export const deleteNotification = async (notificationId: string) => {
  await api.delete(`/profile/notifications/${notificationId}`);
};

export const clearNotifications = async () => {
  await api.delete('/profile/notifications');
};

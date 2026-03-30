
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'weather';
  read: boolean;
  data?: any;
  created_at: string;
}

export interface CreateNotification {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'weather';
  data?: any;
}


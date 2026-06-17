import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  BellOff,
  CheckCircle2,
  CloudRain,
  Settings,
  ShieldAlert,
  Sprout,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  clearNotifications,
  deleteNotification,
  fetchNotifications,
  markNotificationAsRead,
  type AppNotification,
} from '../../services/notifications';

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) {
    return 'Just now';
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (loadError) {
      console.error('Failed to load notifications:', loadError);
      setError('Unable to load notifications right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((notification) => !notification.read);
    }

    return notifications;
  }, [filter, notifications]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const getTypeMeta = (type: AppNotification['type']) => {
    switch (type) {
      case 'weather':
        return {
          icon: <CloudRain size={18} />,
          classes: 'bg-blue-100 text-blue-600',
        };
      case 'success':
        return {
          icon: <Sprout size={18} />,
          classes: 'bg-green-100 text-green-600',
        };
      case 'warning':
      case 'error':
        return {
          icon: <ShieldAlert size={18} />,
          classes: 'bg-red-100 text-red-600',
        };
      default:
        return {
          icon: <Wrench size={18} />,
          classes: 'bg-slate-100 text-slate-600',
        };
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setBusyId(notificationId);
      const updated = await markNotificationAsRead(notificationId);
      setNotifications((current) =>
        current.map((notification) => (notification.id === notificationId ? updated : notification))
      );
    } catch (markError) {
      console.error('Failed to mark notification as read:', markError);
      setError('Unable to update this notification.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      setBusyId(notificationId);
      await deleteNotification(notificationId);
      setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
    } catch (deleteError) {
      console.error('Failed to delete notification:', deleteError);
      setError('Unable to delete this notification.');
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.read);
    try {
      await Promise.all(unreadNotifications.map((notification) => markNotificationAsRead(notification.id)));
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    } catch (markAllError) {
      console.error('Failed to mark all notifications as read:', markAllError);
      setError('Unable to mark all notifications as read.');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearNotifications();
      setNotifications([]);
    } catch (clearError) {
      console.error('Failed to clear notifications:', clearError);
      setError('Unable to clear notifications right now.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-primary/10 bg-white p-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 flex-1 text-lg font-bold text-slate-900">Notifications</h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => void handleMarkAllAsRead()}
              className="rounded-lg px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="p-4">
        <div className="mb-4 flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-600'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'unread' ? 'bg-white text-primary shadow-sm' : 'text-slate-600'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading notifications...</div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <BellOff size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-500">No notifications</p>
                <p className="text-sm text-slate-400">You're all caught up.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const typeMeta = getTypeMeta(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border p-4 transition-all ${
                      notification.read ? 'border-slate-100 bg-slate-50/50' : 'border-primary/20 bg-primary/5 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeMeta.classes}`}>
                        {typeMeta.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className={`text-sm font-semibold ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                              {notification.title}
                            </h3>
                            <p className={`mt-1 text-sm leading-relaxed ${notification.read ? 'text-slate-500' : 'text-slate-700'}`}>
                              {notification.message}
                            </p>
                            <p className="mt-2 text-xs text-slate-400">{formatRelativeTime(notification.created_at)}</p>
                          </div>

                          <div className="flex flex-shrink-0 items-center gap-1">
                            {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                            <button
                              onClick={() => void handleMarkAsRead(notification.id)}
                              disabled={busyId === notification.id}
                              className={`rounded-full p-1 transition-colors ${
                                notification.read ? 'text-green-500 hover:bg-green-50' : 'text-primary hover:bg-primary/10'
                              }`}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              onClick={() => void handleDelete(notification.id)}
                              disabled={busyId === notification.id}
                              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {notifications.length > 0 && !loading && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <button
              onClick={() => void handleClearAll()}
              className="w-full rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Clear all notifications
            </button>
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default Notifications;

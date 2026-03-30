import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, BellOff, Trash2, Settings, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'weather' | 'crop' | 'system' | 'alert';
  read: boolean;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Weather Alert',
      message: 'Heavy rain expected tomorrow. Consider delaying irrigation.',
      time: '2 hours ago',
      type: 'weather',
      read: false
    },
    {
      id: '2',
      title: 'Crop Health Update',
      message: 'Your maize crop shows excellent growth. Keep monitoring soil moisture.',
      time: '1 day ago',
      type: 'crop',
      read: false
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Scheduled maintenance completed. All systems operational.',
      time: '2 days ago',
      type: 'system',
      read: true
    },
    {
      id: '4',
      title: 'Pest Alert',
      message: 'Potential pest activity detected in Sector B. Consider preventive measures.',
      time: '3 days ago',
      type: 'alert',
      read: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return '🌧️';
      case 'crop': return '🌱';
      case 'system': return '⚙️';
      case 'alert': return '🚨';
      default: return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weather': return 'bg-blue-100 text-blue-600';
      case 'crop': return 'bg-green-100 text-green-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      case 'alert': return 'bg-red-100 text-red-600';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <header className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
        <button 
          onClick={() => navigate(-1)}
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-slate-900 text-lg font-bold flex-1 ml-4">Notifications</h2>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button 
              onClick={markAllAsRead}
              className="text-primary text-sm font-medium hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors"
            >
              Mark all read
            </button>
          )}
          <button 
            onClick={() => navigate('/settings')}
            className="text-slate-500 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="p-4">
        {/* Filter Tabs */}
        <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-600'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === 'unread' ? 'bg-white text-primary shadow-sm' : 'text-slate-600'
            }`}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellOff size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">No notifications</p>
              <p className="text-slate-400 text-sm">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl p-4 border transition-all ${
                  notification.read 
                    ? 'border-slate-100 bg-slate-50/50' 
                    : 'border-primary/20 bg-primary/5 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-10 rounded-lg flex items-center justify-center text-lg ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold text-sm ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm mt-1 leading-relaxed ${notification.read ? 'text-slate-500' : 'text-slate-700'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">{notification.time}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                        )}
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className={`p-1 rounded-full transition-colors ${
                            notification.read 
                              ? 'text-green-500 hover:bg-green-50' 
                              : 'text-primary hover:bg-primary/10'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Clear All Button */}
        {notifications.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={clearAll}
              className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors"
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
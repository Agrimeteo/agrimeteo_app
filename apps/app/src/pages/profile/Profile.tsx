import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, ChevronRight, Edit, HelpCircle, LogOut, Mail, Settings, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchUnreadNotificationsCount } from '../../services/notifications';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await fetchUnreadNotificationsCount();
        setUnreadNotifications(count);
      } catch {
        setUnreadNotifications(0);
      }
    };

    void loadUnreadCount();
  }, []);

  const roleLabel = useMemo(() => {
    switch (user?.role) {
      case 'admin':
        return 'Administrator';
      case 'beginner':
        return 'Beginner grower';
      case 'farmer':
        return 'Farmer';
      default:
        return 'AgroSmart member';
    }
  }, [user?.role]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <section className="flex flex-col items-center px-4 pb-6 pt-8">
        <div className="group relative">
          <div className="flex size-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-primary/20 shadow-xl">
            {user?.avatar ? (
              <img className="h-full w-full object-cover" src={user.avatar} alt={user.name} />
            ) : (
              <User size={64} className="text-primary" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 flex size-10 items-center justify-center rounded-full border-4 border-[#f6f8f8] bg-primary text-white shadow-lg transition-transform hover:scale-105">
            <Edit size={16} />
          </button>
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'AgroSmart user'}</h2>
          <div className="mt-1 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Mail size={14} />
            <span>{user?.email || 'No email available'}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{roleLabel}</p>
        </div>
      </section>

      <section className="space-y-6 px-4">
        <div>
          <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-slate-400">Account Configuration</h3>
          <div className="overflow-hidden rounded-2xl border border-primary/5 bg-white shadow-sm">
            <button
              onClick={() => navigate('/edit-profile')}
              className="flex w-full items-center gap-4 border-b border-primary/5 p-4 transition-colors hover:bg-primary/5 last:border-0"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User size={20} />
              </div>
              <span className="flex-1 text-left font-medium text-slate-700">Edit Profile</span>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex w-full items-center gap-4 border-b border-primary/5 p-4 transition-colors hover:bg-primary/5 last:border-0"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Settings size={20} />
              </div>
              <span className="flex-1 text-left font-medium text-slate-700">Account Settings</span>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="flex w-full items-center gap-4 border-b border-primary/5 p-4 transition-colors hover:bg-primary/5 last:border-0"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell size={20} />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <span className="font-medium text-slate-700">Notifications</span>
                {unreadNotifications > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {unreadNotifications} NEW
                  </span>
                )}
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-slate-400">General</h3>
          <div className="overflow-hidden rounded-2xl border border-primary/5 bg-white shadow-sm">
            <button
              onClick={() => navigate('/help')}
              className="flex w-full items-center gap-4 border-b border-primary/5 p-4 transition-colors hover:bg-primary/5 last:border-0"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HelpCircle size={20} />
              </div>
              <span className="flex-1 text-left font-medium text-slate-700">Help & Support</span>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-4 border-b border-primary/5 p-4 text-red-500 transition-colors hover:bg-primary/5 last:border-0"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-100">
                <LogOut size={20} />
              </div>
              <span className="flex-1 text-left font-bold">Logout</span>
              <ChevronRight size={20} className="opacity-50" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-white to-primary/5 p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Shield size={18} />
            <span className="text-sm font-semibold">Account status</span>
          </div>
          <p className="text-sm text-slate-600">
            Your session, role, and settings are now synced with AgroSmart services when available.
          </p>
        </div>
      </section>
    </motion.div>
  );
};

export default Profile;

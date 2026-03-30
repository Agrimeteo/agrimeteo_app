import React from 'react';
import { motion } from 'motion/react';
import { Settings, LogOut, ChevronRight, MapPin, User, Shield, HelpCircle, Bell, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <section className="flex flex-col items-center pt-8 pb-6 px-4">
        <div className="relative group">
          <div className="size-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-primary/20 flex items-center justify-center">
            {user?.avatar ? (
              <img className="w-full h-full object-cover" src={user.avatar} alt={user.name} />
            ) : (
              <User size={64} className="text-primary" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-primary text-white size-10 rounded-full border-4 border-[#f6f8f8] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Edit size={16} />
          </button>
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'Alex Rivers'}</h2>
          <div className="flex items-center justify-center gap-1 text-primary/70 font-medium">
            <MapPin size={14} />
            <span className="text-sm">California, USA</span>
          </div>
          <p className="text-sm mt-1 text-slate-500">Farm Manager • AgriMétéo Pro User</p>
        </div>
      </section>

      <section className="px-4 space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Account Configuration</h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-primary/5">
            <button 
              onClick={() => navigate('/edit-profile')}
              className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              <span className="flex-1 text-left font-medium text-slate-700">Edit Profile</span>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Settings size={20} />
              </div>
              <span className="flex-1 text-left font-medium text-slate-700">Account Settings</span>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
            <button 
              onClick={() => navigate('/notifications')}
              className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bell size={20} />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="font-medium text-slate-700">Notifications</span>
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">4 NEW</span>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">General</h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-primary/5">
            <button 
              onClick={() => navigate('/help')}
              className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <HelpCircle size={20} />
              </div>
              <span className="flex-1 text-left font-medium text-slate-700">Help & Support</span>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0 text-red-500"
            >
              <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center">
                <LogOut size={20} />
              </div>
              <span className="flex-1 text-left font-bold">Logout</span>
              <ChevronRight size={20} className="opacity-50" />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Profile;

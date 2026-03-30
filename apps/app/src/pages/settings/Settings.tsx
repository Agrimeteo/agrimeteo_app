import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Mail, Globe, Ruler, Moon, Shield, LogOut, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-white"
    >
      <header className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
        <button 
          onClick={() => navigate(-1)}
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-slate-900 text-lg font-bold flex-1 ml-4">Settings</h2>
      </header>

      <main className="flex flex-col flex-1 pb-10">
        <section className="mt-4">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-4 pb-2">Notifications</h3>
          <div className="flex items-center gap-4 bg-white px-4 min-h-[64px] justify-between border-b border-primary/5">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                <Bell size={20} />
              </div>
              <div className="flex flex-col">
                <p className="text-slate-900 text-base font-medium">Push Notifications</p>
                <p className="text-slate-500 text-xs text-nowrap">Receive real-time alerts</p>
              </div>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-all duration-300 ${
                notifications ? 'bg-primary justify-end' : 'bg-slate-200 justify-start'
              }`}
            >
              <div className="h-full w-[27px] rounded-full bg-white shadow-md" />
            </button>
          </div>
          <div className="flex items-center gap-4 bg-white px-4 min-h-[64px] justify-between">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                <Mail size={20} />
              </div>
              <div className="flex flex-col">
                <p className="text-slate-900 text-base font-medium">Email Alerts</p>
                <p className="text-slate-500 text-xs text-nowrap">Weekly summaries & reports</p>
              </div>
            </div>
            <button 
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-all duration-300 ${
                emailAlerts ? 'bg-primary justify-end' : 'bg-slate-200 justify-start'
              }`}
            >
              <div className="h-full w-[27px] rounded-full bg-white shadow-md" />
            </button>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-4 pb-2">Preferences</h3>
          <button className="w-full flex items-center gap-4 bg-white px-4 min-h-[64px] justify-between border-b border-primary/5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                <Globe size={20} />
              </div>
              <p className="text-slate-900 text-base font-medium">Language</p>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-sm">English (US)</span>
              <ChevronRight size={18} />
            </div>
          </button>
          <button className="w-full flex items-center gap-4 bg-white px-4 min-h-[64px] justify-between border-b border-primary/5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                <Ruler size={20} />
              </div>
              <p className="text-slate-900 text-base font-medium">Unit System</p>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-sm">Metric (Celsius, kg)</span>
              <ChevronRight size={18} />
            </div>
          </button>
          <button className="w-full flex items-center gap-4 bg-white px-4 min-h-[64px] justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                <Moon size={20} />
              </div>
              <p className="text-slate-900 text-base font-medium">Appearance</p>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-sm">Light Mode</span>
              <ChevronRight size={18} />
            </div>
          </button>
        </section>

        <section className="mt-8">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-4 pb-2">Account</h3>
          <button className="w-full flex items-center gap-4 bg-white px-4 min-h-[64px] justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                <Shield size={20} />
              </div>
              <p className="text-slate-900 text-base font-medium">Privacy & Security</p>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </section>

        <div className="mt-auto px-4 pt-12">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors border border-red-100"
          >
            <LogOut size={20} />
            Logout
          </button>
          <p className="text-center text-slate-400 text-xs mt-6 mb-4 font-light">AgroSmart v2.4.0 • Built for sustainable farming</p>
        </div>
      </main>
    </motion.div>
  );
};

export default Settings;

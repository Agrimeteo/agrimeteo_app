import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sprout, CloudSun, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNavigation: React.FC = () => {
  const { role } = useAuth();
  
  const dashboardPath = role === 'farmer' ? '/farmer-dashboard' : '/beginner-dashboard';

  const navItems = [
    { path: dashboardPath, icon: LayoutDashboard, label: 'Home' },
    { path: '/crops', icon: Sprout, label: 'Crops' },
    { path: '/weather', icon: CloudSun, label: 'Weather' },
    { path: '/chatbot', icon: MessageSquare, label: 'AgroBot' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-primary/10 px-6 py-2 pb-6 flex justify-between items-center max-w-md mx-auto rounded-t-xl shadow-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] uppercase tracking-tighter font-bold`}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;

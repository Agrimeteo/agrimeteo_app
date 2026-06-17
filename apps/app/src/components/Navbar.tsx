import React, { useState } from 'react';
import { Menu, Bell, X, Home, Sprout, CloudSun, MessageSquare, User, Settings, HelpCircle, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ title = "AgroSmart", subtitle, showBack }) => {
  const { user, role } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    ...(hasPermission('crops.read') ? [{ path: '/crops', icon: Sprout, label: 'Crops' }] : []),
    { path: '/weather', icon: CloudSun, label: 'Weather' },
    { path: '/chatbot', icon: MessageSquare, label: 'AgroBot' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/profile', icon: User, label: 'Profile' },
    ...(hasPermission('settings.read') ? [{ path: '/settings', icon: Settings, label: 'Settings' }] : []),
    { path: '/help', icon: HelpCircle, label: 'Help' },
    ...(role === 'beginner' ? [{ path: '/tutorials', icon: BookOpen, label: 'Tutorials' }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-primary/70 font-medium">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full hover:bg-primary/10 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </button>
            {user?.avatar && (
              <div className="size-10 rounded-full bg-cover bg-center border-2 border-primary/20" style={{ backgroundImage: `url(${user.avatar})` }} />
            )}
          </div>
        </div>
      </header>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Side Menu */}
      <div className={`fixed top-0 left-0 z-[70] h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-primary/10">
          <img src="/logo.png" alt="AgroSmart Logo" className="h-8 w-8 rounded" />
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/5 transition-colors text-left"
            >
              <item.icon size={20} className="text-primary" />
              <span className="font-medium text-slate-700">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-primary/10">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            {user?.avatar ? (
              <img className="size-10 rounded-full" src={user.avatar} alt="Avatar" />
            ) : (
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={20} className="text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{role === 'beginner' ? 'Beginner' : role === 'admin' ? 'Admin' : 'Farmer'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

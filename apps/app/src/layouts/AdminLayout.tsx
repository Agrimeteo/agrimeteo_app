import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, ChevronLeft, ChevronRight, Bell } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', label: 'Users', icon: 'group' },
    { path: '/admin/crops', label: 'Crops', icon: 'potted_plant' },
    { path: '/admin/reports', label: 'Reports', icon: 'description' },
    { path: '/admin/weather', label: 'Weather', icon: 'cloud_sync' },
    { path: '/admin/stats', label: 'Stats', icon: 'query_stats' },
    { path: '/admin/settings', label: 'Settings', icon: 'settings' },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8f8]">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-primary/10 flex flex-col w-64 md:w-${isCollapsed ? '16' : '64'} transition-all duration-300 h-screen md:h-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-primary/10 flex-shrink-0">
          <div className="w-10 h-10 bg-[#13515e] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-sm">agriculture</span>
          </div>
          <div className={!isCollapsed ? "flex-1 min-w-0" : "hidden"}>
            <h1 className="font-bold text-lg text-[#13515e] truncate">Agrimétéo</h1>
            <p className="text-xs text-slate-500 truncate">Admin Control</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                toggleMobileMenu();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group mb-2
                ${location.pathname === item.path
                  ? 'bg-[#13515e]/10 text-[#13515e] border-r-4 border-[#13515e]'
                  : 'text-slate-600 hover:bg-[#13515e]/5 hover:text-[#13515e]'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <span className="material-symbols-outlined text-lg flex-shrink-0">
                {item.icon}
              </span>
              <span className={`font-medium text-sm ${isCollapsed ? 'hidden' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Status & Login */}
        <div className="p-4 border-t border-primary/10 flex-shrink-0 space-y-3">
          <div className="bg-[#13515e]/5 rounded-xl p-3">
            <p className={`text-xs font-semibold text-[#13515e] uppercase mb-1 ${isCollapsed ? 'hidden' : ''}`}>Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#71B280]"></div>
              <span className={`text-xs text-slate-600 ${isCollapsed ? 'hidden' : ''}`}>Operational</span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/admin-login')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all bg-[#13515e] text-white hover:bg-[#13515e]/90 ${isCollapsed ? 'justify-center px-2' : ''}`}
          >
            <span className="material-symbols-outlined text-lg flex-shrink-0">login</span>
            <span className={`font-medium text-sm ${isCollapsed ? 'hidden' : ''}`}>Login</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-primary/10 flex items-center justify-between px-6 md:px-8 z-10 shrink-0 relative">
          {/* Mobile Hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={toggleMobileMenu}>
            <Menu size={20} className="text-slate-700" />
          </button>

          {/* Desktop Toggle */}
          <button 
            className="hidden md:block p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={toggleSidebar}
          >
            <span className={`material-symbols-outlined transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
              chevron_left
            </span>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4 hidden lg:block">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-[#f8f9fa] border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#13515e]/20 text-sm outline-none transition-all"
                placeholder="Search data, reports, users..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#13515e] to-[#1a5f6e] flex items-center justify-center text-white font-semibold shadow-lg">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-auto p-6 md:p-8 ${isCollapsed ? 'lg:ml-20' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

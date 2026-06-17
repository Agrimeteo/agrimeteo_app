import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import InstallAppPrompt from '../components/InstallAppPrompt';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';

const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const { logout } = useAuth();
  const { hasPermission, loading } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', label: 'Users', icon: 'group', visible: loading || hasPermission('users.read') },
    { path: '/admin/crops', label: 'Crops', icon: 'potted_plant', visible: loading || hasPermission('crops.read') },
    { path: '/admin/reports', label: 'Reports', icon: 'description', visible: loading || hasPermission('reports.read') },
    { path: '/admin/audit', label: 'Audit Logs', icon: 'history' },
    { path: '/admin/permissions', label: 'Permissions', icon: 'lock', visible: loading || hasPermission('permissions.read') },
    { path: '/admin/community', label: 'Community', icon: 'forum' },
    { path: '/admin/weather', label: 'Weather', icon: 'cloud_sync' },
    { path: '/admin/stats', label: 'Stats', icon: 'query_stats' },
    { path: '/admin/settings', label: 'Settings', icon: 'settings', visible: loading || hasPermission('settings.read') },
  ].filter((item) => item.visible !== false);

  useEffect(() => {
    setGlobalSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const updateGlobalSearch = (value: string) => {
    setGlobalSearch(value);
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }

    setSearchParams(params);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin-login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8f8]">
      <InstallAppPrompt />

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-primary/10 bg-white transition-all duration-300',
          isCollapsed ? 'md:w-20' : 'md:w-64',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center gap-3 border-b border-primary/10 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#13515e] text-white">
            <span className="material-symbols-outlined text-sm">agriculture</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold text-[#13515e]">Agrimeteo</h1>
              <p className="truncate text-xs text-slate-500">Admin Control</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className={[
                'group mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
                location.pathname === item.path
                  ? 'border-r-4 border-[#13515e] bg-[#13515e]/10 text-[#13515e]'
                  : 'text-slate-600 hover:bg-[#13515e]/5 hover:text-[#13515e]',
                isCollapsed ? 'justify-center px-2' : '',
              ].join(' ')}
            >
              <span className="material-symbols-outlined flex-shrink-0 text-lg">{item.icon}</span>
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="space-y-3 border-t border-primary/10 p-4">
          <div className="rounded-xl bg-[#13515e]/5 p-3">
            {!isCollapsed && <p className="mb-1 text-xs font-semibold uppercase text-[#13515e]">Status</p>}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#71B280]" />
              {!isCollapsed && <span className="text-xs text-slate-600">Operational</span>}
            </div>
          </div>

          <button
            onClick={() => void handleLogout()}
            className={[
              'flex w-full items-center gap-3 rounded-lg bg-[#13515e] px-3 py-2.5 text-white transition-all hover:bg-[#13515e]/90',
              isCollapsed ? 'justify-center px-2' : '',
            ].join(' ')}
          >
            <span className="material-symbols-outlined flex-shrink-0 text-lg">logout</span>
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <div className={`flex min-w-0 flex-1 flex-col overflow-hidden transition-[padding] duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-primary/10 bg-white px-4 sm:px-6 md:px-8">
          <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setIsMobileMenuOpen((current) => !current)}>
            <Menu size={20} className="text-slate-700" />
          </button>

          <button className="hidden rounded-lg p-2 transition-colors hover:bg-slate-100 md:block" onClick={() => setIsCollapsed((current) => !current)}>
            <span className={`material-symbols-outlined transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>chevron_left</span>
          </button>

          <div className="mx-4 hidden max-w-md flex-1 lg:block">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">search</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-[#f8f9fa] py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#13515e]/20"
                placeholder="Search data, reports, users..."
                value={globalSearch}
                onChange={(event) => updateGlobalSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="relative rounded-lg p-2 transition-colors hover:bg-slate-100">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-red-500" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#13515e] to-[#1a5f6e] font-semibold text-white shadow-lg">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

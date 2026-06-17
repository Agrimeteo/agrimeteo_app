import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { exportRowsToCsv } from '../../services/adminTools';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  location?: string;
  crop_count: number;
  report_count: number;
}

const AdminUsers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const searchTerm = searchParams.get('q') || '';

  useEffect(() => {
    fetchUsers();
    const intervalId = window.setInterval(fetchUsers, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setRoleFilter(searchParams.get('role') || 'all');
  }, [searchParams]);

  const fetchUsers = async () => {
    try {
      setErrorMessage('');
      const { data } = await api.get('/admin/users?limit=200');
      setUsers(data.data ?? []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Unable to load users right now. Please refresh after the admin API is available.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuery = (next: { q?: string; role?: string }) => {
    const params = new URLSearchParams(searchParams);

    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q);
      else params.delete('q');
    }

    if (next.role !== undefined) {
      if (next.role && next.role !== 'all') params.set('role', next.role);
      else params.delete('role');
    }

    setSearchParams(params);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const exportUsers = () => {
    exportRowsToCsv(
      `admin-users-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredUsers.map((user) => ({
        name: user.full_name || 'Unknown',
        email: user.email,
        role: user.role,
        location: user.location || 'Unknown',
        crops: user.crop_count || 0,
        reports: user.report_count || 0,
      })),
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500">Manage your farmers and beginners with live data from Supabase.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            onClick={exportUsers}
            className="rounded-lg bg-[#13515e] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#13515e]/15 transition-colors hover:bg-[#13515e]/90"
          >
            Export CSV
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex justify-between">
            <div className="rounded-lg bg-[#13515e]/10 p-2 text-[#13515e]">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-xs font-bold text-[#71B280]">{filteredUsers.length} shown</span>
          </div>
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="text-2xl font-bold">{loading ? '...' : users.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex justify-between">
            <div className="rounded-lg bg-[#71B280]/10 p-2 text-[#71B280]">
              <span className="material-symbols-outlined">agriculture</span>
            </div>
            <span className="text-xs font-bold text-[#71B280]">
              {users.filter((u) => u.role === 'farmer').length}
            </span>
          </div>
          <p className="text-sm text-slate-500">Active Farmers</p>
          <p className="text-2xl font-bold">{loading ? '...' : users.filter((u) => u.role === 'farmer').length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex justify-between">
            <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
              <span className="material-symbols-outlined">school</span>
            </div>
            <span className="text-xs font-bold text-orange-600">
              {users.filter((u) => u.role === 'beginner').length}
            </span>
          </div>
          <p className="text-sm text-slate-500">Beginners</p>
          <p className="text-2xl font-bold">{loading ? '...' : users.filter((u) => u.role === 'beginner').length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex justify-between">
            <div className="rounded-lg bg-red-100 p-2 text-red-600">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <span className="text-xs font-bold text-red-600">{users.filter((u) => u.role === 'admin').length}</span>
          </div>
          <p className="text-sm text-slate-500">Admins</p>
          <p className="text-2xl font-bold">{loading ? '...' : users.filter((u) => u.role === 'admin').length}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="min-w-[280px] flex-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 outline-none transition-all focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
              placeholder="Search by name, email, or location..."
              type="text"
              value={searchTerm}
              onChange={(event) => updateQuery({ q: event.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              updateQuery({ role: event.target.value });
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
          >
            <option value="all">All roles</option>
            <option value="farmer">Farmers</option>
            <option value="beginner">Beginners</option>
            <option value="admin">Admins</option>
          </select>
          <button
            onClick={() => {
              setRoleFilter('all');
              setSearchParams(new URLSearchParams());
            }}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Location</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Crops</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Reports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-[#13515e]/20 text-xs font-bold text-[#13515e]">
                        {user.full_name ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'U'}
                      </div>
                      <span className="font-medium">{user.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                        user.role === 'farmer'
                          ? 'bg-[#71B280]/10 text-[#71B280]'
                          : user.role === 'admin'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.location || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.crop_count || 0}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.report_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredUsers.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            {errorMessage ? 'Users could not be loaded.' : 'No users match the current search.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

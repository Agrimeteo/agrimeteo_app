import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  crop_count: number;
  report_count: number;
}

const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    const intervalId = window.setInterval(fetchUsers, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data ?? []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
        <p className="text-slate-500">Manage your farmers and system beginners from this central hub.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#13515e]/10 text-[#13515e] rounded-lg">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-[#71B280] text-xs font-bold">+12%</span>
          </div>
          <p className="text-slate-500 text-sm">Total Users</p>
          <p className="text-2xl font-bold">{loading ? '...' : users.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#71B280]/10 text-[#71B280] rounded-lg">
              <span className="material-symbols-outlined">agriculture</span>
            </div>
            <span className="text-[#71B280] text-xs font-bold">+5%</span>
          </div>
          <p className="text-slate-500 text-sm">Active Farmers</p>
          <p className="text-2xl font-bold">{loading ? '...' : users.filter(u => u.role === 'farmer').length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <span className="material-symbols-outlined">school</span>
            </div>
            <span className="text-slate-400 text-xs font-bold">0%</span>
          </div>
          <p className="text-slate-500 text-sm">Beginners</p>
          <p className="text-2xl font-bold">{loading ? '...' : users.filter(u => u.role === 'beginner').length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <span className="material-symbols-outlined">block</span>
            </div>
            <span className="text-red-600 text-xs font-bold">-2%</span>
          </div>
          <p className="text-slate-500 text-sm">Admins</p>
          <p className="text-2xl font-bold">{loading ? '...' : users.filter(u => u.role === 'admin').length}</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Crops</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reports</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-[#13515e]/20 flex items-center justify-center text-[#13515e] text-xs font-bold">
                        {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                      </div>
                      <span className="font-medium">{user.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 ${user.role === 'farmer' ? 'bg-[#71B280]/10 text-[#71B280]' : user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'} text-xs font-medium rounded-full capitalize`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{user.crop_count || 0}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{user.report_count || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#13515e] transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-orange-600 transition-colors" title="Suspend">
                        <span className="material-symbols-outlined text-[20px]">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

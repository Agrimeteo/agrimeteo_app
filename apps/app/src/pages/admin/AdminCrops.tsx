import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface Crop {
  id: string;
  crop_type: string;
  planting_date: string;
  status: string;
  user_name: string;
  user_role: string;
  area?: number;
  location?: string;
}

const AdminCrops: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrops();
    const intervalId = window.setInterval(fetchCrops, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const fetchCrops = async () => {
    try {
      const { data } = await api.get('/admin/crops');
      setCrops(data.data ?? []);
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return 'bg-green-100 text-green-800';
      case 'growing': return 'bg-blue-100 text-blue-800';
      case 'harvested': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredCrops = crops.filter(crop =>
    crop.crop_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-slate-900">Crop Monitoring</h2>
          <p className="text-sm text-slate-500">Real-time agricultural data and crop health tracking</p>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#13515e]/10 text-[#13515e] rounded-lg font-semibold text-sm hover:bg-[#13515e]/20 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#13515e] text-white rounded-lg font-semibold text-sm shadow-md shadow-[#13515e]/20 hover:bg-[#13515e]/90 transition-colors">
            <span className="material-symbols-outlined text-lg">add</span>
            New Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Total Crops</span>
            <span className="material-symbols-outlined text-[#13515e]">potted_plant</span>
          </div>
          <div className="text-2xl font-bold">1,284</div>
          <div className="mt-2 flex items-center text-[#71B280] text-sm">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            <span className="ml-1">12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Healthy Growth</span>
            <span className="material-symbols-outlined text-[#71B280]">check_circle</span>
          </div>
          <div className="text-2xl font-bold">94.2%</div>
          <div className="mt-2 text-slate-400 text-sm">Target: 92%</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Active Farmers</span>
            <span className="material-symbols-outlined text-[#13515e]">person</span>
          </div>
          <div className="text-2xl font-bold">452</div>
          <div className="mt-2 text-slate-400 text-sm">Across 12 regions</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Risk Alerts</span>
            <span className="material-symbols-outlined text-orange-500">warning</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">8</div>
          <div className="mt-2 text-slate-400 text-sm">Requires attention</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-[#13515e] focus:border-[#13515e]"
              placeholder="Search by farmer name, region, or crop..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-[#13515e] focus:border-[#13515e]">
            <option>Crop Type: All</option>
            <option>Maize</option>
            <option>Wheat</option>
            <option>Rice</option>
            <option>Soybean</option>
          </select>
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-[#13515e] focus:border-[#13515e]">
            <option>Stage: All</option>
            <option>Seeding</option>
            <option>Vegetative</option>
            <option>Flowering</option>
            <option>Ripening</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            More Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#13515e]/5 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e]">Farmer Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e]">Crop Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e]">Planting Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e]">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e]">Location</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e] text-right">User Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCrops.map((crop) => (
                <tr key={crop.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-[#13515e]/20 flex items-center justify-center text-[#13515e] text-xs font-bold">
                        {crop.user_name ? crop.user_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                      </div>
                      <span className="font-semibold">{crop.user_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-[#13515e]/10 text-[#13515e] text-xs font-bold uppercase">
                      {crop.crop_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {crop.planting_date ? new Date(crop.planting_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(crop.status)} capitalize`}>
                      {crop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {crop.location || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${crop.user_role === 'farmer' ? 'bg-[#71B280]/10 text-[#71B280]' : 'bg-orange-100 text-orange-600'}`}>
                      {crop.user_role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">Showing 1 to 5 of 1,284 results</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 bg-[#13515e] text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm">2</button>
            <button className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm">3</button>
            <button className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCrops;

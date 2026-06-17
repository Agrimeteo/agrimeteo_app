import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { exportRowsToCsv } from '../../services/adminTools';

interface Crop {
  id: string;
  crop_type?: string;
  name?: string;
  planting_date: string;
  status: string;
  user_name: string;
  user_role: string;
  area?: number;
  location?: string;
  created_at?: string;
}

const PAGE_SIZE = 10;

const AdminCrops: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cropTypeFilter, setCropTypeFilter] = useState(searchParams.get('cropType') || 'all');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || 'all');
  const [page, setPage] = useState(1);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const searchTerm = searchParams.get('q') || '';

  useEffect(() => {
    fetchCrops();
    const intervalId = window.setInterval(fetchCrops, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setCropTypeFilter(searchParams.get('cropType') || 'all');
    setStageFilter(searchParams.get('stage') || 'all');
  }, [searchParams]);

  const fetchCrops = async () => {
    try {
      const { data } = await api.get('/admin/crops?limit=200');
      setCrops(data.data ?? []);
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const cropTypes = useMemo(() => {
    return [...new Set(crops.map((crop) => crop.crop_type || crop.name || 'Unknown'))].sort();
  }, [crops]);

  const updateQuery = (next: { q?: string; cropType?: string; stage?: string }) => {
    const params = new URLSearchParams(searchParams);

    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q);
      else params.delete('q');
    }

    if (next.cropType !== undefined) {
      if (next.cropType && next.cropType !== 'all') params.set('cropType', next.cropType);
      else params.delete('cropType');
    }

    if (next.stage !== undefined) {
      if (next.stage && next.stage !== 'all') params.set('stage', next.stage);
      else params.delete('stage');
    }

    setSearchParams(params);
    setPage(1);
  };

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const cropLabel = crop.crop_type || crop.name || 'Unknown';
      const matchesSearch =
        !searchTerm ||
        cropLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = cropTypeFilter === 'all' || cropLabel === cropTypeFilter;
      const matchesStage = stageFilter === 'all' || crop.status === stageFilter;

      return matchesSearch && matchesType && matchesStage;
    });
  }, [crops, searchTerm, cropTypeFilter, stageFilter]);

  const paginatedCrops = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCrops.slice(start, start + PAGE_SIZE);
  }, [filteredCrops, page]);

  const totalPages = Math.max(1, Math.ceil(filteredCrops.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted':
        return 'bg-green-100 text-green-800';
      case 'growing':
        return 'bg-blue-100 text-blue-800';
      case 'harvested':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const exportCrops = () => {
    exportRowsToCsv(
      `admin-crops-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredCrops.map((crop) => ({
        farmer: crop.user_name || 'Unknown',
        crop: crop.crop_type || crop.name || 'Unknown',
        planting_date: crop.planting_date ? new Date(crop.planting_date).toLocaleDateString() : 'N/A',
        status: crop.status,
        location: crop.location || 'N/A',
        area: crop.area ?? '',
        role: crop.user_role || 'N/A',
      })),
    );
  };

  const totalArea = filteredCrops.reduce((sum, crop) => sum + (Number(crop.area) || 0), 0);
  const activeFarmers = new Set(filteredCrops.map((crop) => crop.user_name).filter(Boolean)).size;
  const riskAlerts = filteredCrops.filter((crop) => crop.status !== 'harvested').length;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Crop Monitoring</h2>
            <p className="text-sm text-slate-500">Live agricultural data across all farmers and locations.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportCrops}
              className="flex items-center gap-2 rounded-lg bg-[#13515e]/10 px-4 py-2 text-sm font-semibold text-[#13515e] transition-colors hover:bg-[#13515e]/20"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Export CSV
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="flex items-center gap-2 rounded-lg bg-[#13515e] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#13515e]/20 transition-colors hover:bg-[#13515e]/90"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              New Report
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Crops</span>
            <span className="material-symbols-outlined text-[#13515e]">potted_plant</span>
          </div>
          <div className="text-2xl font-bold">{loading ? '...' : filteredCrops.length}</div>
          <div className="mt-2 text-sm text-slate-400">{crops.length} loaded overall</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Planted / Growing</span>
            <span className="material-symbols-outlined text-[#71B280]">check_circle</span>
          </div>
          <div className="text-2xl font-bold">
            {loading ? '...' : filteredCrops.filter((crop) => crop.status !== 'harvested').length}
          </div>
          <div className="mt-2 text-sm text-slate-400">Currently active</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Active Farmers</span>
            <span className="material-symbols-outlined text-[#13515e]">person</span>
          </div>
          <div className="text-2xl font-bold">{loading ? '...' : activeFarmers}</div>
          <div className="mt-2 text-sm text-slate-400">In current selection</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Tracked Area</span>
            <span className="material-symbols-outlined text-orange-500">warning</span>
          </div>
          <div className="text-2xl font-bold">{loading ? '...' : totalArea.toFixed(1)} ha</div>
          <div className="mt-2 text-sm text-slate-400">{riskAlerts} non-harvested crops</div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="min-w-[280px] flex-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 outline-none focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
              placeholder="Search by farmer, region, or crop..."
              type="text"
              value={searchTerm}
              onChange={(event) => updateQuery({ q: event.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={cropTypeFilter}
            onChange={(event) => {
              setCropTypeFilter(event.target.value);
              updateQuery({ cropType: event.target.value });
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
          >
            <option value="all">Crop Type: All</option>
            {cropTypes.map((cropType) => (
              <option key={cropType} value={cropType}>
                {cropType}
              </option>
            ))}
          </select>
          <select
            value={stageFilter}
            onChange={(event) => {
              setStageFilter(event.target.value);
              updateQuery({ stage: event.target.value });
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
          >
            <option value="all">Stage: All</option>
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="harvested">Harvested</option>
          </select>
          <button
            onClick={() => {
              setCropTypeFilter('all');
              setStageFilter('all');
              setSearchParams(new URLSearchParams());
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-lg">filter_list_off</span>
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-[#13515e]/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e]">Farmer Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e]">Crop Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e]">Planting Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e]">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#13515e]">Location</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#13515e]">User Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedCrops.map((crop) => {
                const cropLabel = crop.crop_type || crop.name || 'Unknown';
                return (
                  <tr key={crop.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-[#13515e]/20 text-xs font-bold text-[#13515e]">
                          {crop.user_name ? crop.user_name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'U'}
                        </div>
                        <span className="font-semibold">{crop.user_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-[#13515e]/10 px-3 py-1 text-xs font-bold uppercase text-[#13515e]">
                        {cropLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {crop.planting_date ? new Date(crop.planting_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(crop.status)}`}>
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
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          crop.user_role === 'farmer' ? 'bg-[#71B280]/10 text-[#71B280]' : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {crop.user_role}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filteredCrops.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-slate-500">No crops match the current search.</div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <span className="text-sm text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredCrops.length)} of {filteredCrops.length} results
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="rounded-lg bg-[#13515e] px-3 py-1 text-sm text-white">
              {page}/{totalPages}
            </span>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCrops;

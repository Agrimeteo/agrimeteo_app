import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AdminCrop,
  AdminReport,
  AdminStats as AdminStatsType,
  AdminUser,
  buildActivityTimeline,
  buildCropTypeDistribution,
  buildRegionalActivity,
  buildStatusDistribution,
  fetchAdminAnalytics,
  formatLastUpdated,
} from '../../services/adminAnalytics';

const AdminStats: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<'7D' | '30D' | '6M' | '1Y'>('7D');
  const [stats, setStats] = useState<AdminStatsType>({
    total_users: 0,
    admin_count: 0,
    total_crops: 0,
    total_reports: 0,
    total_alerts: 0,
    unread_notifications: 0,
    avg_harvest_days: 0,
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [crops, setCrops] = useState<AdminCrop[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const analytics = await fetchAdminAnalytics();
        if (cancelled) return;

        setStats(analytics.stats);
        setUsers(analytics.users);
        setCrops(analytics.crops);
        setReports(analytics.reports);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching stats', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStats();
    const intervalId = window.setInterval(loadStats, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const activityData = useMemo(() => buildActivityTimeline(crops, reports, activePeriod), [crops, reports, activePeriod]);
  const cropTypeData = useMemo(() => buildCropTypeDistribution(crops), [crops]);
  const reportStatusData = useMemo(() => buildStatusDistribution(reports), [reports]);
  const regionalActivity = useMemo(() => buildRegionalActivity(users, crops, reports), [users, crops, reports]);

  if (loading) {
    return <div className="flex-1 overflow-y-auto p-8">Loading analytics...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">Analytics Overview</h1>
            <p className="text-slate-500">Live operational analytics from users, crops, and plant reports.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-white p-1 shadow-sm">
              {['7D', '30D', '6M', '1Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period as '7D' | '30D' | '6M' | '1Y')}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    activePeriod === period ? 'bg-[#13515e] text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm">
              {formatLastUpdated(lastUpdated)}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-[#13515e]/10 p-2 text-[#13515e]">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-500">live</span>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">Total Alerts</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total_alerts}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-[#13515e]/10 p-2 text-[#13515e]">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="rounded-full bg-[#13515e]/10 px-2 py-1 text-xs font-bold text-[#13515e]">{stats.admin_count} admins</span>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">Total Users</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total_users}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-[#13515e]/10 p-2 text-[#13515e]">
              <span className="material-symbols-outlined">insert_chart</span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-500">{stats.total_reports} total</span>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">Report Volume</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total_reports}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-[#13515e]/10 p-2 text-[#13515e]">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500">{stats.total_crops} crops</span>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">Avg. Harvest Days</p>
          <p className="text-2xl font-bold text-slate-900">{stats.avg_harvest_days || 0}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900">Activity Timeline</h3>
            <p className="text-sm text-slate-500">Real crop and report creation across the selected period</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="crops" name="Crops" stroke="#13515e" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="reports" name="Reports" stroke="#71B280" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900">Report Status Breakdown</h3>
            <p className="text-sm text-slate-500">How diagnosis reports are distributed by workflow state</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportStatusData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#13515e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900">Top Crop Types</h3>
            <p className="text-sm text-slate-500">Most represented crop categories from live records</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropTypeData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="name" width={90} stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#71B280" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900">Platform Snapshot</h3>
            <p className="text-sm text-slate-500">Current operational signals from the admin layer</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
              <span className="text-sm text-slate-600">Total crops tracked</span>
              <span className="font-semibold text-slate-900">{stats.total_crops}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
              <span className="text-sm text-slate-600">Unread notifications</span>
              <span className="font-semibold text-slate-900">{stats.unread_notifications}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
              <span className="text-sm text-slate-600">Known regions</span>
              <span className="font-semibold text-slate-900">{regionalActivity.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
              <span className="text-sm text-slate-600">Sample users loaded</span>
              <span className="font-semibold text-slate-900">{users.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Regional Activity Matrix</h3>
            <p className="text-sm text-slate-500">Aggregated from user locations, crops, and reports</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Region Zone</th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Users</th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Crops</th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Reports</th>
                <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Intensity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {regionalActivity.map((region) => (
                <tr key={region.location}>
                  <td className="px-8 py-5 font-semibold text-slate-800">{region.location}</td>
                  <td className="px-4 py-5 text-center">{region.users}</td>
                  <td className="px-4 py-5 text-center">{region.crops}</td>
                  <td className="px-4 py-5 text-center">{region.reports}</td>
                  <td className="px-8 py-5 text-right">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        region.intensity === 'High'
                          ? 'bg-red-50 text-red-600'
                          : region.intensity === 'Medium'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {region.intensity.toUpperCase()}
                    </span>
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

export default AdminStats;

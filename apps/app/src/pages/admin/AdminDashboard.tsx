import React, { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatsCard from '../../components/admin/StatsCard';
import { useAuth } from '../../context/AuthContext';
import {
  AdminCrop,
  AdminReport,
  AdminStats,
  AdminUser,
  buildActivityTimeline,
  buildCropTypeDistribution,
  buildRegionalActivity,
  buildRoleDistribution,
  fetchAdminAnalytics,
  formatLastUpdated,
} from '../../services/adminAnalytics';

const CHART_COLORS = ['#13515e', '#71B280', '#F4A261', '#E76F51', '#6B7280', '#9CA3AF'];

const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState<AdminStats>({
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
    if (!token || !isAdmin) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const analytics = await fetchAdminAnalytics();
        if (cancelled) return;

        setStats(analytics.stats);
        setUsers(analytics.users);
        setCrops(analytics.crops);
        setReports(analytics.reports);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching admin analytics:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    const intervalId = window.setInterval(loadDashboard, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [token, isAdmin]);

  const activityData = useMemo(() => buildActivityTimeline(crops, reports, '6M'), [crops, reports]);
  const cropTypeData = useMemo(() => buildCropTypeDistribution(crops), [crops]);
  const roleData = useMemo(() => buildRoleDistribution(users), [users]);
  const regionalActivity = useMemo(() => buildRegionalActivity(users, crops, reports), [users, crops, reports]);
  const averageReportsPerUser = users.length ? (reports.length / users.length).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="space-y-8">
        <div>Loading admin stats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500">Welcome back, here's what is happening with Agrimeteo right now.</p>
        </div>
        <span className="text-sm text-slate-400">{formatLastUpdated(lastUpdated)}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={stats.total_users} trend={`${stats.admin_count} admins`} trendColor="text-[#71B280]" />
        <StatsCard title="Total Crops" value={stats.total_crops} trend={`${crops.filter((crop) => crop.status === 'planted').length} planted`} trendColor="text-[#71B280]" />
        <StatsCard title="Plant Reports" value={stats.total_reports} trend={`${averageReportsPerUser}/user`} trendColor="text-[#71B280]" />
        <StatsCard title="Active Alerts" value={stats.total_alerts} trend={`${stats.unread_notifications} unread`} trendColor="text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Platform Activity</h3>
              <p className="text-sm text-slate-500">Real crops and reports created over the last 6 months</p>
            </div>
            <div className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Auto-refresh 30s</div>
          </div>
          <div className="h-72 min-w-0">
            {activityData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#13515e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#13515e" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="#13515e" fill="url(#activityGradient)" strokeWidth={3} />
                  <Area type="monotone" dataKey="reports" stroke="#71B280" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
                No activity data available yet.
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Crop Portfolio</h2>
          <div className="h-48 min-w-0">
            {cropTypeData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cropTypeData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={4}>
                    {cropTypeData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
                No crop data available yet.
              </div>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {cropTypeData.map((crop, index) => (
              <div key={crop.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="text-sm text-slate-600">{crop.name}</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{crop.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Regional Activity Matrix</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {regionalActivity.map((region) => (
            <div key={region.location} className="rounded-lg bg-slate-50 p-4">
              <h4 className="mb-2 text-sm font-bold text-slate-900">{region.location}</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Users:</span>
                  <span className="font-medium">{region.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Crops:</span>
                  <span className="font-medium">{region.crops}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reports:</span>
                  <span className="font-medium">{region.reports}</span>
                </div>
                <div
                  className={`mt-2 rounded-full px-2 py-1 text-center text-xs font-medium ${
                    region.intensity === 'High'
                      ? 'bg-green-100 text-green-800'
                      : region.intensity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {region.intensity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">System Overview</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Users by role</span>
            <span className="text-sm font-medium text-green-600">{roleData.map((item) => `${item.name}: ${item.value}`).join(' • ') || 'No data'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Average harvest cycle</span>
            <span className="text-sm font-medium text-green-600">{stats.avg_harvest_days || 0} days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Unread notifications</span>
            <span className="text-sm font-medium text-green-600">{stats.unread_notifications}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Reports in current sample</span>
            <span className="text-sm font-medium text-yellow-600">{reports.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

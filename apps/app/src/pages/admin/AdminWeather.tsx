import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminWeatherAlert, fetchAdminWeatherAlerts } from '../../services/adminAnalytics';
import { exportRowsToCsv } from '../../services/adminTools';

const AdminWeather: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [alerts, setAlerts] = useState<AdminWeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const searchTerm = searchParams.get('q') || '';
  const severityFilter = searchParams.get('severity') || 'all';

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAdminWeatherAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching admin weather alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
    const intervalId = window.setInterval(loadAlerts, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const updateQuery = (next: { q?: string; severity?: string }) => {
    const params = new URLSearchParams(searchParams);

    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q);
      else params.delete('q');
    }

    if (next.severity !== undefined) {
      if (next.severity && next.severity !== 'all') params.set('severity', next.severity);
      else params.delete('severity');
    }

    setSearchParams(params);
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        !searchTerm ||
        alert.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.crop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = severityFilter === 'all' || alert.security === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [alerts, searchTerm, severityFilter]);

  const groupedByLocation = useMemo(() => {
    const map = new Map<
      string,
      { location: string; count: number; latestType: string; latestSeverity: string; latestValidUntil: string | null }
    >();

    filteredAlerts.forEach((alert) => {
      const existing = map.get(alert.location);
      if (!existing) {
        map.set(alert.location, {
          location: alert.location,
          count: 1,
          latestType: alert.type,
          latestSeverity: alert.security,
          latestValidUntil: alert.valid_until,
        });
        return;
      }

      existing.count += 1;
      const existingDate = existing.latestValidUntil ? new Date(existing.latestValidUntil).getTime() : 0;
      const alertDate = alert.valid_until ? new Date(alert.valid_until).getTime() : 0;
      if (alertDate >= existingDate) {
        existing.latestType = alert.type;
        existing.latestSeverity = alert.security;
        existing.latestValidUntil = alert.valid_until;
      }
    });

    return Array.from(map.values()).sort((left, right) => right.count - left.count);
  }, [filteredAlerts]);

  const severityCounts = useMemo(() => {
    return {
      high: filteredAlerts.filter((alert) => alert.security === 'high').length,
      medium: filteredAlerts.filter((alert) => alert.security === 'medium').length,
      low: filteredAlerts.filter((alert) => alert.security === 'low').length,
    };
  }, [filteredAlerts]);

  const expiringSoon = filteredAlerts.filter((alert) => {
    if (!alert.valid_until) return false;
    const diff = new Date(alert.valid_until).getTime() - Date.now();
    return diff > 0 && diff <= 24 * 60 * 60 * 1000;
  }).length;

  const exportWeather = () => {
    exportRowsToCsv(
      `admin-weather-alerts-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredAlerts.map((alert) => ({
        location: alert.location,
        region: alert.region_name,
        crop: alert.crop_name,
        user: alert.user_name,
        type: alert.type,
        severity: alert.security,
        valid_until: alert.valid_until || '',
        created_at: alert.created_at,
        description: alert.description,
      })),
    );
  };

  const severityBadge = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 text-red-700';
    if (severity === 'medium') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Weather Monitoring</h1>
          <p className="text-slate-600">Live weather alerts aggregated from farmer crops and regions.</p>
        </div>
        <button
          onClick={exportWeather}
          className="rounded-lg bg-[#13515e] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#13515e]/20 transition-colors hover:bg-[#13515e]/90"
        >
          Export CSV
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="min-w-[280px] flex-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 outline-none focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
              placeholder="Search by location, crop, alert type..."
              value={searchTerm}
              onChange={(event) => updateQuery({ q: event.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={severityFilter}
            onChange={(event) => updateQuery({ severity: event.target.value })}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
          >
            <option value="all">All severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Alerts</p>
              <p className="text-2xl font-bold text-slate-900">{loading ? '...' : filteredAlerts.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <span className="material-symbols-outlined text-yellow-600">warning</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">High Severity</p>
              <p className="text-2xl font-bold text-slate-900">{severityCounts.high}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <span className="material-symbols-outlined text-red-600">emergency</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Regions Impacted</p>
              <p className="text-2xl font-bold text-slate-900">{groupedByLocation.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <span className="material-symbols-outlined text-blue-600">public</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-slate-900">{expiringSoon}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <span className="material-symbols-outlined text-orange-600">schedule</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Location Monitoring</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Latest Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Valid Until</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Alert Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {groupedByLocation.map((location) => (
                <tr key={location.location} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{location.location}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{location.latestType}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${severityBadge(location.latestSeverity)}`}>
                      {location.latestSeverity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {location.latestValidUntil ? new Date(location.latestValidUntil).toLocaleString() : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{location.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && groupedByLocation.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-500">No weather alerts available for the current filters.</div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
            <span className="material-symbols-outlined text-yellow-600">warning</span>
          </div>
          <h3 className="text-lg font-bold text-yellow-800">Recent Weather Alerts</h3>
        </div>
        <div className="space-y-3">
          {filteredAlerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="rounded-lg bg-white/70 p-3 text-sm text-yellow-900">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold">{alert.location} • {alert.crop_name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${severityBadge(alert.security)}`}>
                  {alert.security}
                </span>
              </div>
              <p>{alert.description}</p>
            </div>
          ))}
          {!loading && filteredAlerts.length === 0 && (
            <p className="text-sm text-yellow-700">No active alerts to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWeather;

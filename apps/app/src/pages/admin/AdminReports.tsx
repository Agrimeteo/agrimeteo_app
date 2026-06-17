import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { exportRowsToCsv } from '../../services/adminTools';

interface Report {
  id: string;
  title: string;
  description?: string;
  crop_type?: string;
  user_name: string;
  user_role: string;
  created_at: string;
  status: string;
  image_url?: string;
}

const PAGE_SIZE = 8;

const AdminReports: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const searchTerm = searchParams.get('q') || '';
  const activeFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    fetchReports();
    const intervalId = window.setInterval(fetchReports, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/admin/reports?limit=200');
      setReports(data.data ?? []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuery = (next: { q?: string; status?: string }) => {
    const params = new URLSearchParams(searchParams);

    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q);
      else params.delete('q');
    }

    if (next.status !== undefined) {
      if (next.status && next.status !== 'all') params.set('status', next.status);
      else params.delete('status');
    }

    setSearchParams(params);
    setPage(1);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        !searchTerm ||
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.crop_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = activeFilter === 'all' || report.status === activeFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, activeFilter]);

  const paginatedReports = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, page]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/90';
      case 'reviewed':
        return 'bg-[#71B280]';
      case 'critical':
        return 'bg-red-500/90';
      default:
        return 'bg-slate-500/90';
    }
  };

  const exportReports = () => {
    exportRowsToCsv(
      `admin-reports-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredReports.map((report) => ({
        title: report.title || 'Untitled',
        crop_type: report.crop_type || 'General',
        user: report.user_name,
        role: report.user_role,
        status: report.status,
        created_at: new Date(report.created_at).toLocaleString(),
        description: report.description || '',
      })),
    );
  };

  const statuses = ['all', 'pending', 'critical', 'reviewed', 'archived'];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Plant Disease Reports</h2>
            <p className="mt-1 text-slate-500">
              Reviewing {loading ? '...' : reports.length} incoming issues from the agricultural network.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => updateQuery({ status: activeFilter === 'all' ? 'pending' : 'all' })}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-lg">filter_list</span>
              {activeFilter === 'all' ? 'Show Pending' : 'Show All'}
            </button>
            <button
              onClick={exportReports}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="max-w-md">
          <div className="group relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#13515e]">
              search
            </span>
            <input
              className="w-full rounded-lg border border-transparent bg-slate-50 py-2 pl-10 pr-4 text-sm transition-all focus:border-[#13515e] focus:ring-0"
              placeholder="Search reports, farmers, symptoms..."
              type="text"
              value={searchTerm}
              onChange={(event) => updateQuery({ q: event.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
        {statuses.map((status) => {
          const label =
            status === 'all'
              ? 'All Reports'
              : status === 'pending'
                ? 'Pending Review'
                : status === 'critical'
                  ? 'Critical Urgent'
                  : status === 'reviewed'
                    ? 'Reviewed'
                    : 'Archived';

          return (
            <button
              key={status}
              onClick={() => updateQuery({ status })}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === status
                  ? 'bg-[#13515e] text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-[#13515e]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedReports.map((report) => (
          <div
            key={report.id}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-[#13515e]/5"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-100">
              {report.image_url ? (
                <img
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={report.image_url}
                  alt={`${report.title} - ${report.user_name}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl">image</span>
                </div>
              )}
              <div className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ${getStatusColor(report.status)}`}>
                {report.status}
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="leading-tight font-bold text-slate-900">{report.title}</h3>
                  <p className="mt-0.5 text-xs font-medium text-[#13515e]">
                    {report.crop_type || 'General'} • {report.user_role}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="text-slate-400 hover:text-[#13515e]"
                >
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
              </div>
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="material-symbols-outlined text-sm">person</span>
                  <span className="text-xs">
                    User: <span className="font-medium text-slate-700">{report.user_name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  <span className="text-xs">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(report)}
                className="w-full rounded-lg bg-[#13515e]/5 py-2 text-xs font-bold text-[#13515e] transition-all hover:bg-[#13515e] hover:text-white"
              >
                Review Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredReports.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          No reports match the current search.
        </div>
      )}

      <div className="mt-12 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold">{filteredReports.length}</span> of{' '}
          <span className="font-semibold">{reports.length}</span> reports
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all disabled:opacity-50 hover:bg-[#13515e]/5"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="size-10 rounded-lg bg-[#13515e] font-bold text-white shadow-sm">{page}</button>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all disabled:opacity-50 hover:bg-[#13515e]/5"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedReport.title}</h3>
                <p className="text-sm text-slate-500">
                  {selectedReport.user_name} • {selectedReport.crop_type || 'General'} • {selectedReport.status}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {selectedReport.image_url && (
              <img
                src={selectedReport.image_url}
                alt={selectedReport.title}
                className="mb-4 h-56 w-full rounded-xl object-cover"
              />
            )}

            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">Created:</span>{' '}
                {new Date(selectedReport.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Reporter role:</span> {selectedReport.user_role}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Description:</span>{' '}
                {selectedReport.description || 'No additional description provided.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;

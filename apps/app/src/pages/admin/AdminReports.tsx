import React, { useState, useEffect } from 'react';
import api from '../../services/api';

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

const AdminReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    const intervalId = window.setInterval(fetchReports, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/admin/reports');
      setReports(data.data ?? []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.crop_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/90';
      case 'reviewed': return 'bg-[#71B280]';
      case 'critical': return 'bg-red-500/90';
      default: return 'bg-slate-500/90';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Plant Disease Reports</h2>
            <p className="text-slate-500 mt-1">Reviewing {loading ? '...' : reports.length} incoming issues from the agricultural network.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-all">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-all">
              <span className="material-symbols-outlined text-lg">download</span>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#13515e] transition-colors">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:border-[#13515e] focus:ring-0 rounded-lg text-sm transition-all"
              placeholder="Search reports, farmers, or symptoms..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['All Reports', 'Pending Review', 'Critical Urgent', 'Reviewed', 'Archived'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeFilter === filter
                ? 'bg-[#13515e] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#13515e] transition-colors'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-[#13515e]/5 transition-all group">
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              {report.image_url ? (
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={report.image_url}
                  alt={`${report.title} - ${report.user_name}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl">image</span>
                </div>
              )}
              <div className={`absolute top-3 left-3 px-2.5 py-1 ${getStatusColor(report.status)} text-white text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-sm`}>
                {report.status}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{report.title}</h3>
                  <p className="text-xs text-[#13515e] font-medium mt-0.5">{report.crop_type || 'General'} • {report.user_role}</p>
                </div>
                <button className="text-slate-400 hover:text-[#13515e]">
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="material-symbols-outlined text-sm">person</span>
                  <span className="text-xs">User: <span className="text-slate-700 font-medium">{report.user_name}</span></span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  <span className="text-xs">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="w-full py-2 bg-[#13515e]/5 hover:bg-[#13515e] text-[#13515e] hover:text-white text-xs font-bold rounded-lg transition-all">
                Review Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold">{filteredReports.length}</span> of <span className="font-semibold">24</span> reports
        </p>
        <div className="flex gap-2">
          <button className="size-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-[#13515e]/5 text-slate-400 transition-all">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="size-10 flex items-center justify-center bg-[#13515e] text-white rounded-lg font-bold shadow-sm">1</button>
          <button className="size-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-[#13515e]/5 text-slate-600 transition-all">2</button>
          <button className="size-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-[#13515e]/5 text-slate-600 transition-all">3</button>
          <button className="size-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-[#13515e]/5 text-slate-400 transition-all">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;

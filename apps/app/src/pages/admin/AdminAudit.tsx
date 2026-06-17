import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AuditAction,
  AuditEntityType,
  AuditLog,
  fetchAdminAuditLogs,
  exportAuditLogs,
} from '../../services/adminAudit';

const PAGE_SIZE = 12;

const actionBadge = (action: AuditLog['action']) => {
  switch (action) {
    case 'create':
      return 'bg-emerald-100 text-emerald-700';
    case 'update':
      return 'bg-amber-100 text-amber-700';
    case 'delete':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const entityBadge = (entityType: AuditLog['entity_type']) => {
  switch (entityType) {
    case 'crop':
      return 'bg-[#13515e]/10 text-[#13515e]';
    case 'user':
      return 'bg-blue-100 text-blue-700';
    case 'report':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const AdminAudit: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const searchTerm = searchParams.get('q') || '';
  const entityType = (searchParams.get('entity') || 'all') as AuditEntityType;
  const action = (searchParams.get('action') || 'all') as AuditAction;
  const page = Number(searchParams.get('page') || '1');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetchAdminAuditLogs({
        page,
        limit: PAGE_SIZE,
        q: searchTerm,
        entityType,
        action,
      });

      setLogs(response.items);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, [page, searchTerm, entityType, action]);

  const updateQuery = (next: { q?: string; entity?: AuditEntityType; action?: AuditAction; page?: number }) => {
    const params = new URLSearchParams(searchParams);

    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q);
      else params.delete('q');
    }

    if (next.entity !== undefined) {
      if (next.entity !== 'all') params.set('entity', next.entity);
      else params.delete('entity');
    }

    if (next.action !== undefined) {
      if (next.action !== 'all') params.set('action', next.action);
      else params.delete('action');
    }

    if (next.page !== undefined) {
      if (next.page > 1) params.set('page', String(next.page));
      else params.delete('page');
    } else {
      params.delete('page');
    }

    setSearchParams(params);
  };

  const summary = useMemo(() => {
    return {
      creates: logs.filter((log) => log.action === 'create').length,
      updates: logs.filter((log) => log.action === 'update').length,
      deletes: logs.filter((log) => log.action === 'delete').length,
    };
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Audit Logs</h2>
          <p className="mt-1 text-slate-500">
            Review crop, user, and report changes captured from the live admin workflows.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void fetchLogs()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            onClick={() =>
              void exportAuditLogs({
                q: searchTerm,
                entityType,
                action,
              })
            }
            className="rounded-lg bg-[#13515e] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#13515e]/15 transition-colors hover:bg-[#13515e]/90"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Logs in current query</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? '...' : total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Creates on this page</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{summary.creates}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Updates on this page</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{summary.updates}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Deletes on this page</p>
          <p className="mt-2 text-2xl font-bold text-red-700">{summary.deletes}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="min-w-[280px] flex-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 outline-none transition-all focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
              placeholder="Search actor, entity, or description..."
              type="text"
              value={searchTerm}
              onChange={(event) => updateQuery({ q: event.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={entityType}
            onChange={(event) => updateQuery({ entity: event.target.value as AuditEntityType })}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
          >
            <option value="all">All entities</option>
            <option value="crop">Crops</option>
            <option value="user">Users</option>
            <option value="report">Reports</option>
          </select>
          <select
            value={action}
            onChange={(event) => updateQuery({ action: event.target.value as AuditAction })}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
          >
            <option value="all">All actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <article
            key={log.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${entityBadge(log.entity_type)}`}>
                    {log.entity_type}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${actionBadge(log.action)}`}>
                    {log.action}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{log.description}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {log.actor_name || 'System'}
                    {log.actor_email ? ` (${log.actor_email})` : ''}
                    {log.actor_role ? ` - ${log.actor_role}` : ''}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <span className="font-semibold text-slate-900">Entity</span>: {log.entity_label || log.entity_id || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">When</span>:{' '}
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <details className="w-full max-w-xl rounded-xl bg-slate-50 p-4 lg:w-auto">
                <summary className="cursor-pointer text-sm font-semibold text-[#13515e]">
                  View technical details
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-slate-600">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </details>
            </div>
          </article>
        ))}
      </div>

      {!loading && logs.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          No audit logs match the current filters.
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => updateQuery({ page: Math.max(1, page - 1) })}
            disabled={page <= 1}
            className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all disabled:opacity-50 hover:bg-[#13515e]/5"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="min-w-10 rounded-lg bg-[#13515e] px-4 py-2 text-sm font-bold text-white shadow-sm">
            {page}
          </button>
          <button
            onClick={() => updateQuery({ page: Math.min(totalPages, page + 1) })}
            disabled={page >= totalPages}
            className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all disabled:opacity-50 hover:bg-[#13515e]/5"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAudit;

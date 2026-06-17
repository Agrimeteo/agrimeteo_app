import api from './api';
import { exportRowsToCsv } from './adminTools';

export type AuditEntityType = 'all' | 'crop' | 'user' | 'report';
export type AuditAction = 'all' | 'create' | 'update' | 'delete';

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_name: string | null;
  actor_role: string | null;
  entity_type: Exclude<AuditEntityType, 'all'>;
  entity_id: string | null;
  entity_label: string | null;
  action: Exclude<AuditAction, 'all'>;
  description: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  q?: string;
  entityType?: AuditEntityType;
  action?: AuditAction;
}

// Frontend-backend workflow:
// - The admin page sends search/filter/pagination to the backend.
// - The backend filters directly in Supabase, then returns a paginated payload.
export const fetchAdminAuditLogs = async (filters: AuditLogFilters = {}) => {
  const { data } = await api.get('/admin/audit-logs', {
    params: {
      page: filters.page ?? 1,
      limit: filters.limit ?? 12,
      q: filters.q || undefined,
      entityType: filters.entityType && filters.entityType !== 'all' ? filters.entityType : undefined,
      action: filters.action && filters.action !== 'all' ? filters.action : undefined,
    },
  });

  return {
    items: (data.data ?? []) as AuditLog[],
    pagination: (data.pagination ?? {
      page: 1,
      limit: filters.limit ?? 12,
      total: 0,
      totalPages: 1,
    }) as AuditLogPagination,
  };
};

export const exportAuditLogs = async (filters: AuditLogFilters = {}) => {
  const { items } = await fetchAdminAuditLogs({
    ...filters,
    page: 1,
    limit: 1000,
  });

  exportRowsToCsv(
    `admin-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`,
    items.map((log) => ({
      created_at: new Date(log.created_at).toLocaleString(),
      actor_name: log.actor_name || 'System',
      actor_email: log.actor_email || '',
      actor_role: log.actor_role || '',
      entity_type: log.entity_type,
      action: log.action,
      entity_label: log.entity_label || log.entity_id || '',
      description: log.description,
    })),
  );
};

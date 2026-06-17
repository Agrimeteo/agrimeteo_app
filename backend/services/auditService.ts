import { supabaseServiceClient } from '../config/supabase.js';
import type {
  AuditLogFilters,
  AuditLogInput,
  AuditLogRecord,
} from '../types/audit.js';

const sanitizeSearch = (value: string) => value.replace(/[%_,]/g, ' ').trim();

const applyAuditFilters = (
  query: any,
  filters: AuditLogFilters,
) => {
  let nextQuery: any = query;

  if (filters.entityType && filters.entityType !== 'all') {
    nextQuery = nextQuery.eq('entity_type', filters.entityType);
  }

  if (filters.action && filters.action !== 'all') {
    nextQuery = nextQuery.eq('action', filters.action);
  }

  if (filters.search) {
    const escapedSearch = sanitizeSearch(filters.search);
    if (escapedSearch) {
      nextQuery = nextQuery.or(
        `actor_name.ilike.%${escapedSearch}%,actor_email.ilike.%${escapedSearch}%,entity_label.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`,
      );
    }
  }

  return nextQuery;
};

// Integration note:
// Controllers call this helper right after a successful write action so the
// audit trail mirrors the data that actually reached Supabase.
export const recordAuditLog = async (input: AuditLogInput) => {
  const payload = {
    actor_user_id: input.actor?.id ?? null,
    actor_email: input.actor?.email ?? null,
    actor_name: input.actor?.full_name ?? null,
    actor_role: input.actor?.role ?? null,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    entity_label: input.entityLabel ?? null,
    action: input.action,
    description: input.description,
    details: input.details ?? {},
  };

  const { error } = await supabaseServiceClient.from('admin_audit_logs').insert(payload);

  if (error) {
    throw new Error(`Unable to record audit log: ${error.message}`);
  }
};

// Auditing should never break the primary business action. We log failures to
// the server console so the app keeps working even if the audit table is not ready.
export const safeRecordAuditLog = async (input: AuditLogInput) => {
  try {
    await recordAuditLog(input);
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

export const getAuditLogs = async (filters: AuditLogFilters) => {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || 20));
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const baseDataQuery = supabaseServiceClient
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(start, end);

  const baseCountQuery = supabaseServiceClient
    .from('admin_audit_logs')
    .select('*', { count: 'exact', head: true });

  const [dataResult, countResult] = await Promise.all([
    applyAuditFilters(baseDataQuery, filters),
    applyAuditFilters(baseCountQuery, filters),
  ]);

  if (dataResult.error) {
    throw new Error(`Unable to fetch audit logs: ${dataResult.error.message}`);
  }

  if (countResult.error) {
    throw new Error(`Unable to count audit logs: ${countResult.error.message}`);
  }

  const total = countResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: (dataResult.data ?? []) as AuditLogRecord[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

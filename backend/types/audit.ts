export type AuditEntityType = 'crop' | 'user' | 'report';
export type AuditAction = 'create' | 'update' | 'delete';

export interface AuditActor {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
}

export interface AuditLogInput {
  actor?: AuditActor;
  entityType: AuditEntityType;
  entityId?: string | null;
  entityLabel?: string | null;
  action: AuditAction;
  description: string;
  details?: Record<string, unknown>;
}

export interface AuditLogFilters {
  page: number;
  limit: number;
  search?: string;
  entityType?: AuditEntityType | 'all';
  action?: AuditAction | 'all';
}

export interface AuditLogRecord {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_name: string | null;
  actor_role: string | null;
  entity_type: AuditEntityType;
  entity_id: string | null;
  entity_label: string | null;
  action: AuditAction;
  description: string;
  details: Record<string, unknown>;
  created_at: string;
}

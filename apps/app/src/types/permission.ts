export const PERMISSION_CODES = [
  'crops.create',
  'crops.read',
  'crops.update',
  'crops.delete',
  'users.create',
  'users.read',
  'users.update',
  'users.delete',
  'reports.create',
  'reports.read',
  'reports.update',
  'reports.delete',
  'settings.create',
  'settings.read',
  'settings.update',
  'settings.delete',
  'permissions.read',
  'permissions.update',
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];
export type AppRole = 'admin' | 'farmer' | 'beginner';
export type PermissionState = Record<PermissionCode, boolean>;

export interface PermissionDefinition {
  code: PermissionCode;
  resource: string;
  action: string;
  description: string;
}

export interface RolePermissionsPayload {
  role: AppRole;
  permissions: PermissionState;
}

export interface PermissionsMatrixResponse {
  definitions: PermissionDefinition[];
  roles: Record<AppRole, PermissionState>;
}

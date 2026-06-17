export const APP_ROLES = ['admin', 'farmer', 'beginner'] as const;
export type AppRole = (typeof APP_ROLES)[number];

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

export interface PermissionDefinition {
  code: PermissionCode;
  resource: string;
  action: string;
  description: string;
}

export type PermissionState = Record<PermissionCode, boolean>;

export interface RolePermissionsPayload {
  role: AppRole;
  permissions: PermissionState;
}

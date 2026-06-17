import { supabaseServiceClient } from '../config/supabase.js';
import type {
  AppRole,
  PermissionCode,
  PermissionDefinition,
  PermissionState,
  RolePermissionsPayload,
} from '../types/permission.js';
import { APP_ROLES, PERMISSION_CODES } from '../types/permission.js';

const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { code: 'crops.create', resource: 'crops', action: 'create', description: 'Create crops' },
  { code: 'crops.read', resource: 'crops', action: 'read', description: 'Read crops' },
  { code: 'crops.update', resource: 'crops', action: 'update', description: 'Update crops' },
  { code: 'crops.delete', resource: 'crops', action: 'delete', description: 'Delete crops' },
  { code: 'users.create', resource: 'users', action: 'create', description: 'Create users' },
  { code: 'users.read', resource: 'users', action: 'read', description: 'Read users' },
  { code: 'users.update', resource: 'users', action: 'update', description: 'Update users' },
  { code: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users' },
  { code: 'reports.create', resource: 'reports', action: 'create', description: 'Create reports' },
  { code: 'reports.read', resource: 'reports', action: 'read', description: 'Read reports' },
  { code: 'reports.update', resource: 'reports', action: 'update', description: 'Update reports' },
  { code: 'reports.delete', resource: 'reports', action: 'delete', description: 'Delete reports' },
  { code: 'settings.create', resource: 'settings', action: 'create', description: 'Create settings' },
  { code: 'settings.read', resource: 'settings', action: 'read', description: 'Read settings' },
  { code: 'settings.update', resource: 'settings', action: 'update', description: 'Update settings' },
  { code: 'settings.delete', resource: 'settings', action: 'delete', description: 'Delete settings' },
  {
    code: 'permissions.read',
    resource: 'permissions',
    action: 'read',
    description: 'Read permission rules',
  },
  {
    code: 'permissions.update',
    resource: 'permissions',
    action: 'update',
    description: 'Update permission rules',
  },
];

const createEmptyPermissionState = (): PermissionState =>
  PERMISSION_CODES.reduce((accumulator, code) => {
    accumulator[code] = false;
    return accumulator;
  }, {} as PermissionState);

const DEFAULT_ROLE_PERMISSIONS: Record<AppRole, PermissionState> = {
  admin: {
    ...createEmptyPermissionState(),
    ...PERMISSION_CODES.reduce((accumulator, code) => {
      accumulator[code] = true;
      return accumulator;
    }, {} as PermissionState),
  },
  farmer: {
    ...createEmptyPermissionState(),
    'crops.create': true,
    'crops.read': true,
    'crops.update': true,
    'crops.delete': true,
    'reports.create': true,
    'reports.read': true,
    'settings.read': true,
    'settings.update': true,
  },
  beginner: {
    ...createEmptyPermissionState(),
    'crops.create': true,
    'crops.read': true,
    'reports.create': true,
    'reports.read': true,
    'settings.read': true,
    'settings.update': true,
  },
};

const isAppRole = (value: string): value is AppRole => APP_ROLES.includes(value as AppRole);

const ensureAppRole = (role: string): AppRole => {
  if (!isAppRole(role)) {
    throw new Error(`Unsupported role: ${role}`);
  }
  return role;
};

const buildPermissionState = (
  rows: Array<{ permission_code: string; allowed: boolean }> | null | undefined,
  role: AppRole,
) => {
  const state = { ...DEFAULT_ROLE_PERMISSIONS[role] };

  for (const row of rows ?? []) {
    if (PERMISSION_CODES.includes(row.permission_code as PermissionCode)) {
      state[row.permission_code as PermissionCode] = row.allowed;
    }
  }

  return state;
};

const fetchRolePermissionRows = async (role: AppRole) => {
  const { data, error } = await supabaseServiceClient
    .from('role_permissions')
    .select('permission_code, allowed')
    .eq('role', role);

  if (error) {
    if (
      error.message.includes('relation') ||
      error.message.includes('permission denied') ||
      error.message.includes('does not exist')
    ) {
      return null;
    }

    throw new Error(`Unable to load role permissions: ${error.message}`);
  }

  return data;
};

export const getPermissionDefinitions = async () => {
  const { data, error } = await supabaseServiceClient
    .from('permissions_catalog')
    .select('code, resource, action, description')
    .order('resource', { ascending: true });

  if (error) {
    if (
      error.message.includes('relation') ||
      error.message.includes('permission denied') ||
      error.message.includes('does not exist')
    ) {
      return PERMISSION_DEFINITIONS;
    }

    throw new Error(`Unable to load permissions catalog: ${error.message}`);
  }

  return ((data as PermissionDefinition[] | null) ?? PERMISSION_DEFINITIONS).filter((permission) =>
    PERMISSION_CODES.includes(permission.code),
  );
};

export const getRolePermissions = async (role: string): Promise<RolePermissionsPayload> => {
  const normalizedRole = ensureAppRole(role);
  const rows = await fetchRolePermissionRows(normalizedRole);
  return {
    role: normalizedRole,
    permissions: buildPermissionState(rows as Array<{ permission_code: string; allowed: boolean }> | null, normalizedRole),
  };
};

export const roleHasPermission = async (role: string | null | undefined, permissionCode: PermissionCode) => {
  if (!role || !isAppRole(role)) {
    return false;
  }

  const rolePermissions = await getRolePermissions(role);
  return rolePermissions.permissions[permissionCode] === true;
};

export const getPermissionsMatrix = async () => {
  const [definitions, admin, farmer, beginner] = await Promise.all([
    getPermissionDefinitions(),
    getRolePermissions('admin'),
    getRolePermissions('farmer'),
    getRolePermissions('beginner'),
  ]);

  return {
    definitions,
    roles: {
      admin: admin.permissions,
      farmer: farmer.permissions,
      beginner: beginner.permissions,
    },
  };
};

export const updateRolePermissions = async (
  role: string,
  permissions: Partial<Record<PermissionCode, boolean>>,
) => {
  const normalizedRole = ensureAppRole(role);
  const entries = Object.entries(permissions).filter(([code]) =>
    PERMISSION_CODES.includes(code as PermissionCode),
  ) as Array<[PermissionCode, boolean]>;

  if (!entries.length) {
    return getRolePermissions(normalizedRole);
  }

  const payload = entries.map(([permissionCode, allowed]) => ({
    role: normalizedRole,
    permission_code: permissionCode,
    allowed: !!allowed,
  }));

  const { error } = await supabaseServiceClient
    .from('role_permissions')
    .upsert(payload, { onConflict: 'role,permission_code' });

  if (error) {
    throw new Error(`Unable to update role permissions: ${error.message}`);
  }

  return getRolePermissions(normalizedRole);
};

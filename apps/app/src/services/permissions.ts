import api from './api';
import type {
  PermissionState,
  PermissionsMatrixResponse,
  RolePermissionsPayload,
} from '../types/permission';
import { PERMISSION_CODES } from '../types/permission';

const createEmptyPermissionState = (): PermissionState =>
  PERMISSION_CODES.reduce((accumulator, code) => {
    accumulator[code] = false;
    return accumulator;
  }, {} as PermissionState);

const normalizePermissionState = (incoming?: Partial<PermissionState> | null) => ({
  ...createEmptyPermissionState(),
  ...(incoming ?? {}),
});

// Frontend-backend workflow:
// - Load the current role permissions after authentication.
// - Keep the backend as the final authority for every protected API call.
export const fetchCurrentUserPermissions = async () => {
  const { data } = await api.get('/permissions/me');
  const payload = (data.data ?? {}) as RolePermissionsPayload;

  return {
    role: payload.role,
    permissions: normalizePermissionState(payload.permissions),
  } as RolePermissionsPayload;
};

export const fetchPermissionsMatrix = async () => {
  const { data } = await api.get('/admin/permissions');
  const payload = (data.data ?? {}) as PermissionsMatrixResponse;

  return {
    definitions: payload.definitions ?? [],
    roles: {
      admin: normalizePermissionState(payload.roles?.admin),
      farmer: normalizePermissionState(payload.roles?.farmer),
      beginner: normalizePermissionState(payload.roles?.beginner),
    },
  } as PermissionsMatrixResponse;
};

export const saveRolePermissions = async (
  role: RolePermissionsPayload['role'],
  permissions: PermissionState,
) => {
  const { data } = await api.put(`/admin/permissions/${role}`, { permissions });
  const payload = (data.data ?? {}) as RolePermissionsPayload;

  return {
    role: payload.role,
    permissions: normalizePermissionState(payload.permissions),
  } as RolePermissionsPayload;
};

export const updateUserRole = async (userId: string, role: RolePermissionsPayload['role']) => {
  const { data } = await api.put(`/admin/users/${userId}`, { role });
  return data.data;
};

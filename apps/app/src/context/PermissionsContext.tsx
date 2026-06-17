import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchCurrentUserPermissions } from '../services/permissions';
import type { AppRole, PermissionCode, PermissionState } from '../types/permission';
import { PERMISSION_CODES } from '../types/permission';

interface PermissionsContextType {
  permissions: PermissionState;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
  hasPermission: (permissionCode: PermissionCode) => boolean;
}

const createEmptyPermissionState = (): PermissionState =>
  PERMISSION_CODES.reduce((accumulator, code) => {
    accumulator[code] = false;
    return accumulator;
  }, {} as PermissionState);

const createFullPermissionState = (): PermissionState =>
  PERMISSION_CODES.reduce((accumulator, code) => {
    accumulator[code] = true;
    return accumulator;
  }, {} as PermissionState);

const getDefaultPermissionsForRole = (role: AppRole | null): PermissionState => {
  switch (role) {
    case 'admin':
      return createFullPermissionState();
    case 'farmer':
      return {
        ...createEmptyPermissionState(),
        'crops.create': true,
        'crops.read': true,
        'crops.update': true,
        'crops.delete': true,
        'reports.create': true,
        'reports.read': true,
        'settings.read': true,
        'settings.update': true,
      };
    case 'beginner':
      return {
        ...createEmptyPermissionState(),
        'crops.create': true,
        'crops.read': true,
        'reports.create': true,
        'reports.read': true,
        'settings.read': true,
        'settings.update': true,
      };
    default:
      return createEmptyPermissionState();
  }
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token, role } = useAuth();
  const [permissions, setPermissions] = useState<PermissionState>(getDefaultPermissionsForRole(role));
  const [loading, setLoading] = useState(false);

  const refreshPermissions = async () => {
    if (!isAuthenticated || !token) {
      setPermissions(createEmptyPermissionState());
      return;
    }

    try {
      setLoading(true);
      const response = await fetchCurrentUserPermissions();
      setPermissions(response.permissions);
    } catch (error) {
      console.error('Unable to load current user permissions:', error);
      setPermissions(getDefaultPermissionsForRole(role));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPermissions(getDefaultPermissionsForRole(role));
  }, [role]);

  useEffect(() => {
    void refreshPermissions();
  }, [isAuthenticated, token, role]);

  const value = useMemo(
    () => ({
      permissions,
      loading,
      refreshPermissions,
      hasPermission: (permissionCode: PermissionCode) => permissions[permissionCode] === true,
    }),
    [loading, permissions],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }

  return context;
};

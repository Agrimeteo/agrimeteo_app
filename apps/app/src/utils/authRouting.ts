export type AppRole = 'farmer' | 'beginner' | 'admin' | null;
export type SelectableRole = Exclude<AppRole, null>;

export const normalizeRole = (role?: string | null): AppRole => {
  if (role === 'farmer' || role === 'beginner' || role === 'admin') {
    return role;
  }

  return null;
};

export const requiresRoleSelection = (role: AppRole) => role === null;

export const getRouteForRole = (role: AppRole) => {
  if (role === 'admin') {
    return '/admin/dashboard';
  }

  if (role === 'farmer') {
    return '/farmer-dashboard';
  }

  if (role === 'beginner') {
    return '/beginner-dashboard';
  }

  return '/role-selection';
};

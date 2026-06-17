import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { fetchPermissionsMatrix, saveRolePermissions, updateUserRole } from '../../services/permissions';
import type {
  AppRole,
  PermissionCode,
  PermissionDefinition,
  PermissionsMatrixResponse,
} from '../../types/permission';

interface AdminUserRow {
  id: string;
  full_name: string;
  email: string;
  role: AppRole;
}

const ROLE_ORDER: AppRole[] = ['admin', 'farmer', 'beginner'];

const AdminPermissions: React.FC = () => {
  const [definitions, setDefinitions] = useState<PermissionDefinition[]>([]);
  const [matrix, setMatrix] = useState<PermissionsMatrixResponse['roles'] | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [savingPermissionsForRole, setSavingPermissionsForRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  const setMessage = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [permissionsResponse, usersResponse] = await Promise.all([
        fetchPermissionsMatrix(),
        api.get('/admin/users?limit=200'),
      ]);

      setDefinitions(permissionsResponse.definitions);
      setMatrix(permissionsResponse.roles);
      setUsers((usersResponse.data.data ?? []) as AdminUserRow[]);
    } catch (error) {
      console.error('Unable to load permission management data:', error);
      setMessage('Unable to load permission management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const groupedDefinitions = useMemo(() => {
    return definitions.reduce<Record<string, PermissionDefinition[]>>((accumulator, definition) => {
      if (!accumulator[definition.resource]) {
        accumulator[definition.resource] = [];
      }
      accumulator[definition.resource].push(definition);
      return accumulator;
    }, {});
  }, [definitions]);

  const togglePermission = (role: AppRole, code: PermissionCode) => {
    setMatrix((current) => {
      if (!current) return current;
      return {
        ...current,
        [role]: {
          ...current[role],
          [code]: !current[role][code],
        },
      };
    });
  };

  const persistRolePermissions = async (role: AppRole) => {
    if (!matrix) return;
    try {
      setSavingPermissionsForRole(role);
      const updated = await saveRolePermissions(role, matrix[role]);
      setMatrix((current) =>
        current
          ? {
              ...current,
              [role]: updated.permissions,
            }
          : current,
      );
      setMessage(`Permissions saved for ${role}.`);
    } catch (error) {
      console.error('Unable to save role permissions:', error);
      setMessage(`Unable to save permissions for ${role}.`);
    } finally {
      setSavingPermissionsForRole(null);
    }
  };

  const persistUserRole = async (userId: string, role: AppRole) => {
    try {
      setSavingRole(userId);
      await updateUserRole(userId, role);
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === userId ? { ...user, role } : user)),
      );
      setMessage('User role updated.');
    } catch (error) {
      console.error('Unable to update user role:', error);
      setMessage('Unable to update user role.');
    } finally {
      setSavingRole(null);
    }
  };

  if (loading || !matrix) {
    return <div className="p-8">Loading permissions...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Roles and Permissions</h2>
          <p className="mt-1 text-slate-500">
            Manage role assignments and the permission matrix used by both the frontend and backend guards.
          </p>
        </div>
        <button
          onClick={() => void loadData()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {feedback && (
        <div className="rounded-xl border border-[#71B280]/20 bg-[#71B280]/10 px-4 py-3 text-sm text-[#13515e]">
          {feedback}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-xl font-bold text-slate-900">User role assignments</h3>
          <p className="text-sm text-slate-500">These profile roles drive the effective permission checks at runtime.</p>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">{user.full_name || 'Unknown user'}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={user.role}
                  onChange={(event) => void persistUserRole(user.id, event.target.value as AppRole)}
                  disabled={savingRole === user.id}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#13515e] focus:ring-2 focus:ring-[#13515e]/10"
                >
                  {ROLE_ORDER.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {savingRole === user.id && <span className="text-sm text-slate-500">Saving...</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-xl font-bold text-slate-900">Permission matrix</h3>
          <p className="text-sm text-slate-500">
            These rules are stored in Supabase and enforced by route guards on both sides of the app.
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedDefinitions).map(([resource, resourceDefinitions]) => (
            <div key={resource}>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-lg font-semibold capitalize text-slate-900">{resource}</h4>
                <div className="flex gap-2">
                  {ROLE_ORDER.map((role) => (
                    <button
                      key={role}
                      onClick={() => void persistRolePermissions(role)}
                      disabled={savingPermissionsForRole === role}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                    >
                      {savingPermissionsForRole === role ? `Saving ${role}...` : `Save ${role}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <div className="px-4 py-3">Permission</div>
                  {ROLE_ORDER.map((role) => (
                    <div key={role} className="px-4 py-3 text-center">
                      {role}
                    </div>
                  ))}
                </div>

                {resourceDefinitions.map((definition) => (
                  <div
                    key={definition.code}
                    className="grid grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] border-t border-slate-200 bg-white"
                  >
                    <div className="px-4 py-4">
                      <p className="font-medium text-slate-900">{definition.description}</p>
                      <p className="text-xs text-slate-500">{definition.code}</p>
                    </div>
                    {ROLE_ORDER.map((role) => (
                      <label
                        key={role}
                        className="flex items-center justify-center px-4 py-4"
                      >
                        <input
                          type="checkbox"
                          checked={matrix[role][definition.code]}
                          onChange={() => togglePermission(role, definition.code)}
                          className="h-4 w-4 rounded border-slate-300 text-[#13515e] focus:ring-[#13515e]/30"
                        />
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPermissions;

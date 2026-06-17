import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import api from '../services/api';
import {
  authEvents,
  clearStoredAuth,
  getStoredSession,
  getStoredUser,
  persistAuth,
  updateStoredUser,
} from '../services/authStorage';
import { isSupabaseConfigured, supabase, syncSupabaseSession } from '../services/supabase';
import {
  AppRole as Role,
  SelectableRole,
  normalizeRole,
  requiresRoleSelection,
} from '../utils/authRouting';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  initializing: boolean;
  needsRoleSelection: boolean;
  login: (email: string, password: string, expectedRole?: SelectableRole) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  completeOAuthSession: () => Promise<User>;
  completeRoleSelection: (role: SelectableRole) => Promise<User>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => Promise<void>;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null) {
    const maybeAxiosError = error as {
      response?: { data?: { error?: string; message?: string } };
      message?: string;
    };

    return (
      maybeAxiosError.response?.data?.error ||
      maybeAxiosError.response?.data?.message ||
      maybeAxiosError.message ||
      fallback
    );
  }

  return fallback;
};

const getDisplayName = (authUser: SupabaseUser, fallback?: string | null) => {
  const metadata = authUser.user_metadata as Record<string, unknown>;
  return (
    fallback ||
    (typeof metadata.full_name === 'string' ? metadata.full_name : null) ||
    authUser.email?.split('@')[0] ||
    'User'
  );
};

const createUserFromProfile = (authUser: SupabaseUser, profile?: Record<string, unknown> | null): User => {
  const profileRole = typeof profile?.role === 'string' ? profile.role : null;
  const profileName = typeof profile?.full_name === 'string' ? profile.full_name : null;
  const profileEmail = typeof profile?.email === 'string' ? profile.email : null;
  const avatar = typeof profile?.avatar_url === 'string' ? profile.avatar_url : undefined;

  return {
    id: authUser.id,
    name: getDisplayName(authUser, profileName),
    email: profileEmail || authUser.email || '',
    role: normalizeRole(profileRole),
    avatar,
  };
};

const toStoredSession = (session: Session) => ({
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
  expiresAt: session.expires_at ?? null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    const syncAuthState = () => {
      const savedUser = getStoredUser();
      const savedSession = getStoredSession();

      if (!active) {
        return;
      }

      setUser(savedUser);
      setRoleState(savedUser?.role ?? null);
      setToken(savedSession?.accessToken ?? null);
    };

    const recoverStoredSession = async () => {
      const savedSession = getStoredSession();

      if (!savedSession || !isSupabaseConfigured) {
        return;
      }

      try {
        await syncSupabaseSession(savedSession.accessToken, savedSession.refreshToken);
        const { data } = await supabase.auth.getSession();

        if (data.session && active) {
          await hydrateAuthenticatedUser(data.session.user, data.session);
          return;
        }
      } catch {
        // Fall through to cleanup when a stored session cannot be restored.
      }

      clearStoredAuth();
      if (active) {
        setUser(null);
        setRoleState(null);
        setToken(null);
      }
    };

    const bootstrap = async () => {
      syncAuthState();

      const savedUser = getStoredUser();
      const savedSession = getStoredSession();

      if (savedSession) {
        await recoverStoredSession();
      } else if (!savedSession && isSupabaseConfigured) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session && active) {
            await hydrateAuthenticatedUser(data.session.user, data.session);
          }
        } catch {
          // Ignore bootstrap sync failures and fall back to stored auth only.
        }
      }

      if (active) {
        setInitializing(false);
      }
    };

    void bootstrap();
    window.addEventListener(authEvents.changed, syncAuthState);

    return () => {
      active = false;
      window.removeEventListener(authEvents.changed, syncAuthState);
    };
  }, []);

  const hydrateAuthenticatedUser = async (authUser: SupabaseUser, session: Session) => {
    await syncSupabaseSession(session.access_token, session.refresh_token).catch(() => undefined);
    const storedUser = getStoredUser();

    let resolvedUser: User = {
      id: authUser.id,
      name: getDisplayName(authUser),
      email: authUser.email || '',
      role: normalizeRole(
        typeof (authUser.user_metadata as Record<string, unknown>)?.role === 'string'
          ? ((authUser.user_metadata as Record<string, unknown>).role as string)
          : null
      ),
    };

    try {
      const response = await api.post(
        '/profile/sync',
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      resolvedUser = createUserFromProfile(authUser, response.data?.data ?? null);
    } catch {
      const fallbackRole =
        storedUser?.id === authUser.id && storedUser.role
          ? storedUser.role
          : normalizeRole(
              typeof (authUser.user_metadata as Record<string, unknown>)?.role === 'string'
                ? ((authUser.user_metadata as Record<string, unknown>).role as string)
                : null
            );

      resolvedUser = {
        id: authUser.id,
        name: storedUser?.id === authUser.id ? storedUser.name : getDisplayName(authUser),
        email: storedUser?.id === authUser.id ? storedUser.email : authUser.email || '',
        role: fallbackRole,
        avatar: storedUser?.id === authUser.id ? storedUser.avatar : undefined,
      };
    }

    setUser(resolvedUser);
    setRoleState(resolvedUser.role);
    setToken(session.access_token);
    persistAuth(resolvedUser, toStoredSession(session));

    return resolvedUser;
  };

  const login = async (email: string, password: string, expectedRole?: SelectableRole) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      const session = data.session as Session | undefined;
      const authUser = data.user as SupabaseUser | undefined;

      if (!session?.access_token || !session.refresh_token || !authUser) {
        throw new Error('No active session returned by the server');
      }

      const resolvedUser = await hydrateAuthenticatedUser(authUser, session);

      if (expectedRole && resolvedUser.role !== expectedRole) {
        await logout();
        throw new Error('This account does not have access to this dashboard.');
      }

      return resolvedUser;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(getApiErrorMessage(error, 'Login failed'));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        full_name: name,
      });
      const { data } = response.data;
      const session = data.session as Session | undefined;
      const authUser = data.user as SupabaseUser | undefined;

      if (!session?.access_token || !session.refresh_token || !authUser) {
        throw new Error('Registration succeeded, but no session was returned. Please log in.');
      }

      return await hydrateAuthenticatedUser(authUser, session);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(getApiErrorMessage(error, 'Registration failed'));
    }
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Google sign-in is not configured yet.');
    }

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.url) {
      window.location.assign(data.url);
    }
  };

  const completeOAuthSession = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Google sign-in is not configured yet.');
    }

    let session = (await supabase.auth.getSession()).data.session;

    if (!session) {
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      session = (await supabase.auth.getSession()).data.session;
    }

    if (!session) {
      throw new Error('No active Google session was returned.');
    }

    return hydrateAuthenticatedUser(session.user, session);
  };

  const completeRoleSelection = async (selectedRole: SelectableRole) => {
    if (!user || !token) {
      throw new Error('You must be logged in before selecting a role.');
    }

    const response = await api.put('/profile', { role: selectedRole });
    const profile = response.data?.data as Record<string, unknown> | undefined;
    const updatedUser: User = {
      ...user,
      role: selectedRole,
      name: typeof profile?.full_name === 'string' ? profile.full_name : user.name,
      email: typeof profile?.email === 'string' ? profile.email : user.email,
      avatar: typeof profile?.avatar_url === 'string' ? profile.avatar_url : user.avatar,
    };

    setUser(updatedUser);
    setRoleState(selectedRole);
    updateStoredUser(updatedUser);
    return updatedUser;
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const updatedUser = { ...currentUser, ...updates };
      updateStoredUser(updatedUser);
      return updatedUser;
    });
  };

  const logout = async () => {
    setUser(null);
    setRoleState(null);
    setToken(null);
    clearStoredAuth();

    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => undefined);
    }
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      updateStoredUser(updated);
    }
  };

  const isAuthenticated = !!user && !!token;
  const needsRoleSelection = isAuthenticated && requiresRoleSelection(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        initializing,
        needsRoleSelection,
        login,
        register,
        loginWithGoogle,
        completeOAuthSession,
        completeRoleSelection,
        updateUser,
        logout,
        setRole,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

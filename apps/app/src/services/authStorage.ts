import type { AppRole } from '../utils/authRouting';

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatar?: string;
};

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
};

const USER_KEY = 'agro_user';
const TOKEN_KEY = 'agro_token';
const REFRESH_TOKEN_KEY = 'agro_refresh_token';
const EXPIRES_AT_KEY = 'agro_expires_at';
const AUTH_CHANGED_EVENT = 'agro-auth-changed';

const emitAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const authEvents = {
  changed: AUTH_CHANGED_EVENT,
};

export const getStoredUser = (): StoredUser | null => {
  const savedUser = localStorage.getItem(USER_KEY);
  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as StoredUser;
  } catch {
    return null;
  }
};

export const getStoredSession = (): StoredSession | null => {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const expiresAtRaw = localStorage.getItem(EXPIRES_AT_KEY);

  if (!accessToken || !refreshToken) {
    return null;
  }

  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : null;

  return {
    accessToken,
    refreshToken,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
  };
};

export const persistAuth = (user: StoredUser, session: StoredSession) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  if (session.expiresAt) {
    localStorage.setItem(EXPIRES_AT_KEY, String(session.expiresAt));
  } else {
    localStorage.removeItem(EXPIRES_AT_KEY);
  }
  emitAuthChanged();
};

export const updateStoredSession = (session: StoredSession) => {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  if (session.expiresAt) {
    localStorage.setItem(EXPIRES_AT_KEY, String(session.expiresAt));
  } else {
    localStorage.removeItem(EXPIRES_AT_KEY);
  }
  emitAuthChanged();
};

export const updateStoredUser = (user: StoredUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitAuthChanged();
};

export const clearStoredAuth = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  emitAuthChanged();
};

export const isSessionExpired = (session: StoredSession | null, skewSeconds = 30) => {
  if (!session?.expiresAt) {
    return false;
  }

  return session.expiresAt <= Math.floor(Date.now() / 1000) + skewSeconds;
};

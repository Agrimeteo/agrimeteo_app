import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  clearStoredAuth,
  getStoredSession,
  isSessionExpired,
  updateStoredSession,
} from './authStorage';
import { syncSupabaseSession } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

const isAuthRoute = (url?: string) =>
  !!url && ['/auth/login', '/auth/register', '/auth/refresh'].some((route) => url.includes(route));

const refreshAccessToken = async (): Promise<string | null> => {
  const session = getStoredSession();
  if (!session?.refreshToken) {
    clearStoredAuth();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${api.defaults.baseURL}/auth/refresh`, {
        refreshToken: session.refreshToken,
      })
      .then((response) => {
        const nextSession = response.data?.data?.session;
        const accessToken = nextSession?.access_token;
        const refreshToken = nextSession?.refresh_token;

        if (!accessToken || !refreshToken) {
          throw new Error('No refreshed session returned by the server');
        }

        updateStoredSession({
          accessToken,
          refreshToken,
          expiresAt: nextSession?.expires_at ?? null,
        });

        void syncSupabaseSession(accessToken, refreshToken);

        return accessToken as string;
      })
      .catch(() => {
        clearStoredAuth();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (isAuthRoute(config.url)) {
    return config;
  }

  let session = getStoredSession();

  if (isSessionExpired(session)) {
    await refreshAccessToken();
    session = getStoredSession();
  }

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
    const isAuthRequest = isAuthRoute(originalRequest?.url);

    if (!isUnauthorized || !originalRequest || originalRequest._retry || isRefreshRequest || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const nextAccessToken = await refreshAccessToken();

    if (!nextAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
    return api(originalRequest);
  }
);

export default api;


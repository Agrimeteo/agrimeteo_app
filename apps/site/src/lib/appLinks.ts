const rawAppBaseUrl = import.meta.env.VITE_APP_URL?.trim();

export const appBaseUrl =
  rawAppBaseUrl && rawAppBaseUrl.length > 0
    ? rawAppBaseUrl.replace(/\/$/, '')
    : 'http://localhost:5173';

export const getAppUrl = (path: string) =>
  `${appBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
